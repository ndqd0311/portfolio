using Application.Features.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Projects.Commands;

public class DeleteProjectCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteProjectCommand, bool>
{
    public async Task<bool> Handle(DeleteProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await context.Projects
            .Include(p => p.project_skills)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (project == null)
        {
            return false;
        }

        context.ProjectSkills.RemoveRange(project.project_skills);
        context.Projects.Remove(project);

        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
