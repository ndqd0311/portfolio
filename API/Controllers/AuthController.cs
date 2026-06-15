using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using Application.Features.Auth.Commands.Login;

namespace API.Controllers;

public class AuthController : ApiControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] LoginCommand command)
    {
        try
        {
            var token = await Mediator.Send(command);
            return Ok(new { Token = token });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
    }
}
