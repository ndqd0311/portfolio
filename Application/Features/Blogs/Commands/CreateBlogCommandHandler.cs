using System.Text.RegularExpressions;
using Application.Features.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Blogs.Commands;

public class CreateBlogCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateBlogCommand, int>
{
    private readonly IApplicationDbContext _context = context;

    public async Task<int> Handle(CreateBlogCommand request, CancellationToken cancellationToken)
    {
        var baseSlug = GenerateSlug(request.Name);
        var slug = baseSlug;
        int count = 1;
        
        while (await _context.Blogs.AnyAsync(b => b.Slug == slug, cancellationToken))
        {
            slug = $"{baseSlug}-{count++}";
        }

        var blog = new Domain.Entities.Blogs
        {
            Name = request.Name,
            Slug = slug,
            Summary = request.Summary,
            Content = request.Content,
            IsPublished = request.IsPublished,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Blogs.Add(blog);
        await _context.SaveChangesAsync(cancellationToken);

        return blog.Id;
    }

    private string GenerateSlug(string phrase)
    {
        string str = phrase.ToLower();
        // Replace invalid characters
        str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
        // Convert multiple spaces into one space
        str = Regex.Replace(str, @"\s+", " ").Trim();
        // Cut string to 60 chars
        str = str.Substring(0, str.Length <= 60 ? str.Length : 60).Trim();
        // Replace spaces with hyphens
        str = Regex.Replace(str, @"\s", "-");
        return str;
    }
}
