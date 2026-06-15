namespace Infrastructure.Data.Configuration;

public class ContactConfiguration : IEntityTypeConfiguration<Contacts>
{
    public void Configure(EntityTypeBuilder<Contacts> builder)
    {
        builder.ToTable("contacts");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(x => x.Phone).HasMaxLength(255).IsRequired().HasColumnName("phone");
        builder.Property(x => x.Email).HasMaxLength(255).IsRequired().HasColumnName("email");
        builder.Property(x => x.Facebook).HasMaxLength(255).IsRequired().HasColumnName("fb_url");
        builder.Property(x => x.Github).HasMaxLength(255).IsRequired().HasDefaultValue("").HasColumnName("github_url");
    }
}