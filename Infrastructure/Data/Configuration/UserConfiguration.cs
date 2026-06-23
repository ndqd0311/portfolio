namespace Infrastructure.Data.Configuration;

public class UserConfiguration : IEntityTypeConfiguration<Users>
{
    public void Configure(EntityTypeBuilder<Users> builder)
    {
        builder.ToTable("users");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(x => x.Username).HasMaxLength(50).IsRequired().HasColumnName("username");
        builder.HasIndex(x => x.Username).IsUnique();
        builder.Property(x => x.Password).HasMaxLength(255).IsRequired().HasColumnName("password_hash");
        builder.Property(x => x.RoleId).HasColumnName("role_id").IsRequired();
    }
}