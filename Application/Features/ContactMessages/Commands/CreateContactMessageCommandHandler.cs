using Application.Features.Common.Interfaces;
using Domain.Entities;
using MediatR;

namespace Application.Features.ContactMessages.Commands;

public class CreateContactMessageCommandHandler(IApplicationDbContext context)
    : IRequestHandler<CreateContactMessageCommand, int>
{
    public async Task<int> Handle(CreateContactMessageCommand request, CancellationToken cancellationToken)
    {
        var message = new ContactMessage
        {
            SenderName = request.SenderName,
            SenderEmail = request.SenderEmail,
            Subject = request.Subject,
            Body = request.Body,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        context.ContactMessages.Add(message);
        await context.SaveChangesAsync(cancellationToken);

        return message.Id;
    }
}
