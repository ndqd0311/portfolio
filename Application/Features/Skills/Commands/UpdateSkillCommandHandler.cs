namespace Application.Features.Skills.Commands;

public class UpdateSkillCommandHandler(IApplicationDbContext context) : IRequestHandler<UpdateSkillCommand, bool>
{
    public async Task<bool> Handle(UpdateSkillCommand request, CancellationToken cancellationToken)
    {
        var skill = await context.Skills.FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);
        if (skill == null)
        {
            return false;
        }

        skill.Name = request.Name;
        skill.Category = request.Category;
        skill.Proficiency = request.Proficiency;

        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
