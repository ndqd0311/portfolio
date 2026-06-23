using Application.Features.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Blogs.Queries;

public record CommentDto(int Id, string Content, DateTime CreatedAt, string Username);

public record GetBlogCommentsQuery(string Slug) : IRequest<List<CommentDto>>;

public class GetBlogCommentsQueryHandler(IApplicationDbContext context) : IRequestHandler<GetBlogCommentsQuery, List<CommentDto>>
{
    public async Task<List<CommentDto>> Handle(GetBlogCommentsQuery request, CancellationToken cancellationToken)
    {
        var blog = await context.Blogs.FirstOrDefaultAsync(b => b.Slug == request.Slug, cancellationToken);
        if (blog == null) return new List<CommentDto>();

        var comments = await context.BlogComments
            .Where(c => c.BlogId == blog.Id)
            .OrderBy(c => c.CreatedAt)
            .Join(context.Users, 
                comment => comment.UserId, 
                user => user.Id, 
                (comment, user) => new CommentDto(comment.Id, comment.Content, comment.CreatedAt, user.Username))
            .ToListAsync(cancellationToken);

        return comments;
    }
}
