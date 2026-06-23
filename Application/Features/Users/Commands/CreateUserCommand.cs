namespace Application.Features.Users.Commands;

public record CreateUserCommand(string Username, string Password, int Roleid) : IRequest<int>;