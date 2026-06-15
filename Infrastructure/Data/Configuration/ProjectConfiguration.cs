namespace Infrastructure.Data.Configuration;

public class ProjectConfiguration : IEntityTypeConfiguration<Projects>
{
    public void Configure(EntityTypeBuilder<Projects> builder)
    {
        builder.ToTable("projects");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(x => x.Name).HasMaxLength(255).IsRequired().HasColumnName("name");
        builder.Property(x => x.Description).IsRequired().HasColumnName("description");
        builder.Property(x => x.Thumbnail).HasMaxLength(255).HasColumnName("thumbnail");
        builder.Property(x => x.GithubUrl).HasMaxLength(255).HasColumnName("github_url");
        builder.Property(x => x.WebsiteUrl).HasMaxLength(255).HasColumnName("demo_url");
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("NOW()").HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasDefaultValueSql("NOW()").HasColumnName("updated_at");
    }
}