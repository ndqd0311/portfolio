namespace Infrastructure.Data.Configuration;

public class SkillConfiguration : IEntityTypeConfiguration<Skills>
{
    public void Configure(EntityTypeBuilder<Skills> builder)
    {
        builder.ToTable("skills");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(x => x.Name).HasMaxLength(100).IsRequired().HasColumnName("name");
        builder.HasIndex(x => x.Name).IsUnique();
        builder.Property(x => x.Category).HasMaxLength(50).IsRequired().HasColumnName("category");
        builder.Property(x => x.Proficiency).HasMaxLength(50).IsRequired().HasColumnName("proficiency");
    }
}