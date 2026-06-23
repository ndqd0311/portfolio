using Application.Features.Common.DTOs;

namespace Application.Features.Skills.Queries;

public record GetSkillsQuery : IRequest<List<SkillDto>>;
