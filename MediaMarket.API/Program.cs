using Microsoft.EntityFrameworkCore;
using MediaMarket.DAL;
using Supabase;
using MediaMarket.BL.Security;
using MediaMarket.BL.Interfaces;
using MediaMarket.BL.Services.Email;
using Resend;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

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
    builder.Services.AddScoped<IAuthService, SupabaseAuthService>();
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

// Business Logic Services
builder.Services.AddScoped<MediaMarket.BL.Interfaces.IUserService, MediaMarket.BL.Services.Users.UserService>();
builder.Services.AddScoped<MediaMarket.BL.Interfaces.IOfferService, MediaMarket.BL.Services.Offers.OfferService>();
builder.Services.AddScoped<MediaMarket.BL.Interfaces.IOrderService, MediaMarket.BL.Services.Orders.OrderService>();
builder.Services.AddScoped<MediaMarket.BL.Services.Orders.OrderCommissionService>();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Initialize database with seed data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await MediaMarket.DAL.SeedData.DbInitializer.InitializeAsync(context);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapControllers();

app.Run();
