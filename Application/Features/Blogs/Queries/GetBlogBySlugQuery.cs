using Application.Features.Common.DTOs;
using MediatR;

namespace Application.Features.Blogs.Queries;

public record GetBlogBySlugQuery(string Slug) : IRequest<BlogDto?>;
