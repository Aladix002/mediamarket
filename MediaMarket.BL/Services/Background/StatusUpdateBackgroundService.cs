using MediaMarket.BL.Interfaces;

namespace MediaMarket.BL.Services.Background;

/// <summary>
/// Background service pre automatickú archiváciu offers a uzatváranie orders na základe dátumov
/// </summary>
public class StatusUpdateBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<StatusUpdateBackgroundService> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromHours(1); // Kontrola každú hodinu

    public StatusUpdateBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<StatusUpdateBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("StatusUpdateBackgroundService started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var offerService = scope.ServiceProvider.GetRequiredService<IOfferService>();
                    var orderService = scope.ServiceProvider.GetRequiredService<IOrderService>();

                    // Archivuj offers s ValidTo < DateTime.UtcNow
                    var archivedCount = await offerService.ArchiveExpiredOffersAsync();
                    if (archivedCount > 0)
                    {
                        _logger.LogInformation($"Archived {archivedCount} expired offers");
                    }

                    // Uzatvor orders s PreferredTo < DateTime.UtcNow
                    var closedCount = await orderService.CloseExpiredOrdersAsync();
                    if (closedCount > 0)
                    {
                        _logger.LogInformation($"Closed {closedCount} expired orders");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating statuses");
            }

            // Počkaj pred ďalšou kontrolou
            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("StatusUpdateBackgroundService stopped");
    }
}
