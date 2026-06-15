using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Features.Common.DTOs;
using Application.Features.Skills.Commands;
using Application.Features.Skills.Queries;

namespace API.Controllers;

public class SkillsController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<SkillDto>>> GetSkills()
    {
        return await Mediator.Send(new GetSkillsQuery());
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<int>> Create([FromBody] CreateSkillCommand command)
    {
        return await Mediator.Send(command);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult> Update(int id, [FromBody] UpdateSkillRequest request)
    {
        var command = new UpdateSkillCommand(id, request.Name, request.Category, request.Proficiency);
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
        var success = await Mediator.Send(new DeleteSkillCommand(id));
        if (!success)
        {
            return NotFound();
        }
        return NoContent();
    }
}

public record UpdateSkillRequest(string Name, string Category, string Proficiency);
