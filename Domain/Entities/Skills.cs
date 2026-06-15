namespace Domain.Entities;

public class Skills : BaseEntity
{
    public string Name { get; set; } = null!;
    public string Category { get; set; } = null!;
    public string Proficiency { get; set; } = null!;
    public ICollection<project_skills> project_skills { get; set; } = new List<project_skills>();
}