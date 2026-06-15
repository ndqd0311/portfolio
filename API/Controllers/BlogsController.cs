using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Features.Blogs.Commands;
using Application.Features.Blogs.Queries;
using Application.Features.Common.DTOs;

namespace API.Controllers;

public class BlogsController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<BlogDto>>> GetBlogs()
    {
        return await Mediator.Send(new GetBlogsQuery());
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<BlogDto>> GetBlogBySlug(string slug)
    {
        var blog = await Mediator.Send(new GetBlogBySlugQuery(slug));
        if (blog == null)
        {
            return NotFound();
        }
        return Ok(blog);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<int>> Create([FromBody] CreateBlogCommand command)
    {
        return await Mediator.Send(command);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult> Update(int id, [FromBody] UpdateBlogRequest request)
    {
        var command = new UpdateBlogCommand(id, request.Name, request.Summary, request.Content, request.IsPublished);
        var success = await Mediator.Send(command);
        if (!success)
        {
            return NotFound();
        }
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<ActionResult> Delete(int id)
    {
        var success = await Mediator.Send(new DeleteBlogCommand(id));
        if (!success)
        {
            return NotFound();
        }
        return NoContent();
    }
}

public record UpdateBlogRequest(string Name, string Summary, string Content, bool IsPublished);
