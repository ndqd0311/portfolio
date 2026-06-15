namespace Infrastructure.Data.Configuration;

public class ProjectSkillConfiguration : IEntityTypeConfiguration<project_skills>
{
    public void Configure(EntityTypeBuilder<project_skills> builder)
    {
        builder.ToTable("project_skills");
        builder.HasKey(ps => new { ps.ProjectId, ps.SkillId });
        
        builder.Property(ps => ps.ProjectId).HasColumnName("project_id");
        builder.Property(ps => ps.SkillId).HasColumnName("skill_id");

        builder.HasOne<Projects>()
            .WithMany(p => p.project_skills)
            .HasForeignKey(ps => ps.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<Skills>()
            .WithMany(s => s.project_skills)
            .HasForeignKey(ps => ps.SkillId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
