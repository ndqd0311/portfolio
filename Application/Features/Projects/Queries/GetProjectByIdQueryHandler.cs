using Application.Features.Common.DTOs;
using Application.Features.Common.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Projects.Queries;

public class GetProjectByIdQueryHandler(IApplicationDbContext context, IMapper mapper)
    : IRequestHandler<GetProjectByIdQuery, ProjectDto?>
{
    public async Task<ProjectDto?> Handle(GetProjectByIdQuery request, CancellationToken cancellationToken)
    {
        var project = await context.Projects
            .Include(p => p.project_skills)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (project == null)
        {
            return null;
        }

        var skillIds = project.project_skills.Select(ps => ps.SkillId).ToList();
        var skills = await context.Skills
            .Where(s => skillIds.Contains(s.Id))
            .ToListAsync(cancellationToken);

        var dto = mapper.Map<ProjectDto>(project);
        dto.Skills = mapper.Map<System.Collections.Generic.List<SkillDto>>(skills);

        return dto;
    }
}
