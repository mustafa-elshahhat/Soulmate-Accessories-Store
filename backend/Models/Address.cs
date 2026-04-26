namespace SoulmateStore.Models;

public class Address
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid GovernorateId { get; set; }
    public string Label { get; set; } = "";
    public string City { get; set; } = "";
    public string District { get; set; } = "";
    public string Street { get; set; } = "";
    public string Building { get; set; } = "";
    public string Floor { get; set; } = "";
    public double Lat { get; set; }
    public double Lng { get; set; }
    public string Phone { get; set; } = "";
    public string? Apartment { get; set; }
    public bool IsDefault { get; set; }

    public User User { get; set; } = null!;
    public Governorate Governorate { get; set; } = null!;
}
