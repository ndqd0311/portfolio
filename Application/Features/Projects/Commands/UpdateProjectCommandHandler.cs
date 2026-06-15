using Application.Features.Common.Interfaces;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Projects.Commands;

public class UpdateProjectCommandHandler(IApplicationDbContext context) : IRequestHandler<UpdateProjectCommand, bool>
{
    public async Task<bool> Handle(UpdateProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await context.Projects
            .Include(p => p.project_skills)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (project == null)
        {
            return false;
        }

        project.Name = request.Name;
        project.Description = request.Description;
        project.Thumbnail = request.Thumbnail ?? "";
        project.GithubUrl = request.GithubUrl ?? "";
        project.WebsiteUrl = request.WebsiteUrl ?? "";
        project.UpdatedAt = DateTime.UtcNow;

        // Clear existing mappings
        context.ProjectSkills.RemoveRange(project.project_skills);

        // Add new mappings
        if (request.SkillIds != null)
        {
            foreach (var skillId in request.SkillIds)
            {
                context.ProjectSkills.Add(new project_skills
                {
                    ProjectId = project.Id,
                    SkillId = skillId
                });
            }
        }

        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
