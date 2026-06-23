namespace Application.Features.Skills.Commands;

public class CreateSkillCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateSkillCommand, int>
{
    public async Task<int> Handle(CreateSkillCommand request, CancellationToken cancellationToken)
    {
        var skill = new Domain.Entities.Skills
        {
            Name = request.Name,
            Category = request.Category,
            Proficiency = request.Proficiency
        };
        
        context.Skills.Add(skill);
        await context.SaveChangesAsync(cancellationToken);
        return skill.Id;
    }
}
