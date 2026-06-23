using Application.Features.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Blogs.Commands;

public class DeleteCommentCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteCommentCommand, bool>
{
    public async Task<bool> Handle(DeleteCommentCommand request, CancellationToken cancellationToken)
    {
        var comment = await context.BlogComments.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (comment == null)
        {
            return false;
        }

        context.BlogComments.Remove(comment);
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
