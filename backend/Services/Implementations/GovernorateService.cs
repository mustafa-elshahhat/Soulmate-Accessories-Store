using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SoulmateStore.Data;
using SoulmateStore.DTOs.Common;
using SoulmateStore.Exceptions;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Services.Implementations;

public class GovernorateService : IGovernorateService
{
    private readonly AppDbContext _db;
    private readonly ILogger<GovernorateService> _logger;

    public GovernorateService(AppDbContext db, ILogger<GovernorateService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<List<GovernorateDto>> GetActiveAsync()
    {
        return await _db.Governorates
            .AsNoTracking()
            .Where(g => g.IsActive)
            .OrderBy(g => g.Name)
            .Select(g => new GovernorateDto
            {
                Id = g.Id,
                Name = g.Name,
                NameEn = g.NameEn,
                ShippingCost = g.ShippingCost,
                IsActive = g.IsActive
            })
            .ToListAsync();
    }

    public async Task<List<GovernorateDto>> GetAllAsync()
    {
        return await _db.Governorates
            .AsNoTracking()
            .OrderBy(g => g.Name)
            .Select(g => new GovernorateDto
            {
                Id = g.Id,
                Name = g.Name,
                NameEn = g.NameEn,
                ShippingCost = g.ShippingCost,
                IsActive = g.IsActive
            })
            .ToListAsync();
    }

    public async Task<GovernorateDto> UpdateAsync(Guid id, UpdateGovernorateDto dto)
    {
        var gov = await _db.Governorates.FindAsync(id)
            ?? throw new NotFoundException("GOVERNORATE_NOT_FOUND", "المحافظة مش موجودة");

        gov.ShippingCost = dto.ShippingCost;
        gov.IsActive = dto.IsActive;

        await _db.SaveChangesAsync();

        _logger.LogInformation("Governorate {GovernorateId} updated", id);

        return new GovernorateDto
        {
            Id = gov.Id,
            Name = gov.Name,
            NameEn = gov.NameEn,
            ShippingCost = gov.ShippingCost,
            IsActive = gov.IsActive
        };
    }
}
