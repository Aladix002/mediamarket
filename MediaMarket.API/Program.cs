using Microsoft.EntityFrameworkCore;
using MediaMarket.DAL;
using Supabase;
using MediaMarket.BL.Security;
using MediaMarket.BL.Interfaces;
using MediaMarket.API.Endpoints;
using MediaMarket.API.Validators;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// CORS - povol poziadavky z frontendu
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // V developmente povol všetky localhost porty a Docker IP adresy
            // Použij SetIsOriginAllowed pre flexibilnejšie riešenie
            policy.SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrEmpty(origin))
                    return false;

                // Povol localhost s akýmkoľvek portom
                if (origin.StartsWith("http://localhost:", StringComparison.OrdinalIgnoreCase) ||
                    origin.StartsWith("http://127.0.0.1:", StringComparison.OrdinalIgnoreCase))
                    return true;

                // Povol Docker IP adresy (172.x.x.x) s bežnými dev portmi
                if (origin.StartsWith("http://172.", StringComparison.OrdinalIgnoreCase))
                {
                    var uri = new Uri(origin);
                    var port = uri.Port;
                    // Povol bežné dev porty: 3000, 5173, 5174, 8080
                    return port == 3000 || port == 5173 || port == 5174 || port == 8080;
                }

                return false;
            })
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
        }
        else
        {
            // V produkcii len špecifické domény
            policy.WithOrigins("http://localhost:5173", "http://localhost:8080")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        }
    });
});

// Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// Supabase Client
var supabaseUrl = builder.Configuration["Supabase:Url"];
var supabaseKey = builder.Configuration["Supabase:AnonKey"];
if (!string.IsNullOrEmpty(supabaseUrl) && !string.IsNullOrEmpty(supabaseKey))
{
    builder.Services.AddSingleton(provider => new Supabase.Client(supabaseUrl, supabaseKey, new SupabaseOptions
    {
        AutoRefreshToken = true,
        AutoConnectRealtime = false
    }));
    builder.Services.AddScoped<IAuthService>(provider => 
    {
        var supabaseClient = provider.GetRequiredService<Supabase.Client>();
        return new SupabaseAuthService(supabaseClient, supabaseUrl, supabaseKey);
    });
}

// Email Service (Resend)
var resendApiKey = builder.Configuration["Email:ResendApiKey"];
var fromEmail = builder.Configuration["Email:FromEmail"] ?? "noreply@mediamarket.com";
var fromName = builder.Configuration["Email:FromName"] ?? "MediaMarket";

if (!string.IsNullOrEmpty(resendApiKey))
{
    builder.Services.AddHttpClient();
    builder.Services.AddScoped<IEmailService>(provider =>
    {
        var httpClientFactory = provider.GetRequiredService<IHttpClientFactory>();
        var httpClient = httpClientFactory.CreateClient();
        return new MediaMarket.BL.Services.Email.EmailService(httpClient, resendApiKey, fromEmail, fromName);
    });
}

// Validators
builder.Services.AddScoped<MediaMarket.API.Validators.RegisterRequestValidator>();
builder.Services.AddScoped<MediaMarket.API.Validators.LoginRequestValidator>();
builder.Services.AddScoped<MediaMarket.API.Validators.ChangePasswordRequestValidator>();
builder.Services.AddScoped<MediaMarket.API.Validators.ResetPasswordRequestValidator>();
builder.Services.AddScoped<MediaMarket.API.Validators.Users.CreateUserRequestValidator>();
builder.Services.AddScoped<MediaMarket.API.Validators.Users.UpdateUserRequestValidator>();
builder.Services.AddScoped<MediaMarket.API.Validators.Offers.CreateOfferRequestValidator>();
builder.Services.AddScoped<MediaMarket.API.Validators.Offers.UpdateOfferRequestValidator>();
builder.Services.AddScoped<MediaMarket.API.Validators.Orders.CreateOrderRequestValidator>();

// Business Logic Services
builder.Services.AddScoped<MediaMarket.BL.Interfaces.IUserService, MediaMarket.BL.Services.Users.UserService>();
builder.Services.AddScoped<MediaMarket.BL.Interfaces.IOfferService, MediaMarket.BL.Services.Offers.OfferService>();
builder.Services.AddScoped<MediaMarket.BL.Interfaces.IOrderService, MediaMarket.BL.Services.Orders.OrderService>();
builder.Services.AddScoped<MediaMarket.BL.Services.Orders.OrderCommissionService>();
builder.Services.AddScoped<MediaMarket.BL.Services.Orders.OrderPdfService>();

// Background Services
builder.Services.AddHostedService<MediaMarket.BL.Services.Background.StatusUpdateBackgroundService>();

// ARES Service
builder.Services.AddHttpClient<MediaMarket.BL.Interfaces.IARESService, MediaMarket.BL.Services.ARES.ARESService>();

// OpenAPI / Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "MediaMarket API",
        Version = "v1",
        Description = "API pre MediaMarket platformu - sprostredkovanie medzi mediami a agenturami",
        Contact = new()
        {
            Name = "MediaMarket",
            Email = "info@mediamarket.com"
        }
    });

    // Pridaj XML komentare ak existuju
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }

    // Enumy ako stringy v Swagger UI
    c.UseInlineDefinitionsForEnums();
    
    // Pridaj JSON serializer options pre enumy
    c.CustomSchemaIds(type => type.FullName?.Replace("+", "."));
});

var app = builder.Build();

// CORS middleware - musi byt na zaciatku, pred vsetkym ostatnym
app.UseCors();

// Initialize database with seed data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await MediaMarket.DAL.SeedData.DbInitializer.InitializeAsync(context);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "MediaMarket API v1");
        c.RoutePrefix = string.Empty; // Swagger UI na root URL
        c.DisplayRequestDuration();
        c.EnableDeepLinking();
        c.EnableFilter();
        c.ShowExtensions();
    });
}

app.MapControllers();

// Map endpoints
app.MapAuthEndpoints();
app.MapUserEndpoints();
app.MapOfferEndpoints();
app.MapOrderEndpoints();

app.Run();
