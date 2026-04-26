using System.Threading.Channels;

namespace SoulmateStore.Services.Implementations;

public interface IBackgroundNotificationQueue
{
    ValueTask EnqueueAsync(Func<IServiceProvider, CancellationToken, Task> workItem);
}

public class BackgroundNotificationQueue : IBackgroundNotificationQueue
{
    private readonly Channel<Func<IServiceProvider, CancellationToken, Task>> _queue =
        Channel.CreateBounded<Func<IServiceProvider, CancellationToken, Task>>(100);

    public ValueTask EnqueueAsync(Func<IServiceProvider, CancellationToken, Task> workItem)
    {
        return _queue.Writer.WriteAsync(workItem);
    }

    public async Task<Func<IServiceProvider, CancellationToken, Task>> DequeueAsync(CancellationToken ct)
    {
        return await _queue.Reader.ReadAsync(ct);
    }
}

public class NotificationQueueProcessor : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly BackgroundNotificationQueue _queue;
    private readonly ILogger<NotificationQueueProcessor> _logger;

    public NotificationQueueProcessor(
        IServiceScopeFactory scopeFactory,
        BackgroundNotificationQueue queue,
        ILogger<NotificationQueueProcessor> logger)
    {
        _scopeFactory = scopeFactory;
        _queue = queue;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var workItem = await _queue.DequeueAsync(stoppingToken);
            try
            {
                using var scope = _scopeFactory.CreateScope();
                await workItem(scope.ServiceProvider, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing background notification");
            }
        }
    }
}
