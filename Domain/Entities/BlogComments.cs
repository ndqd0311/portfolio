using System;

namespace Domain.Entities;

public class BlogComments : BaseEntity
{
    public int BlogId { get; set; }
    public int UserId { get; set; }
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}
