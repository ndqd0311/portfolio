using MediatR;

namespace Application.Features.ContactMessages.Commands;

public record CreateContactMessageCommand(string SenderName, string SenderEmail, string Subject, string Body) : IRequest<int>;
