using System.Text.RegularExpressions;
using Application.Features.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Blogs.Commands;

public class UpdateBlogCommandHandler(IApplicationDbContext context) : IRequestHandler<UpdateBlogCommand, bool>
{
    public async Task<bool> Handle(UpdateBlogCommand request, CancellationToken cancellationToken)
    {
        var blog = await context.Blogs.FirstOrDefaultAsync(b => b.Id == request.Id, cancellationToken);
        if (blog == null)
        {
            return false;
        }

        if (blog.Name != request.Name)
        {
            var baseSlug = GenerateSlug(request.Name);
            var slug = baseSlug;
            int count = 1;
            while (await context.Blogs.AnyAsync(b => b.Slug == slug && b.Id != request.Id, cancellationToken))
            {
                slug = $"{baseSlug}-{count++}";
            }
            blog.Slug = slug;
        }

        blog.Name = request.Name;
        blog.Summary = request.Summary;
        blog.Content = request.Content;
        blog.IsPublished = request.IsPublished;
        blog.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
        return true;
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
