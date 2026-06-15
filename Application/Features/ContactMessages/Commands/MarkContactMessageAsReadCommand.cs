using MediatR;

namespace Application.Features.ContactMessages.Commands;

public record MarkContactMessageAsReadCommand(int Id) : IRequest<bool>;
