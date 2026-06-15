using Application.Features.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.ContactMessages.Commands;

public class MarkContactMessageAsReadCommandHandler(IApplicationDbContext context)
    : IRequestHandler<MarkContactMessageAsReadCommand, bool>
{
    public async Task<bool> Handle(MarkContactMessageAsReadCommand request, CancellationToken cancellationToken)
    {
        var message = await context.ContactMessages
            .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);

        if (message == null)
        {
            return false;
        }

        message.IsRead = true;
        await context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
