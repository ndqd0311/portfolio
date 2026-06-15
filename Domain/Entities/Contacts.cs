namespace Domain.Entities;

public class Contacts : BaseEntity
{
    public string Phone { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Facebook { get; set; } = null!;
    public string Github { get; set; } = null!;
}