using Application.Features.Common.DTOs;
using Application.Features.Common.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Projects.Queries;

public class GetProjectsQueryHandler(IApplicationDbContext context, IMapper mapper)
    : IRequestHandler<GetProjectsQuery, List<ProjectDto>>
{
    public async Task<List<ProjectDto>> Handle(GetProjectsQuery request, CancellationToken cancellationToken)
    {
        var projects = await context.Projects
            .Include(p => p.project_skills)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);

        var allSkills = await context.Skills.ToListAsync(cancellationToken);
        var skillMap = allSkills.ToDictionary(s => s.Id, s => mapper.Map<SkillDto>(s));

        var projectDtos = new List<ProjectDto>();

        foreach (var project in projects)
        {
            var dto = mapper.Map<ProjectDto>(project);
            dto.Skills = project.project_skills
                .Select(ps => ps.SkillId)
                .Where(id => skillMap.ContainsKey(id))
                .Select(id => skillMap[id])
                .ToList();
            projectDtos.Add(dto);
        }

        return projectDtos;
    }
}
