'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/utils/api';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [contacts, setContacts] = useState({ email: '' });

  useEffect(() => {
    async function loadData() {
      try {
        const projectsData = await fetchApi('/api/projects');
        setProjects(projectsData);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }

      try {
        const skillsData = await fetchApi('/api/skills');
        setSkills(skillsData);
      } catch (err) {
        console.error('Error fetching skills:', err);
      }

      try {
        const contactsData = await fetchApi('/api/contacts');
        if (contactsData) {
          setContacts(contactsData);
        }
      } catch (err) {
        console.error('Error fetching contacts:', err);
      }
    }

    loadData();
  }, []);

  // Set up reveal observers
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains('staggered-container')) {
            const children = entry.target.querySelectorAll('.reveal');
            children.forEach((child, index) => {
              setTimeout(() => {
                child.classList.add('animate-reveal');
              }, index * 100);
            });
          } else {
            entry.target.classList.add('animate-reveal');
          }
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.reveal, .staggered-container');
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, [projects, skills, selectedSkill]);

  // Card Mouse Hover Glow
  const handleMouseMove = (e, cardId) => {
    const card = document.getElementById(cardId);
    if (!card) return;
    const glow = card.querySelector('.mouse-glow');
    if (!glow) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glow.style.left = `${x}px`;
    glow.style.top = `${y}px`;
    glow.style.opacity = '1';
  };

  const handleMouseLeave = (cardId) => {
    const card = document.getElementById(cardId);
    if (!card) return;
    const glow = card.querySelector('.mouse-glow');
    if (!glow) return;
    glow.style.opacity = '0';
  };

  // Filter projects by selected skill
  const filteredProjects = selectedSkill === 'All'
    ? projects
    : projects.filter(p => p.skills?.some(s => s.name === selectedSkill));

  return (
    <div className="flex flex-col min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[1280px] rounded-full border border-white/10 z-50 bg-background/80 backdrop-blur-[20px] shadow-2xl flex justify-between items-center px-8 py-4 transition-all duration-500 ease-in-out" id="main-nav">
        <Link href="/" className="font-mono text-body-lg font-bold tracking-tighter text-electric-cyan hover:opacity-85 transition-opacity">
          QD
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/projects" className="text-electric-cyan font-medium hover:text-electric-cyan transition-colors duration-300 font-sans text-body-md">
            Projects
          </Link>
          <Link href="/blog" className="text-on-surface-variant font-medium hover:text-electric-cyan transition-colors duration-300 font-sans text-body-md">
            Blog
          </Link>
          <Link href="/#tech-mastery" className="text-on-surface-variant font-medium hover:text-electric-cyan transition-colors duration-300 font-sans text-body-md">
            Skills
          </Link>
          <Link href="/#contact" className="text-on-surface-variant font-medium hover:text-electric-cyan transition-colors duration-300 font-sans text-body-md">
            Contact
          </Link>
          <Link href="/admin/login" className="text-on-surface-variant font-medium hover:text-electric-cyan transition-colors duration-300 font-sans text-body-md">
            Admin
          </Link>
        </div>
        <a
          href={contacts.email ? `mailto:${contacts.email}` : '#'}
          className="bg-electric-cyan text-on-primary-fixed font-mono text-label-mono px-6 py-2 rounded-full hover:scale-95 transition-transform active:scale-90"
        >
          Hire Me
        </a>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-32 px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto w-full">
        <section className="py-12 reveal">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="font-sora text-4xl md:text-5xl font-bold text-on-surface mb-4">Featured Works</h1>
            <p className="font-sans text-body-lg text-on-surface-variant">
              Explore the technical details, database schemas, and API architectures of systems I've built.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <button
              onClick={() => setSelectedSkill('All')}
              className={`px-5 py-2 rounded-full font-mono text-xs uppercase transition-all duration-300 ${selectedSkill === 'All'
                  ? 'bg-electric-cyan text-on-primary-fixed font-semibold scale-105'
                  : 'bg-white/5 border border-white/5 text-on-surface-variant hover:text-electric-cyan'
                }`}
            >
              All
            </button>
            {skills.map(skill => (
              <button
                key={skill.id}
                onClick={() => setSelectedSkill(skill.name)}
                className={`px-5 py-2 rounded-full font-mono text-xs uppercase transition-all duration-300 ${selectedSkill === skill.name
                    ? 'bg-electric-cyan text-on-primary-fixed font-semibold scale-105'
                    : 'bg-white/5 border border-white/5 text-on-surface-variant hover:text-electric-cyan'
                  }`}
              >
                {skill.name}
              </button>
            ))}
          </div>

          {/* Grid of Projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 staggered-container">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  id={`project-card-${project.id}`}
                  onMouseMove={(e) => handleMouseMove(e, `project-card-${project.id}`)}
                  onMouseLeave={() => handleMouseLeave(`project-card-${project.id}`)}
                  className="group glass-card rounded-2xl overflow-hidden hover:border-electric-cyan/20 transition-all duration-500 reveal"
                >
                  <div className="mouse-glow"></div>
                  <div className="relative h-[250px] md:h-[320px] overflow-hidden z-10 bg-white/3 flex items-center justify-center">
                    {project.thumbnail ? (
                      <img 
                        src={project.thumbnail} 
                        alt={project.name} 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-electric-cyan/10 via-transparent to-muted-gold/5"></div>
                        <span className="material-symbols-outlined text-electric-cyan/30 text-[96px] group-hover:text-electric-cyan/60 transition-all duration-700 group-hover:scale-110">code_blocks</span>
                      </>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60"></div>
                  </div>
                  <div className="p-8 relative z-10">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.skills?.map(skill => (
                        <span key={skill.id} className="font-mono text-[11px] px-3 py-1 rounded-full border border-white/5 bg-white/5 uppercase tracking-tighter">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-sora text-2xl font-semibold text-on-surface mb-2">{project.name}</h3>
                    <p className="font-sans text-body-md text-on-surface-variant mb-6 line-clamp-3">{project.description}</p>
                    <div className="flex gap-4">
                      {project.websiteUrl && (
                        <a href={project.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-electric-cyan font-mono text-label-mono hover:underline">
                          Live Site <span className="material-symbols-outlined text-sm">north_east</span>
                        </a>
                      )}
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-on-surface-variant font-mono text-label-mono hover:text-electric-cyan hover:underline">
                          Source Code <span className="material-symbols-outlined text-sm">code</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-on-surface-variant py-24 glass-card rounded-2xl border border-white/5">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2">folder_open</span>
                <p>No projects match the selected technology filter.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-background reveal">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center py-16 px-margin-desktop gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="font-mono text-body-lg text-electric-cyan font-bold">QD</div>
            <p className="font-sans text-body-md text-on-surface-variant">© 2026 Built with Precision</p>
          </div>
          <a
            href={contacts.email ? `mailto:${contacts.email}` : '#'}
            className="bg-electric-cyan/5 border border-electric-cyan/20 text-electric-cyan px-6 py-2 rounded-full font-mono text-label-mono hover:bg-electric-cyan/10 transition-all text-center"
          >
            Let's Collaborate
          </a>
        </div>
      </footer>
    </div>
  );
}
