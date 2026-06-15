using Application.Features.Common.DTOs;
using MediatR;

namespace Application.Features.ContactMessages.Queries;

public record GetContactMessagesQuery : IRequest<List<ContactMessageDto>>;
