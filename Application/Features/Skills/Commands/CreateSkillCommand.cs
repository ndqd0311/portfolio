namespace Application.Features.Skills.Commands;

public record CreateSkillCommand(string Name, string Category, string Proficiency) : IRequest<int>;
