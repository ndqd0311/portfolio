using MediatR;

namespace Application.Features.Blogs.Commands;

public record UpdateBlogCommand(int Id, string Name, string Summary, string Content, bool IsPublished) : IRequest<bool>;
