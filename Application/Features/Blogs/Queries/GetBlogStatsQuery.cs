using Application.Features.Common.DTOs;
using MediatR;

namespace Application.Features.Blogs.Queries;

public record GetBlogStatsQuery : IRequest<BlogStatsDto>;
