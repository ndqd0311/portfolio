using Application.Features.Common.DTOs;
using Application.Features.Common.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.ContactMessages.Queries;

public class GetContactMessagesQueryHandler(IApplicationDbContext context, IMapper mapper)
    : IRequestHandler<GetContactMessagesQuery, List<ContactMessageDto>>
{
    public async Task<List<ContactMessageDto>> Handle(GetContactMessagesQuery request, CancellationToken cancellationToken)
    {
        var messages = await context.ContactMessages
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(cancellationToken);

        return mapper.Map<List<ContactMessageDto>>(messages);
    }
}
