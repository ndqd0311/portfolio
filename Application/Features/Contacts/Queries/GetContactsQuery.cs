using Application.Features.Common.DTOs;
using MediatR;

namespace Application.Features.Contacts.Queries;

public record GetContactsQuery : IRequest<ContactDto>;
