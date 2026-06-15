using MediatR;

namespace Application.Features.Skills.Commands;

public record UpdateSkillCommand(int Id, string Name, string Category, string Proficiency) : IRequest<bool>;
