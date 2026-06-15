using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;
using Application.Features.Common.Interfaces;

namespace Infrastructure.Data;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Users> Users => Set<Users>();
    public DbSet<Projects> Projects => Set<Projects>();
    public DbSet<Skills> Skills => Set<Skills>();
    public DbSet<project_skills> ProjectSkills => Set<project_skills>();
    public DbSet<Blogs> Blogs => Set<Blogs>();
    public DbSet<Contacts> Contacts => Set<Contacts>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
