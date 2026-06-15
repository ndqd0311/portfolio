using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Features.Common.DTOs;
using Application.Features.Projects.Commands;
using Application.Features.Projects.Queries;

namespace API.Controllers;

public class ProjectsController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<ProjectDto>>> GetProjects()
    {
        return await Mediator.Send(new GetProjectsQuery());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProjectDto>> GetProjectById(int id)
    {
        var project = await Mediator.Send(new GetProjectByIdQuery(id));
        if (project == null)
        {
            return NotFound();
        }
        return Ok(project);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<int>> Create([FromBody] CreateProjectCommand command)
    {
        return await Mediator.Send(command);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult> Update(int id, [FromBody] UpdateProjectRequest request)
    {
        var command = new UpdateProjectCommand(
            id,
            request.Name,
            request.Description,
            request.Thumbnail,
            request.GithubUrl,
            request.WebsiteUrl,
            request.SkillIds
        );
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
        var success = await Mediator.Send(new DeleteProjectCommand(id));
        if (!success)
        {
            return NotFound();
        }
        return NoContent();
    }
}

public record UpdateProjectRequest(
    string Name,
    string Description,
    string? Thumbnail,
    string? GithubUrl,
    string? WebsiteUrl,
    List<int>? SkillIds
);
