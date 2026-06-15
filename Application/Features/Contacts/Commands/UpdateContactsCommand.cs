using MediatR;

namespace Application.Features.Contacts.Commands;

public record UpdateContactsCommand(string Phone, string Email, string Facebook, string Github) : IRequest<bool>;
