using MediatR;

namespace Application.Features.Blogs.Commands;

public record DeleteCommentCommand(int Id) : IRequest<bool>;
