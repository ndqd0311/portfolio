namespace Infrastructure.Data.Configuration;

public class ContactMessageConfiguration : IEntityTypeConfiguration<ContactMessage>
{
    public void Configure(EntityTypeBuilder<ContactMessage> builder)
    {
        builder.ToTable("contact_messages");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(x => x.SenderName).HasMaxLength(100).IsRequired().HasColumnName("sender_name");
        builder.Property(x => x.SenderEmail).HasMaxLength(100).IsRequired().HasColumnName("sender_email");
        builder.Property(x => x.Subject).HasMaxLength(255).IsRequired().HasColumnName("subject");
        builder.Property(x => x.Body).IsRequired().HasColumnName("message_body");
        builder.Property(x => x.IsRead).HasDefaultValue(false).HasColumnName("is_read");
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("NOW()").HasColumnName("created_at");
    }
}
