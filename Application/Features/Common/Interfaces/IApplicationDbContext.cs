using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Users> Users { get; }
    DbSet<Domain.Entities.Projects> Projects { get; }
    DbSet<Domain.Entities.Skills> Skills { get; }
    DbSet<project_skills> ProjectSkills { get; }
    DbSet<Domain.Entities.Blogs> Blogs { get; }
    DbSet<Domain.Entities.Contacts> Contacts { get; }
    DbSet<ContactMessage> ContactMessages { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
