'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/utils/api';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [contacts, setContacts] = useState({ email: '' });

  useEffect(() => {
    async function loadData() {
      try {
        const blogsData = await fetchApi('/api/blogs');
        // Filter only published ones and sort by date descending
        const publishedBlogs = blogsData
          .filter(b => b.isPublished)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBlogs(publishedBlogs);
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
  }, [blogs]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[1280px] rounded-full border border-white/10 z-50 bg-background/80 backdrop-blur-[20px] shadow-2xl flex justify-between items-center px-8 py-4 transition-all duration-500 ease-in-out" id="main-nav">
        <Link href="/" className="font-mono text-body-lg font-bold tracking-tighter text-electric-cyan hover:opacity-85 transition-opacity">
          QD
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/projects" className="text-on-surface-variant font-medium hover:text-electric-cyan transition-colors duration-300 font-sans text-body-md">
            Projects
          </Link>
          <Link href="/blog" className="text-electric-cyan font-medium hover:text-electric-cyan transition-colors duration-300 font-sans text-body-md">
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
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="font-sora text-4xl md:text-5xl font-bold text-on-surface mb-4">Insights & Archives</h1>
            <p className="font-sans text-body-lg text-on-surface-variant">
              Exploring backend engineering paradigms, system designs, database optimizations, and modern software architectures.
            </p>
          </div>

          {/* Blog Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 staggered-container">
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <Link
                  href={`/blog/${blog.slug}`}
                  key={blog.id}
                  className="group cursor-pointer reveal flex flex-col justify-between glass-card p-6 rounded-2xl hover:border-electric-cyan/20 transition-all duration-500"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <time className="font-mono text-[11px] text-on-surface-variant uppercase">
                        {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </time>
                    </div>
                    <h3 className="font-sora text-xl font-bold text-on-surface group-hover:text-electric-cyan transition-colors line-clamp-2">
                      {blog.name}
                    </h3>
                    <p className="font-sans text-body-md text-on-surface-variant line-clamp-4 leading-relaxed">
                      {blog.summary}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-electric-cyan font-mono text-xs font-semibold">
                    <span>Read Article</span>
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center text-on-surface-variant py-24 glass-card rounded-2xl border border-white/5">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2">article</span>
                <p>No articles found.</p>
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
