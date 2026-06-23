using Application.Features.Common.Interfaces;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Blogs.Commands;

public record ToggleLikeCommand(string Slug, int UserId) : IRequest<bool>;

public class ToggleLikeCommandHandler(IApplicationDbContext context) : IRequestHandler<ToggleLikeCommand, bool>
{
    public async Task<bool> Handle(ToggleLikeCommand request, CancellationToken cancellationToken)
    {
        var blog = await context.Blogs.FirstOrDefaultAsync(b => b.Slug == request.Slug, cancellationToken);
        if (blog == null) throw new ArgumentException("Blog not found.");

        var existingLike = await context.BlogLikes
            .FirstOrDefaultAsync(l => l.BlogId == blog.Id && l.UserId == request.UserId, cancellationToken);

        if (existingLike != null)
        {
            context.BlogLikes.Remove(existingLike);
            await context.SaveChangesAsync(cancellationToken);
            return false; // Unliked
        }
        else
        {
            var like = new BlogLikes
            {
                BlogId = blog.Id,
                UserId = request.UserId
            };
            context.BlogLikes.Add(like);
            await context.SaveChangesAsync(cancellationToken);
            return true; // Liked
        }
    }
}
