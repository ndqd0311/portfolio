using Application.Features.Common.DTOs;
using Application.Features.Common.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Blogs.Queries;

public class GetBlogBySlugQueryHandler(IApplicationDbContext context, IMapper mapper)
    : IRequestHandler<GetBlogBySlugQuery, BlogDto?>
{
    public async Task<BlogDto?> Handle(GetBlogBySlugQuery request, CancellationToken cancellationToken)
    {
        var blog = await context.Blogs.FirstOrDefaultAsync(b => b.Slug == request.Slug, cancellationToken);
        if (blog == null)
        {
            return null;
        }

        return mapper.Map<BlogDto>(blog);
    }
}
