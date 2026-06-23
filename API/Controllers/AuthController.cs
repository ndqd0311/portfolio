using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;
using Application.Features.Auth.Commands.Login;

namespace API.Controllers;

public class AuthController : ApiControllerBase
{
    private readonly ILogger<AuthController> _logger;

    public AuthController(ILogger<AuthController> logger)
    {
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] LoginCommand command)
    {
        try
        {
            _logger.LogInformation("Login attempt for username: {Username}", command.Username);
            var token = await Mediator.Send(command);
            _logger.LogInformation("Login succeeded, token generated.");
            return Ok(new { Token = token });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Login failed for username: {Username}", command.Username);
            return Unauthorized(new { error = ex.Message });
        }
    }

    [HttpPost("register")]
    public async Task<ActionResult> Register([FromBody] Application.Features.Users.Commands.CreateUserCommand command)
    {
        try
        {
            _logger.LogInformation("Registration attempt for username: {Username}", command.Username);
            // Force regular user role (RoleId = 2) for safety
            var registerCommand = new Application.Features.Users.Commands.CreateUserCommand(command.Username, command.Password, 2);
            var userId = await Mediator.Send(registerCommand);
            _logger.LogInformation("User registered successfully with Id: {UserId}", userId);
            return Ok(new { UserId = userId });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Registration failed for username: {Username}", command.Username);
            return BadRequest(new { error = ex.Message });
        }
    }
}
