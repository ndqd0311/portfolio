namespace Infrastructure.Data.Configuration;

public class BlogConfiguration : IEntityTypeConfiguration<Blogs>
{
    public void Configure(EntityTypeBuilder<Blogs> builder)
    {
        builder.ToTable("blogs");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(x => x.Name).HasMaxLength(255).IsRequired().HasColumnName("name");
        builder.Property(x => x.Slug).HasMaxLength(255).IsRequired().HasColumnName("slug");
        builder.HasIndex(x => x.Slug).IsUnique();
        builder.Property(x => x.Summary).IsRequired().HasColumnName("summary");
        builder.Property(x => x.Content).IsRequired().HasColumnName("content");
        builder.Property(x => x.IsPublished).HasDefaultValue(false).HasColumnName("is_published");
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("NOW()").HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasDefaultValueSql("NOW()").HasColumnName("updated_at");
    }
}