namespace Application.Features.Common.DTOs;

public class ProjectDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Thumbnail { get; set; } = null!;
    public string GithubUrl { get; set; } = null!;
    public string WebsiteUrl { get; set; } = null!;
    public List<SkillDto> Skills { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
