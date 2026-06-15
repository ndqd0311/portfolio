using MediatR;

namespace Application.Features.Projects.Commands;

public record UpdateProjectCommand(
    int Id,
    string Name,
    string Description,
    string? Thumbnail,
    string? GithubUrl,
    string? WebsiteUrl,
    List<int>? SkillIds) : IRequest<bool>;
