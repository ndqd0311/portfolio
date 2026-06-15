using MediatR;
namespace Application.Features.ContactMessages.Commands;

public record DeleteMessageCommand(int Id) : IRequest<bool>;