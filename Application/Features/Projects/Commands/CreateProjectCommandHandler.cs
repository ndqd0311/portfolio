using Application.Features.Common.Interfaces;
using Domain.Entities;
using MediatR;

namespace Application.Features.Projects.Commands;

public class CreateProjectCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateProjectCommand, int>
{
    public async Task<int> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
    {
        var project = new Domain.Entities.Projects
        {
            Name = request.Name,
            Description = request.Description,
            Thumbnail = request.Thumbnail ?? "",
            GithubUrl = request.GithubUrl ?? "",
            WebsiteUrl = request.WebsiteUrl ?? "",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Projects.Add(project);
        await context.SaveChangesAsync(cancellationToken);

        if (request.SkillIds != null && request.SkillIds.Count > 0)
        {
            foreach (var skillId in request.SkillIds)
            {
                context.ProjectSkills.Add(new project_skills
                {
                    ProjectId = project.Id,
                    SkillId = skillId
                });
            }
            await context.SaveChangesAsync(cancellationToken);
        }

        return project.Id;
    }
}
