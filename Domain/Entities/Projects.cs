namespace Domain.Entities;

public class Projects : BaseEntity
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Thumbnail { get; set; } = null!;
    public string GithubUrl { get; set; } = null!;
    public string WebsiteUrl { get; set; } = null!;
    public ICollection<project_skills> project_skills { get; set; } = new List<project_skills>();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}