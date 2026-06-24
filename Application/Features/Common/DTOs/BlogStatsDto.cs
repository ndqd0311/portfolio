using System;
using System.Collections.Generic;

namespace Application.Features.Common.DTOs;

public class BlogStatsDto
{
    public int TotalViews { get; set; }
    public int TotalLikes { get; set; }
    public int TotalComments { get; set; }
    public int TotalBlogs { get; set; }
    public List<BlogItemStatsDto> Blogs { get; set; } = new();
}

public class BlogItemStatsDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public int ViewCount { get; set; }
    public int LikesCount { get; set; }
    public int CommentsCount { get; set; }
}
