namespace Application.Features.Common.DTOs;

public class ContactDto
{
    public int Id { get; set; }
    public string Phone { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Facebook { get; set; } = null!;
    public string Github { get; set; } = null!;
}
