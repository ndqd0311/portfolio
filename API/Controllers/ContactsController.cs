using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Application.Features.Common.DTOs;
using Application.Features.Contacts.Commands;
using Application.Features.Contacts.Queries;

namespace API.Controllers;

public class ContactsController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ContactDto>> GetContacts()
    {
        var contacts = await Mediator.Send(new GetContactsQuery());
        if (contacts == null)
        {
            return NotFound();
        }
        return Ok(contacts);
    }

    [HttpPut]
    [Authorize]
    public async Task<ActionResult> Update([FromBody] UpdateContactsCommand command)
    {
        var success = await Mediator.Send(command);
        if (!success)
        {
            return NotFound();
        }
        return NoContent();
    }
}
