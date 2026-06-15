'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/utils/api';

export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [contacts, setContacts] = useState({ phone: '', email: '', facebook: '', github: '' });

  // Contact Message form state
  const [formData, setFormData] = useState({ senderName: '', senderEmail: '', subject: '', body: '' });
  const [formStatus, setFormStatus] = useState({ success: null, error: null, loading: false });

  const canvasRef = useRef(null);
  const navRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Fetch data from API
    async function loadData() {
      try {
        const projectsData = await fetchApi('/api/projects');
        setProjects(projectsData.slice(0, 4)); // Show top 4
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
        const blogsData = await fetchApi('/api/blogs');
        setBlogs(blogsData.filter(b => b.isPublished).slice(0, 3)); // Show top 3 published
      } catch (err) {
        console.error('Error fetching blogs:', err);
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

  // Canvas Particles Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let frameCount = 0;

    // Planet System properties
    let planetX = canvas.width * 0.75;
    let planetY = canvas.height * 0.35;
    let planetRadius = 45;

    // Mouse movement tracking for interactive parallax
    let mouse = { x: canvas.width / 2, y: canvas.height / 2, targetX: canvas.width / 2, targetY: canvas.height / 2 };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      planetX = canvas.width * 0.75;
      if (canvas.width < 768) {
        planetX = canvas.width * 0.8;
      }
      planetY = canvas.height * 0.35;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    resize();

    class Particle {
      constructor() {
        this.init();
      }

      init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.4 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }

      draw() {
        ctx.fillStyle = `rgba(0, 240, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < 40; i++) {
      particles.push(new Particle());
    }

    const drawPlanetSystem = (time) => {
      // Gentle floating motion
      const floatOffset = Math.sin(time * 0.015) * 10;
      
      // Interpolate mouse movements smoothly
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;
      
      const mouseOffsetX = (mouse.x - canvas.width / 2) * 0.03;
      const mouseOffsetY = (mouse.y - canvas.height / 2) * 0.03;
      
      const cx = planetX + mouseOffsetX;
      const cy = planetY + mouseOffsetY + floatOffset;
      
      // Orbit 1: Cyber-cyan inner satellite
      const orbit1_a = 90;
      const orbit1_b = 20;
      const orbit1_tilt = -18 * Math.PI / 180;
      const moon1_speed = 0.02;
      const moon1_angle = time * moon1_speed;
      
      // Orbit 2: Hot-magenta outer satellite
      const orbit2_a = 150;
      const orbit2_b = 35;
      const orbit2_tilt = 12 * Math.PI / 180;
      const moon2_speed = -0.012;
      const moon2_angle = time * moon2_speed;

      const drawOrbitRing = (rx, ry, tilt, color) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(tilt);
        ctx.scale(1, ry / rx);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, rx, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      };

      const getMoonPos = (rx, ry, tilt, angle) => {
        const mx = rx * Math.cos(angle);
        const my = ry * Math.sin(angle);
        const rxRot = mx * Math.cos(tilt) - my * Math.sin(tilt);
        const ryRot = mx * Math.sin(tilt) + my * Math.cos(tilt);
        const isBehind = Math.sin(angle) < 0;
        return {
          x: cx + rxRot,
          y: cy + ryRot,
          isBehind,
          depth: Math.sin(angle)
        };
      };

      const moon1 = getMoonPos(orbit1_a, orbit1_b, orbit1_tilt, moon1_angle);
      const moon2 = getMoonPos(orbit2_a, orbit2_b, orbit2_tilt, moon2_angle);

      // 1. Draw orbits
      drawOrbitRing(orbit1_a, orbit1_b, orbit1_tilt, 'rgba(0, 240, 255, 0.05)');
      drawOrbitRing(orbit2_a, orbit2_b, orbit2_tilt, 'rgba(255, 0, 200, 0.03)');

      const drawMoon = (moon, radius, baseColor, glowColor) => {
        const depthScale = (moon.depth + 1) / 2; // 0 to 1
        const scale = 0.6 + depthScale * 0.6;
        const opacity = 0.3 + depthScale * 0.7;
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(moon.x, moon.y, radius * scale, 0, Math.PI * 2);
        ctx.fillStyle = baseColor.replace('1)', `${opacity})`);
        ctx.shadowBlur = 12;
        ctx.shadowColor = glowColor;
        ctx.fill();
        ctx.restore();
      };

      // 2. Draw moons in the background
      if (moon1.isBehind) drawMoon(moon1, 4, 'rgba(0, 240, 255, 1)', '#00F0FF');
      if (moon2.isBehind) drawMoon(moon2, 6, 'rgba(255, 0, 200, 1)', '#FF00C8');

      // 3. Draw outer atmospheric glow
      ctx.save();
      const outerGlow = ctx.createRadialGradient(cx, cy, planetRadius - 5, cx, cy, planetRadius + 30);
      outerGlow.addColorStop(0, 'rgba(0, 240, 255, 0.2)');
      outerGlow.addColorStop(0.5, 'rgba(255, 0, 200, 0.08)');
      outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, planetRadius + 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 4. Draw Planet core with glowing 3D lighting gradient
      ctx.save();
      const planetGradient = ctx.createRadialGradient(
        cx - planetRadius * 0.3, 
        cy - planetRadius * 0.3, 
        planetRadius * 0.1, 
        cx, 
        cy, 
        planetRadius
      );
      planetGradient.addColorStop(0, '#00F0FF');
      planetGradient.addColorStop(0.3, '#002C4D');
      planetGradient.addColorStop(0.8, '#0B0D19');
      planetGradient.addColorStop(1, '#020308');
      
      ctx.fillStyle = planetGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, planetRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 5. Draw flat tilted equatorial rings
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(orbit1_tilt);
      ctx.scale(1, 0.18);
      
      const ringGrad = ctx.createRadialGradient(0, 0, planetRadius + 8, 0, 0, planetRadius + 35);
      ringGrad.addColorStop(0, 'rgba(0, 240, 255, 0.7)');
      ringGrad.addColorStop(0.4, 'rgba(0, 240, 255, 0.1)');
      ringGrad.addColorStop(0.7, 'rgba(255, 0, 200, 0.3)');
      ringGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.strokeStyle = ringGrad;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(0, 0, planetRadius + 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 6. Draw moons in the foreground
      if (!moon1.isBehind) drawMoon(moon1, 4, 'rgba(0, 240, 255, 1)', '#00F0FF');
      if (!moon2.isBehind) drawMoon(moon2, 6, 'rgba(255, 0, 200, 1)', '#FF00C8');
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frameCount++;
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      drawPlanetSystem(frameCount);
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Navigation Scroll Transition
  useEffect(() => {
    const handleScroll = () => {
      const nav = navRef.current;
      if (!nav) return;
      if (window.scrollY > 50) {
        nav.classList.add('nav-scrolled');
      } else {
        nav.classList.remove('nav-scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for Reveal Elements
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

          // Trigger width animation for skill progress bars
          if (entry.target.id === 'tech-mastery') {
            const bars = entry.target.querySelectorAll('.skill-progress-bar');
            bars.forEach(bar => {
              const width = bar.getAttribute('data-width');
              bar.style.width = width || '0%';
            });
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
  }, [projects, skills, blogs]);

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

  // Submit Contact Form
  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    setFormStatus({ success: null, error: null, loading: true });

    try {
      await fetchApi('/api/contactmessages', {
        method: 'POST',
        body: formData,
      });
      setFormStatus({ success: 'Message sent successfully! I will get back to you soon.', error: null, loading: false });
      setFormData({ senderName: '', senderEmail: '', subject: '', body: '' });
    } catch (err) {
      setFormStatus({ success: null, error: err.message || 'Something went wrong. Please try again.', loading: false });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* TopNavBar */}
      <nav
        ref={navRef}
        className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[1280px] rounded-full border border-white/10 z-50 bg-background/80 backdrop-blur-[20px] shadow-2xl flex justify-between items-center px-8 py-4 transition-all duration-500 ease-in-out"
        id="main-nav"
      >
        <Link 
          href="/" 
          onClick={(e) => {
            if (window.location.pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="font-mono text-body-lg font-bold tracking-tighter text-electric-cyan hover:opacity-85 transition-opacity"
        >
          QD
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/projects" className="text-on-surface-variant font-medium hover:text-electric-cyan transition-colors duration-300 font-sans text-body-md">
            Projects
          </Link>
          <Link href="/blog" className="text-on-surface-variant font-medium hover:text-electric-cyan transition-colors duration-300 font-sans text-body-md">
            Blog
          </Link>
          <a href="#tech-mastery" className="text-on-surface-variant font-medium hover:text-electric-cyan transition-colors duration-300 font-sans text-body-md">
            Skills
          </a>
          <a href="#contact" className="text-on-surface-variant font-medium hover:text-electric-cyan transition-colors duration-300 font-sans text-body-md">
            Contact
          </a>
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

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 px-margin-mobile md:px-margin-desktop overflow-hidden">
          <canvas
            ref={canvasRef}
            id="hero-canvas"
            className="absolute inset-0 w-full h-full pointer-events-none"
          />
          <div className="relative z-10 text-center max-w-4xl reveal animate-reveal">
            <div className="inline-block py-1 px-4 mb-6 rounded-full border border-electric-cyan/20 bg-electric-cyan/5 ambient-float">
              <span className="font-mono text-label-mono text-electric-cyan uppercase tracking-widest text-xs">Available for new opportunities</span>
            </div>
            <h1 className="font-sora text-4xl md:text-7xl font-bold tracking-tight text-on-surface mb-8 leading-tight">
              Architecting Digital <span className="text-electric-cyan">Excellence</span> through Code.
            </h1>
            <p className="font-sans text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-12">
              Aspiring Backend Developer Intern specializing in C#, .NET Core, Clean Architecture, and building robust databases, services, and APIs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/projects"
                className="w-full sm:w-auto bg-electric-cyan text-on-primary-fixed px-8 py-4 rounded-full font-mono text-label-mono hover:scale-105 transition-transform text-center"
              >
                View Projects
              </Link>
              <a
                href="#contact"
                className="w-full sm:w-auto border border-outline-variant/30 text-electric-cyan hover:bg-white/5 px-8 py-4 rounded-full font-mono text-label-mono transition-all text-center"
              >
                Let's Collaborate
              </a>
            </div>
          </div>
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 animate-bounce">
            <span className="font-mono text-[10px] uppercase tracking-widest">Scroll</span>
            <span className="material-symbols-outlined text-electric-cyan">expand_more</span>
          </div>
        </section>

        {/* Featured Projects */}
        <section className="max-w-[1280px] mx-auto py-section-gap px-margin-mobile md:px-margin-desktop reveal" id="projects">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="font-sora text-3xl md:text-4xl font-bold text-on-surface mb-4">Selected Works</h2>
              <p className="font-sans text-body-md text-on-surface-variant max-w-lg">
                A curated collection of systems I've built, ranging from fintech platforms to clean architecture web apps.
              </p>
            </div>
            <Link href="/projects" className="font-mono text-label-mono text-electric-cyan hover:underline cursor-pointer flex items-center gap-2">
              See All Projects <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 staggered-container">
            {projects.length > 0 ? (
              projects.map((project, idx) => (
                <div
                  key={project.id}
                  id={`project-card-${project.id}`}
                  onMouseMove={(e) => handleMouseMove(e, `project-card-${project.id}`)}
                  onMouseLeave={() => handleMouseLeave(`project-card-${project.id}`)}
                  className="group glass-card rounded-2xl overflow-hidden hover:border-electric-cyan/20 transition-all duration-500 reveal"
                >
                  <div className="mouse-glow"></div>
                  <div className="relative h-[300px] md:h-[380px] overflow-hidden z-10 bg-white/3 flex items-center justify-center">
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
                    <p className="font-sans text-body-md text-on-surface-variant mb-6 line-clamp-2">{project.description}</p>
                    <div className="flex gap-4">
                      {project.websiteUrl && (
                        <a href={project.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-electric-cyan font-mono text-label-mono hover:underline">
                          Live Site <span className="material-symbols-outlined text-sm">north_east</span>
                        </a>
                      )}
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-on-surface-variant font-mono text-label-mono hover:text-electric-cyan hover:underline">
                          Source <span className="material-symbols-outlined text-sm">code</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-on-surface-variant py-12">
                No projects found. Deploy backend or seed data.
              </div>
            )}
          </div>
        </section>

        {/* Tech Stack / Technical Mastery */}
        <section className="max-w-[1280px] mx-auto py-section-gap px-margin-mobile md:px-margin-desktop reveal" id="tech-mastery">
          <h2 className="font-sora text-3xl md:text-4xl font-bold text-on-surface mb-12 text-center">Technical Mastery</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-none md:grid-rows-2 gap-6 h-auto md:h-[600px] staggered-container">

            {/* Philosophy Card */}
            <div className="md:col-span-2 md:row-span-2 glass-card p-12 rounded-2xl flex flex-col justify-end relative overflow-hidden group reveal min-h-[300px]">
              <div className="mouse-glow"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-electric-cyan/5 to-transparent"></div>
              <span className="material-symbols-outlined text-electric-cyan text-[64px] mb-8 group-hover:scale-110 transition-transform duration-500 relative z-10">terminal</span>
              <h4 className="font-sora text-2xl font-bold text-on-surface mb-4 relative z-10">Core Philosophy</h4>
              <p className="font-sans text-body-lg text-on-surface-variant relative z-10 leading-relaxed">
                I am passionate about crafting clean, efficient, and well-structured backend systems. My approach centers on Clean Architecture, database optimization, query performance, and implementing robust REST APIs using C# and .NET.
              </p>
            </div>

            {/* Dynamic Skills Cards */}
            {skills.slice(0, 2).map((skill, idx) => (
              <div key={skill.id} className={`md:col-span-1 glass-card p-8 rounded-2xl flex flex-col justify-between border-b-2 ${idx === 0 ? 'border-b-electric-cyan/30' : 'border-b-muted-gold/30'} reveal`}>
                <h5 className="font-mono text-label-mono text-on-surface-variant uppercase">{skill.category}</h5>
                <div className="space-y-4">
                  <div className="flex justify-between text-on-surface font-mono text-sm">
                    <span>{skill.name}</span>
                    <span>{skill.proficiency}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full skill-progress-bar transition-all duration-1000 ease-out ${idx === 0 ? 'bg-electric-cyan' : 'bg-muted-gold'}`}
                      style={{ width: '0%' }}
                      data-width={skill.proficiency}
                    ></div>
                  </div>
                </div>
              </div>
            ))}

            {/* Exp Stats Card */}
            <div className="md:col-span-2 glass-card p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-around gap-6 reveal">
              <div className="text-center">
                <div className="text-4xl font-sora font-bold text-on-surface">1+</div>
                <div className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider mt-1">Year Coding</div>
              </div>
              <div className="hidden sm:block w-px h-12 bg-white/10"></div>
              <div className="text-center">
                <div className="text-4xl font-sora font-bold text-on-surface">10+</div>
                <div className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider mt-1">Projects Built</div>
              </div>
              <div className="hidden sm:block w-px h-12 bg-white/10"></div>
              <div className="text-center">
                <div className="text-4xl font-sora font-bold text-on-surface">100%</div>
                <div className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider mt-1">Dedicated</div>
              </div>
            </div>

            {/* Remaining Seeded Skills */}
            {skills.slice(2, 4).map((skill, idx) => (
              <div key={skill.id} className="md:col-span-1 glass-card p-8 rounded-2xl flex flex-col justify-between border-b-2 border-b-slate-gray/30 reveal">
                <h5 className="font-mono text-label-mono text-on-surface-variant uppercase">{skill.category}</h5>
                <div className="space-y-4">
                  <div className="flex justify-between text-on-surface font-mono text-sm">
                    <span>{skill.name}</span>
                    <span>{skill.proficiency}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full skill-progress-bar bg-slate-gray transition-all duration-1000 ease-out"
                      style={{ width: '0%' }}
                      data-width={skill.proficiency}
                    ></div>
                  </div>
                </div>
              </div>
            ))}

          </div>
        </section>

        {/* Dynamic Blogs List */}
        <section className="bg-surface-dark/40 py-section-gap reveal" id="articles">
          <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="flex justify-between items-center mb-12">
              <h2 className="font-sora text-3xl font-bold text-on-surface">Digital Archive</h2>
              <Link href="/blog" className="font-mono text-label-mono text-on-surface-variant hover:text-electric-cyan transition-colors">
                Read All Articles
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 staggered-container">
              {blogs.length > 0 ? (
                blogs.map((blog) => (
                  <Link href={`/blog/${blog.slug}`} key={blog.id} className="group cursor-pointer reveal flex flex-col justify-between">
                    <div>
                      <div className="mb-6 overflow-hidden rounded-xl aspect-[16/10] bg-white/5 border border-white/5 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-electric-cyan/10 to-transparent opacity-30"></div>
                        <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-electric-cyan text-4xl opacity-40 group-hover:opacity-85 transition-opacity">
                          article
                        </span>
                      </div>
                      <div className="space-y-3">
                        <time className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider block">
                          {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </time>
                        <h3 className="font-sora text-xl font-bold text-on-surface group-hover:text-electric-cyan transition-colors line-clamp-2">
                          {blog.name}
                        </h3>
                        <p className="font-sans text-body-md text-on-surface-variant line-clamp-2">
                          {blog.summary}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-3 text-center text-on-surface-variant py-12">
                  No articles posted yet.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="max-w-[800px] mx-auto py-section-gap px-margin-mobile reveal" id="contact">
          <div className="text-center mb-12">
            <h2 className="font-sora text-3xl md:text-4xl font-bold text-on-surface mb-4">Get In Touch</h2>
            <p className="font-sans text-body-lg text-on-surface-variant">
              Have an exciting project proposal or want to chat? Drop a message directly.
            </p>
          </div>

          <form onSubmit={handleSubmitMessage} className="glass-card p-8 md:p-12 rounded-2xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2">
                <label className="font-mono text-label-mono text-on-surface-variant text-xs uppercase" htmlFor="senderName">Your Name</label>
                <input
                  id="senderName"
                  type="text"
                  value={formData.senderName}
                  onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                  required
                  placeholder="John Doe"
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-on-surface placeholder-white/20 focus:outline-none focus:border-electric-cyan transition-colors"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="font-mono text-label-mono text-on-surface-variant text-xs uppercase" htmlFor="senderEmail">Email Address</label>
                <input
                  id="senderEmail"
                  type="email"
                  value={formData.senderEmail}
                  onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                  required
                  placeholder="john@example.com"
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-on-surface placeholder-white/20 focus:outline-none focus:border-electric-cyan transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="font-mono text-label-mono text-on-surface-variant text-xs uppercase" htmlFor="subject">Subject</label>
              <input
                id="subject"
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                placeholder="Collaboration Inquiry"
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-on-surface placeholder-white/20 focus:outline-none focus:border-electric-cyan transition-colors"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="font-mono text-label-mono text-on-surface-variant text-xs uppercase" htmlFor="body">Message Body</label>
              <textarea
                id="body"
                rows="5"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                required
                placeholder="Let's build something awesome..."
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-on-surface placeholder-white/20 focus:outline-none focus:border-electric-cyan transition-colors resize-none"
              ></textarea>
            </div>

            {formStatus.success && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm">
                {formStatus.success}
              </div>
            )}

            {formStatus.error && (
              <div className="p-4 bg-error/10 border border-error/20 text-error rounded-lg text-sm">
                {formStatus.error}
              </div>
            )}

            <button
              type="submit"
              disabled={formStatus.loading}
              className="w-full bg-electric-cyan text-on-primary-fixed py-4 rounded-full font-mono text-label-mono hover:scale-[0.98] active:scale-95 transition-transform disabled:opacity-50"
            >
              {formStatus.loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-background reveal">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center py-16 px-margin-desktop gap-8">
          <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
            <div className="font-mono text-body-lg text-electric-cyan font-bold">QD</div>
            <p className="font-sans text-body-md text-on-surface-variant">© 2026 Built with Precision</p>
            {contacts.phone && (
              <p className="font-mono text-xs text-on-surface-variant">Phone: {contacts.phone}</p>
            )}
          </div>
          <div className="flex gap-8">
            {contacts.facebook && (
              <a href={contacts.facebook} target="_blank" rel="noreferrer" className="text-on-surface-variant hover:text-electric-cyan transition-colors font-sans text-body-md">
                Facebook
              </a>
            )}
            {contacts.github && (
              <a href={contacts.github} target="_blank" rel="noreferrer" className="text-on-surface-variant hover:text-electric-cyan transition-colors font-sans text-body-md">
                GitHub
              </a>
            )}
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
