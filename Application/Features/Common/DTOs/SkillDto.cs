namespace Application.Features.Common.DTOs;

public class SkillDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Category { get; set; } = null!;
    public string Proficiency { get; set; } = null!;
}
