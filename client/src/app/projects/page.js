'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { fetchApi, getToken } from '@/utils/api';

const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [contacts, setContacts] = useState({ email: '' });
  const [user, setUser] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const decoded = decodeJwt(token);
      if (decoded) {
        setUser({
          username: decoded.unique_name || decoded.name || decoded.sub || 'User',
          role: decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
        });
      }
    }
  }, []);

  // Canvas background planet effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let shootingStars = [];
    let frameCount = 0;

    let mouse = { x: canvas.width / 2, y: canvas.height / 2, targetX: canvas.width / 2, targetY: canvas.height / 2 };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
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
        this.size = Math.random() * 1.5 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.15;
        this.speedY = (Math.random() - 0.5) * 0.15;
        this.baseOpacity = Math.random() * 0.4 + 0.1;
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.twinkleSpeed = 0.005 + Math.random() * 0.015;

        const colors = [
          'rgba(0, 240, 255,',
          'rgba(255, 0, 200,',
          'rgba(255, 255, 255,',
          'rgba(197, 160, 89,'
        ];
        this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.twinklePhase += this.twinkleSpeed;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }

      draw() {
        const opacity = this.baseOpacity + Math.sin(this.twinklePhase) * 0.25;
        const finalOpacity = Math.min(Math.max(opacity, 0.05), 0.7);
        ctx.fillStyle = `${this.colorPrefix}${finalOpacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class ShootingStar {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width * 0.8 + canvas.width * 0.2;
        this.y = Math.random() * canvas.height * 0.4;
        this.len = Math.random() * 80 + 40;
        this.speed = Math.random() * 10 + 8;
        this.dx = -this.speed;
        this.dy = this.speed * 0.6;
        this.opacity = 1.0;
        this.active = false;
      }

      trigger() {
        this.active = true;
      }

      update() {
        if (!this.active) return;
        this.x += this.dx;
        this.y += this.dy;
        this.opacity -= 0.025;

        if (this.opacity <= 0 || this.x < -100 || this.y > canvas.height + 100) {
          this.reset();
        }
      }

      draw() {
        if (!this.active) return;
        ctx.save();
        const grad = ctx.createLinearGradient(this.x, this.y, this.x - this.dx * 1.5, this.y - this.dy * 1.5);
        grad.addColorStop(0, `rgba(0, 240, 255, ${this.opacity})`);
        grad.addColorStop(0.3, `rgba(255, 0, 200, ${this.opacity * 0.5})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.dx, this.y - this.dy);
        ctx.stroke();
        ctx.restore();
      }
    }

    for (let i = 0; i < 85; i++) {
      particles.push(new Particle());
    }
    for (let i = 0; i < 2; i++) {
      shootingStars.push(new ShootingStar());
    }

    const backgroundPlanets = [
      { xPct: 0.15, yPct: 0.75, radius: 20, color1: 'rgba(255, 0, 200, 0.15)', color2: 'rgba(46, 0, 75, 0.08)', parallaxFactor: 0.05 },
      { xPct: 0.85, yPct: 0.15, radius: 15, color1: 'rgba(0, 255, 135, 0.12)', color2: 'rgba(0, 59, 32, 0.06)', parallaxFactor: 0.03 }
    ];

    // Orange/Red Saturn style planet config matching tech-mastery
    const planetConf = {
      xPct: (w) => w < 768 ? 0.85 : 0.82,
      yPct: 0.35,
      radius: 55,
      color1: '#FF8C00',
      color2: '#4B1A00',
      color3: '#100502',
      ringColor1: 'rgba(255, 140, 0, 0.7)',
      ringColor2: 'rgba(139, 0, 0, 0.3)',
      ringWidth: 26,
      ringTilt: -10 * Math.PI / 180,
      ringScaleY: 0.15,
      moons: [
        { rA: 110, rB: 15, tilt: -10 * Math.PI / 180, speed: -0.025, color: 'rgba(255, 140, 0, 1)', glow: 'rgba(255, 140, 0, 1)', size: 4 },
        { rA: 160, rB: 22, tilt: 15 * Math.PI / 180, speed: 0.015, color: 'rgba(255, 215, 0, 1)', glow: 'rgba(255, 215, 0, 1)', size: 5 }
      ]
    };

    const drawPlanetSystem = (time) => {
      const scrollYOffset = -window.scrollY * 0.15;

      backgroundPlanets.forEach(bp => {
        const parallaxY = -window.scrollY * bp.parallaxFactor;
        const bpx = bp.xPct * canvas.width;
        const bpy = (bp.yPct * canvas.height) + parallaxY + Math.sin(time * 0.005 + bp.xPct * 100) * 5;

        ctx.save();
        const glowGrad = ctx.createRadialGradient(bpx, bpy, bp.radius - 2, bpx, bpy, bp.radius + 15);
        glowGrad.addColorStop(0, bp.color1);
        glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(bpx, bpy, bp.radius + 15, 0, Math.PI * 2);
        ctx.fill();

        const coreGrad = ctx.createRadialGradient(bpx - bp.radius * 0.2, bpy - bp.radius * 0.2, bp.radius * 0.1, bpx, bpy, bp.radius);
        coreGrad.addColorStop(0, bp.color1);
        coreGrad.addColorStop(0.5, bp.color2);
        coreGrad.addColorStop(1, '#050505');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(bpx, bpy, bp.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      const floatOffset = Math.sin(time * 0.015) * 8;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;
      const mouseOffsetX = (mouse.x - canvas.width / 2) * 0.03;
      const mouseOffsetY = (mouse.y - canvas.height / 2) * 0.03;

      const currentXPct = typeof planetConf.xPct === 'function' ? planetConf.xPct(window.innerWidth) : planetConf.xPct;
      const cx = (currentXPct * canvas.width) + mouseOffsetX;
      const cy = (planetConf.yPct * canvas.height) + mouseOffsetY + floatOffset + scrollYOffset;
      const radius = planetConf.radius;

      const getMoonPos = (rx, ry, tilt, angle) => {
        const mx = rx * Math.cos(angle);
        const my = ry * Math.sin(angle);
        const rxRot = mx * Math.cos(tilt) - my * Math.sin(tilt);
        const ryRot = mx * Math.sin(tilt) + my * Math.cos(tilt);
        const isBehind = Math.sin(angle) < 0;
        return { x: cx + rxRot, y: cy + ryRot, isBehind, depth: Math.sin(angle) };
      };

      const moons = planetConf.moons.map((m) => {
        const angle = time * m.speed;
        const pos = getMoonPos(m.rA, m.rB, m.tilt, angle);
        return { ...pos, size: m.size, color: m.color, glow: m.glow };
      });

      moons.forEach(m => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(m.tilt);
        ctx.scale(1, m.rB / m.rA);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, m.rA, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      moons.forEach(m => {
        if (m.isBehind) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.size * ((m.depth + 1) / 2 * 0.6 + 0.6), 0, Math.PI * 2);
          ctx.fillStyle = m.color.replace(/[\d.]+\)/, `${(m.depth + 1) / 2 * 0.7 + 0.3})`);
          ctx.shadowBlur = 12;
          ctx.shadowColor = m.glow;
          ctx.fill();
          ctx.restore();
        }
      });

      ctx.save();
      const outerGlow = ctx.createRadialGradient(cx, cy, radius - 5, cx, cy, radius + 30);
      outerGlow.addColorStop(0, 'rgba(255, 140, 0, 0.2)');
      outerGlow.addColorStop(0.5, 'rgba(139, 0, 0, 0.05)');
      outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      const coreGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
      coreGrad.addColorStop(0, planetConf.color1);
      coreGrad.addColorStop(0.3, planetConf.color2);
      coreGrad.addColorStop(0.8, planetConf.color3);
      coreGrad.addColorStop(1, '#020308');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (planetConf.ringWidth > 0) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(planetConf.ringTilt);
        ctx.scale(1, planetConf.ringScaleY);
        const ringGrad = ctx.createRadialGradient(0, 0, radius + 8, 0, 0, radius + planetConf.ringWidth + 10);
        ringGrad.addColorStop(0, planetConf.ringColor1);
        ringGrad.addColorStop(0.4, 'rgba(255, 140, 0, 0.05)');
        ringGrad.addColorStop(0.7, planetConf.ringColor2);
        ringGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.strokeStyle = ringGrad;
        ctx.lineWidth = planetConf.ringWidth;
        ctx.beginPath();
        ctx.arc(0, 0, radius + 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      moons.forEach(m => {
        if (!m.isBehind) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.size * ((m.depth + 1) / 2 * 0.6 + 0.6), 0, Math.PI * 2);
          ctx.fillStyle = m.color.replace(/[\d.]+\)/, `${(m.depth + 1) / 2 * 0.7 + 0.3})`);
          ctx.shadowBlur = 12;
          ctx.shadowColor = m.glow;
          ctx.fill();
          ctx.restore();
        }
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frameCount++;

      if (Math.random() < 0.003) {
        const inactiveStar = shootingStars.find(s => !s.active);
        if (inactiveStar) inactiveStar.trigger();
      }
      shootingStars.forEach(s => { s.update(); s.draw(); });

      particles.forEach(p => { p.update(); p.draw(); });

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
      <canvas
        ref={canvasRef}
        id="projects-canvas"
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
      />
      {/* TopNavBar */}
      <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 w-[95%] sm:w-[90%] max-w-[1280px] rounded-full border border-white/10 z-50 bg-background/80 backdrop-blur-[20px] shadow-2xl flex justify-between items-center px-4 py-2.5 sm:px-8 sm:py-4 transition-all duration-500 ease-in-out" id="main-nav">
        <Link href="/" className="font-mono text-base sm:text-body-lg font-bold tracking-tighter text-electric-cyan hover:opacity-85 transition-opacity">
          QD
        </Link>
        <div className="flex items-center gap-2 sm:gap-4 md:gap-8 text-[11px] sm:text-xs md:text-body-md">
          <Link href="/projects" className="text-electric-cyan font-medium hover:text-electric-cyan transition-colors duration-300 font-sans">
            Projects
          </Link>
          <Link href="/blog" className="text-on-surface-variant font-medium hover:text-electric-cyan transition-colors duration-300 font-sans">
            Blog
          </Link>
          <Link href="/#tech-mastery" className="text-on-surface-variant font-medium hover:text-electric-cyan transition-colors duration-300 font-sans">
            Skills
          </Link>
          <Link href="/#contact" className="text-on-surface-variant font-medium hover:text-electric-cyan transition-colors duration-300 font-sans">
            Contact
          </Link>
          {user ? (
            <button
              onClick={() => {
                localStorage.removeItem('portfolio_auth_token');
                setUser(null);
                window.location.reload();
              }}
              className="text-on-surface-variant font-medium hover:text-electric-cyan transition-colors duration-300 font-sans whitespace-nowrap"
            >
              Logout ({user.username})
            </button>
          ) : (
            <Link href="/admin/login" className="text-on-surface-variant font-medium hover:text-electric-cyan transition-colors duration-300 font-sans">
              Login
            </Link>
          )}
        </div>
        <a
          href={contacts.email ? `https://mail.google.com/mail/?view=cm&fs=1&to=${contacts.email}` : '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-electric-cyan text-on-primary-fixed font-mono text-[10px] sm:text-label-mono px-3.5 py-1.5 sm:px-6 sm:py-2 rounded-full hover:scale-95 transition-transform active:scale-90 whitespace-nowrap"
        >
          Hire Me
        </a>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-32 px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto w-full relative z-10">
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
      <footer className="w-full border-t border-white/5 bg-background reveal relative z-10">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center py-16 px-margin-desktop gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="font-mono text-body-lg text-electric-cyan font-bold">QD</div>
            <p className="font-sans text-body-md text-on-surface-variant">© 2026 Built with Precision</p>
          </div>
          <a
            href={contacts.email ? `https://mail.google.com/mail/?view=cm&fs=1&to=${contacts.email}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-electric-cyan/5 border border-electric-cyan/20 text-electric-cyan px-6 py-2 rounded-full font-mono text-label-mono hover:bg-electric-cyan/10 transition-all text-center"
          >
            Let's Collaborate
          </a>
        </div>
      </footer>
    </div>
  );
}
