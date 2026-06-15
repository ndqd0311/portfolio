using MediatR;

namespace Application.Features.Blogs.Commands;

public record CreateBlogCommand(string Name, string Summary, string Content, bool IsPublished) : IRequest<int>;
