using Application.Features.Common.DTOs;
using AutoMapper;
using Domain.Entities;

namespace Application.Features.Common.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Domain.Entities.Skills, SkillDto>().ReverseMap();

        CreateMap<Domain.Entities.Projects, ProjectDto>()
            .ForMember(dest => dest.Skills, opt => opt.Ignore());
        CreateMap<Domain.Entities.Blogs, BlogDto>().ReverseMap();
        CreateMap<Domain.Entities.Contacts, ContactDto>().ReverseMap();
        CreateMap<ContactMessage, ContactMessageDto>().ReverseMap();
    }
}
