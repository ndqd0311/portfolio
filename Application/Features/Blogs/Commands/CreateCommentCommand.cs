using Application.Features.Common.Interfaces;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Blogs.Commands;

public record CreateCommentCommand(string Slug, string Content, int UserId) : IRequest<int>;

public class CreateCommentCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateCommentCommand, int>
{
    public async Task<int> Handle(CreateCommentCommand request, CancellationToken cancellationToken)
    {
        var blog = await context.Blogs.FirstOrDefaultAsync(b => b.Slug == request.Slug, cancellationToken);
        if (blog == null) throw new ArgumentException("Blog not found.");

        var comment = new BlogComments
        {
            BlogId = blog.Id,
            UserId = request.UserId,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow
        };

        context.BlogComments.Add(comment);
        await context.SaveChangesAsync(cancellationToken);
        return comment.Id;
    }
}
