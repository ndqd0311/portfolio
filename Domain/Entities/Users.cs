namespace Domain.Entities;

public class Users : BaseEntity
{
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
    public int RoleId { get; set; }
}