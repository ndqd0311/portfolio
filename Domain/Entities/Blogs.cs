namespace Domain.Entities;

public class Blogs : BaseEntity
{
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string Summary { get; set; } = null!;
    public string Content { get; set; } = null!;
    public bool IsPublished { get; set; }
    public int ViewCount { get; set; } = 0;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public void IncrementViewCount() 
    {
        ViewCount++;
    }
}