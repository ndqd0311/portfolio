namespace Application.Features.Skills.Commands;

public record DeleteSkillCommand(int Id) : IRequest<bool>;
