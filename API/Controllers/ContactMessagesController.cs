using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Features.Common.DTOs;
using Application.Features.ContactMessages.Commands;
using Application.Features.ContactMessages.Queries;

namespace API.Controllers;

public class ContactMessagesController : ApiControllerBase
{
    [HttpPost]
    public async Task<ActionResult<int>> Create([FromBody] CreateContactMessageCommand command)
    {
        return await Mediator.Send(command);
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<ContactMessageDto>>> GetMessages()
    {
        return await Mediator.Send(new GetContactMessagesQuery());
    }

    [HttpPost("{id}/read")]
    [Authorize]
    public async Task<ActionResult> MarkAsRead(int id)
    {
        var success = await Mediator.Send(new MarkContactMessageAsReadCommand(id));
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
        var success = await Mediator.Send(new DeleteMessageCommand(id));
        if (!success)
        {
            return NotFound();
        }
        return NoContent();
    }
}
