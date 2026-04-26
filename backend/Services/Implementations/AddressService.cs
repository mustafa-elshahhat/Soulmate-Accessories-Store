using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SoulmateStore.Data;
using SoulmateStore.DTOs.Addresses;
using SoulmateStore.Exceptions;
using SoulmateStore.Models;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Services.Implementations;

public class AddressService : IAddressService
{
    private readonly AppDbContext _db;
    private readonly ILogger<AddressService> _logger;

    public AddressService(AppDbContext db, ILogger<AddressService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<List<AddressResponseDto>> GetByUserAsync(Guid userId)
    {
        return await _db.Addresses
            .AsNoTracking()
            .Include(a => a.Governorate)
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.IsDefault)
            .ThenByDescending(a => a.Id)
            .Select(a => MapToDto(a))
            .ToListAsync();
    }

    public async Task<AddressResponseDto> CreateAsync(Guid userId, CreateAddressDto dto)
    {
        var governorate = await _db.Governorates.FindAsync(dto.GovernorateId)
            ?? throw new NotFoundException("GOVERNORATE_NOT_FOUND", "المحافظة مش موجودة");

        if (dto.IsDefault)
        {
            await _db.Addresses
                .Where(a => a.UserId == userId && a.IsDefault)
                .ExecuteUpdateAsync(s => s.SetProperty(a => a.IsDefault, false));
        }

        var address = new Address
        {
            UserId = userId,
            Label = dto.Label,
            GovernorateId = dto.GovernorateId,
            City = dto.City,
            District = dto.District,
            Street = dto.Street,
            Building = dto.Building,
            Floor = dto.Floor,
            Apartment = dto.Apartment,
            Phone = dto.Phone,
            Lat = dto.Lat,
            Lng = dto.Lng,
            IsDefault = dto.IsDefault
        };

        _db.Addresses.Add(address);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Address created for user {UserId}", userId);

        address.Governorate = governorate;
        return MapToDto(address);
    }

    public async Task<AddressResponseDto> UpdateAsync(Guid id, Guid userId, CreateAddressDto dto)
    {
        var address = await _db.Addresses.Include(a => a.Governorate)
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId)
            ?? throw new NotFoundException("ADDRESS_NOT_FOUND", "العنوان مش موجود");

        var governorate = await _db.Governorates.FindAsync(dto.GovernorateId)
            ?? throw new NotFoundException("GOVERNORATE_NOT_FOUND", "المحافظة مش موجودة");

        if (dto.IsDefault && !address.IsDefault)
        {
            await _db.Addresses
                .Where(a => a.UserId == userId && a.IsDefault && a.Id != id)
                .ExecuteUpdateAsync(s => s.SetProperty(a => a.IsDefault, false));
        }

        address.Label = dto.Label;
        address.GovernorateId = dto.GovernorateId;
        address.City = dto.City;
        address.District = dto.District;
        address.Street = dto.Street;
        address.Building = dto.Building;
        address.Floor = dto.Floor;
        address.Apartment = dto.Apartment;
        address.Phone = dto.Phone;
        address.Lat = dto.Lat;
        address.Lng = dto.Lng;
        address.IsDefault = dto.IsDefault;

        await _db.SaveChangesAsync();

        _logger.LogInformation("Address {AddressId} updated by user {UserId}", id, userId);

        address.Governorate = governorate;
        return MapToDto(address);
    }

    public async Task DeleteAsync(Guid id, Guid userId)
    {
        var address = await _db.Addresses.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId)
            ?? throw new NotFoundException("ADDRESS_NOT_FOUND", "العنوان مش موجود");

        var hasOrders = await _db.Orders.AnyAsync(o => o.AddressId == id);
        if (hasOrders)
            throw new ConflictException("ADDRESS_HAS_ORDERS", "مينفعش تحذف عنوان مرتبط بطلبات");

        _db.Addresses.Remove(address);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Address {AddressId} deleted by user {UserId}", id, userId);
    }

    private static AddressResponseDto MapToDto(Address a) => new()
    {
        Id = a.Id,
        Label = a.Label,
        GovernorateId = a.GovernorateId,
        GovernorateName = a.Governorate?.Name ?? "",
        GovernorateNameEn = a.Governorate?.NameEn ?? "",
        ShippingCost = a.Governorate?.ShippingCost ?? 0,
        City = a.City,
        District = a.District,
        Street = a.Street,
        Building = a.Building,
        Floor = a.Floor,
        Apartment = a.Apartment,
        Phone = a.Phone,
        Lat = a.Lat,
        Lng = a.Lng,
        IsDefault = a.IsDefault
    };
}
