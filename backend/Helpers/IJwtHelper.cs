using System.Security.Claims;
using SoulmateStore.Models.Enums;

namespace SoulmateStore.Helpers;

public interface IJwtHelper
{
    string GenerateAccessToken(Guid userId, string email, UserRole role);
    string GenerateRefreshToken();
}
