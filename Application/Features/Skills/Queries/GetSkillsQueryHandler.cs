using Application.Features.Common.DTOs;
using Application.Features.Common.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Skills.Queries;

public class GetSkillsQueryHandler(IApplicationDbContext context, IMapper mapper)
    : IRequestHandler<GetSkillsQuery, List<SkillDto>>
{
    public async Task<List<SkillDto>> Handle(GetSkillsQuery request, CancellationToken cancellationToken)
    {
        var skills = await context.Skills
            .OrderBy(s => s.Category)
            .ThenBy(s => s.Name)
            .ToListAsync(cancellationToken);

        return mapper.Map<List<SkillDto>>(skills);
    }
}
