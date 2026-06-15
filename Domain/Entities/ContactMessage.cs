namespace Domain.Entities;

public class ContactMessage : BaseEntity
{
    public string SenderName { get; set; } = null!;
    public string SenderEmail { get; set; } = null!;
    public string Subject { get; set; } = null!;
    public string Body { get; set; } = null!;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}
