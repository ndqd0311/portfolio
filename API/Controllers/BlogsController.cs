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
    public async Task<ActionResult<List<BlogDto>>> GetBlogs([FromQuery] bool includeUnpublished = false)
    {
        return await Mediator.Send(new GetBlogsQuery(includeUnpublished));
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

    [HttpGet("{slug}/comments")]
    public async Task<ActionResult<List<CommentDto>>> GetBlogComments(string slug)
    {
        return await Mediator.Send(new GetBlogCommentsQuery(slug));
    }

    [HttpPost("{slug}/comments")]
    [Authorize]
    public async Task<ActionResult<int>> CreateComment(string slug, [FromBody] CreateCommentRequest request)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized();
        var userId = int.Parse(userIdClaim.Value);

        var command = new CreateCommentCommand(slug, request.Content, userId);
        return await Mediator.Send(command);
    }

    [HttpGet("{slug}/likes")]
    public async Task<ActionResult<BlogLikesDto>> GetBlogLikes(string slug)
    {
        int? userId = null;
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var parsedId))
        {
            userId = parsedId;
        }
        return await Mediator.Send(new GetBlogLikesQuery(slug, userId));
    }

    [HttpPost("{slug}/likes/toggle")]
    [Authorize]
    public async Task<ActionResult<bool>> ToggleLike(string slug)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized();
        var userId = int.Parse(userIdClaim.Value);

        var command = new ToggleLikeCommand(slug, userId);
        return await Mediator.Send(command);
    }

    [HttpDelete("comments/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteComment(int id)
    {
        var success = await Mediator.Send(new DeleteCommentCommand(id));
        if (!success)
        {
            return NotFound();
        }
        return NoContent();
    }
}

public record UpdateBlogRequest(string Name, string Summary, string Content, bool IsPublished);
public record CreateCommentRequest(string Content);
