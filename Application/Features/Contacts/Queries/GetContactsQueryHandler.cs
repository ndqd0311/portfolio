using Application.Features.Common.DTOs;
using Application.Features.Common.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Contacts.Queries;

public class GetContactsQueryHandler(IApplicationDbContext context, IMapper mapper)
    : IRequestHandler<GetContactsQuery, ContactDto>
{
    public async Task<ContactDto> Handle(GetContactsQuery request, CancellationToken cancellationToken)
    {
        var contact = await context.Contacts.FirstOrDefaultAsync(cancellationToken);
        if (contact == null)
        {
            // Fallback in case seed didn't run or table is empty
            return new ContactDto
            {
                Phone = "",
                Email = "",
                Facebook = "",
                Github = ""
            };
        }

        return mapper.Map<ContactDto>(contact);
    }
}
