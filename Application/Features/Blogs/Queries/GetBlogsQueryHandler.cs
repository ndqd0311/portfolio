using Application.Features.Common.DTOs;
using Application.Features.Common.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Blogs.Queries;

public class GetBlogsQueryHandler : IRequestHandler<GetBlogsQuery, List<BlogDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetBlogsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<BlogDto>> Handle(GetBlogsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Blogs.AsQueryable();

        if (!request.IncludeUnpublished)
        {
            query = query.Where(b => b.IsPublished);
        }

        var blogs = await query
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<BlogDto>>(blogs);
    }
}
