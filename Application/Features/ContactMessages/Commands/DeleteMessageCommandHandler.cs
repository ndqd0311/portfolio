using Application.Features.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.ContactMessages.Commands;

public class DeleteMessageCommandHandler(IApplicationDbContext context)
    : IRequestHandler<DeleteMessageCommand, bool>
{
    public async Task<bool> Handle(DeleteMessageCommand request, CancellationToken cancellationToken)
    {
        var message = await context.ContactMessages
            .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);

        if (message == null)
        {
            return false;
        }

        context.ContactMessages.Remove(message);
        await context.SaveChangesAsync(cancellationToken);

        return true;
    }
}