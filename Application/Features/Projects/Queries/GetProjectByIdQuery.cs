using Application.Features.Common.DTOs;
using MediatR;

namespace Application.Features.Projects.Queries;

public record GetProjectByIdQuery(int Id) : IRequest<ProjectDto?>;
