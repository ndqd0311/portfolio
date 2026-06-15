using Application.Features.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Blogs.Commands;

public class DeleteBlogCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteBlogCommand, bool>
{
    public async Task<bool> Handle(DeleteBlogCommand request, CancellationToken cancellationToken)
    {
        var blog = await context.Blogs.FirstOrDefaultAsync(b => b.Id == request.Id, cancellationToken);
        if (blog == null)
        {
            return false;
        }

        context.Blogs.Remove(blog);
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
