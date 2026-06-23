namespace Application.Features.Skills.Commands;

public class DeleteSkillCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteSkillCommand, bool>
{
    public async Task<bool> Handle(DeleteSkillCommand request, CancellationToken cancellationToken)
    {
        var skill = await context.Skills.FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);
        if (skill == null)
        {
            return false;
        }

        context.Skills.Remove(skill);
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
