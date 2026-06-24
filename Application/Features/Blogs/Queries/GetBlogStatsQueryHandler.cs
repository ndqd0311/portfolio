using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Features.Common.DTOs;
using Application.Features.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Blogs.Queries;

public class GetBlogStatsQueryHandler : IRequestHandler<GetBlogStatsQuery, BlogStatsDto>
{
    private readonly IApplicationDbContext _context;

    public GetBlogStatsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BlogStatsDto> Handle(GetBlogStatsQuery request, CancellationToken cancellationToken)
    {
        var blogs = await _context.Blogs.ToListAsync(cancellationToken);
        var likes = await _context.BlogLikes.ToListAsync(cancellationToken);
        var comments = await _context.BlogComments.ToListAsync(cancellationToken);

        var blogItems = blogs.Select(b => new BlogItemStatsDto
        {
            Id = b.Id,
            Name = b.Name,
            Slug = b.Slug,
            CreatedAt = b.CreatedAt,
            ViewCount = b.ViewCount,
            LikesCount = likes.Count(l => l.BlogId == b.Id),
            CommentsCount = comments.Count(c => c.BlogId == b.Id)
        }).OrderByDescending(b => b.ViewCount).ToList();

        return new BlogStatsDto
        {
            TotalBlogs = blogs.Count,
            TotalViews = blogs.Sum(b => b.ViewCount),
            TotalLikes = likes.Count,
            TotalComments = comments.Count,
            Blogs = blogItems
        };
    }
}
