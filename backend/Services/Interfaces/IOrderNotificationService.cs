using SoulmateStore.Models;
using SoulmateStore.Models.Enums;

namespace SoulmateStore.Services.Interfaces;

public interface IOrderNotificationService
{
    Task NotifyOrderCreatedAsync(Order order, User user);
    Task NotifyStatusChangedAsync(Order order, User user, OrderStatus newStatus);
}
