using Application.Features.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Contacts.Commands;

public class UpdateContactsCommandHandler(IApplicationDbContext context) : IRequestHandler<UpdateContactsCommand, bool>
{
    public async Task<bool> Handle(UpdateContactsCommand request, CancellationToken cancellationToken)
    {
        var contact = await context.Contacts.FirstOrDefaultAsync(cancellationToken);
        if (contact == null)
        {
            contact = new Domain.Entities.Contacts
            {
                Phone = request.Phone,
                Email = request.Email,
                Facebook = request.Facebook,
                Github = request.Github
            };
            context.Contacts.Add(contact);
        }
        else
        {
            contact.Phone = request.Phone;
            contact.Email = request.Email;
            contact.Facebook = request.Facebook;
            contact.Github = request.Github;
        }

        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
