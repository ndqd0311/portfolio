using MediatR;

namespace Application.Features.Projects.Commands;

public record DeleteProjectCommand(int Id) : IRequest<bool>;
