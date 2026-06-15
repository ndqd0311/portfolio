using MediatR;

namespace Application.Features.Projects.Commands;

public record CreateProjectCommand(
    string Name,
    string Description,
    string? Thumbnail,
    string? GithubUrl,
    string? WebsiteUrl,
    List<int>? SkillIds) : IRequest<int>;
