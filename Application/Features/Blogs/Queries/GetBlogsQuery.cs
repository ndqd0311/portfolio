using Application.Features.Common.DTOs;
using MediatR;

namespace Application.Features.Blogs.Queries;

public record GetBlogsQuery(bool IncludeUnpublished = false) : IRequest<List<BlogDto>>;
