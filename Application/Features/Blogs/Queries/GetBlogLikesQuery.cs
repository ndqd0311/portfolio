using Application.Features.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Blogs.Queries;

public record BlogLikesDto(int LikesCount, bool HasLiked);

public record GetBlogLikesQuery(string Slug, int? UserId) : IRequest<BlogLikesDto>;

public class GetBlogLikesQueryHandler(IApplicationDbContext context) : IRequestHandler<GetBlogLikesQuery, BlogLikesDto>
{
    public async Task<BlogLikesDto> Handle(GetBlogLikesQuery request, CancellationToken cancellationToken)
    {
        var blog = await context.Blogs.FirstOrDefaultAsync(b => b.Slug == request.Slug, cancellationToken);
        if (blog == null) return new BlogLikesDto(0, false);

        var likesCount = await context.BlogLikes.CountAsync(l => l.BlogId == blog.Id, cancellationToken);
        
        var hasLiked = false;
        if (request.UserId.HasValue)
        {
            hasLiked = await context.BlogLikes.AnyAsync(l => l.BlogId == blog.Id && l.UserId == request.UserId.Value, cancellationToken);
        }

        return new BlogLikesDto(likesCount, hasLiked);
    }
}
