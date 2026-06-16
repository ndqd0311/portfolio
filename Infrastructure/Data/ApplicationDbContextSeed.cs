using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure.Data;

public static class ApplicationDbContextSeed
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Ensure github_url column exists dynamically since we use EnsureCreated() without Migrations
        await context.Database.ExecuteSqlRawAsync("ALTER TABLE contacts ADD COLUMN IF NOT EXISTS github_url VARCHAR(255) NOT NULL DEFAULT '';");

        // 1. Seed Users (Admin)
        if (!await context.Users.AnyAsync())
        {
            var adminUser = new Users
            {
                Username = "admin",
                Password = BCrypt.Net.BCrypt.HashPassword("admin123")
            };
            await context.Users.AddAsync(adminUser);
        }

        // 2. Seed Contacts (Owner contact links)
        if (!await context.Contacts.AnyAsync())
        {
            var defaultContact = new Contacts
            {
                Phone = "0123456789",
                Email = "portfolio_admin@example.com",
                Facebook = "https://facebook.com/portfolio.admin",
                Github = "https://github.com/ndqd0311"
            };
            await context.Contacts.AddAsync(defaultContact);
        }

        // 3. Seed Skills
        if (!await context.Skills.AnyAsync())
        {
            var skills = new List<Skills>
            {
                new Skills { Name = "C#", Category = "Backend", Proficiency = "90%" },
                new Skills { Name = ".NET 10 / Web API", Category = "Backend", Proficiency = "85%" },
                new Skills { Name = "PostgreSQL", Category = "Database", Proficiency = "80%" },
                new Skills { Name = "Docker", Category = "DevOps", Proficiency = "75%" }
            };
            await context.Skills.AddRangeAsync(skills);
            await context.SaveChangesAsync();
        }

        // 4. Seed Projects
        if (!await context.Projects.AnyAsync())
        {
            var csharpSkill = await context.Skills.FirstOrDefaultAsync(s => s.Name == "C#");
            var netSkill = await context.Skills.FirstOrDefaultAsync(s => s.Name == ".NET 10 / Web API");
            var postgresSkill = await context.Skills.FirstOrDefaultAsync(s => s.Name == "PostgreSQL");

            await context.Projects.AddAsync(project);
            await context.SaveChangesAsync();

            // Link skills
            if (csharpSkill != null)
            {
                context.ProjectSkills.Add(new project_skills { ProjectId = project.Id, SkillId = csharpSkill.Id });
            }
            if (netSkill != null)
            {
                context.ProjectSkills.Add(new project_skills { ProjectId = project.Id, SkillId = netSkill.Id });
            }
            if (postgresSkill != null)
            {
                context.ProjectSkills.Add(new project_skills { ProjectId = project.Id, SkillId = postgresSkill.Id });
            }
        }

        // 5. Seed Blogs
        if (!await context.Blogs.AnyAsync())
        {
            var blogs = new List<Blogs>
            {
                new Blogs
                {
                    Name = "Securing ASP.NET Core APIs with JWT Bearer Authentication",
                    Slug = "securing-aspnet-core-apis-jwt-bearer-authentication",
                    Summary = "Understand the concepts of JSON Web Tokens (JWT) and learn how to secure your ASP.NET Core web APIs using JwtBearer authentication middleware.",
                    Content = "# Securing ASP.NET Core APIs with JWT Bearer Authentication\n\nSecurity is a critical aspect of backend development. In this article, we will walk through setting up JWT bearer authentication in an ASP.NET Core application...\n\n## Why JWT?\nJWTs are compact, URL-safe, and self-contained tokens that carry claims about the authenticated user...",
                    IsPublished = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            };
            await context.Blogs.AddRangeAsync(blogs);
        }

        await context.SaveChangesAsync();
    }
}
