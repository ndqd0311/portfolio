using Application.Features.Common.DTOs;
using MediatR;

namespace Application.Features.Skills.Queries;

public record GetSkillsQuery : IRequest<List<SkillDto>>;
