namespace Domain.Entities;

public class BlogLikes : BaseEntity
{
    public int BlogId { get; set; }
    public int UserId { get; set; }
}
