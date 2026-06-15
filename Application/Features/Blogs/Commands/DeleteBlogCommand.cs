using MediatR;

namespace Application.Features.Blogs.Commands;

public record DeleteBlogCommand(int Id) : IRequest<bool>;
