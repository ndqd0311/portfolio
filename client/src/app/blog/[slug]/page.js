'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/utils/api';

// Simple self-contained markdown parser for style compliance without extra npm installations
function renderMarkdown(md = '') {
  if (!md) return null;
  const lines = md.split('\n');
  let inCodeBlock = false;
  let codeContent = [];
  const elements = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code Block checking
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // close code block
        elements.push(
          <pre key={`code-${i}`} className="bg-primary-container border border-white/5 p-6 rounded-xl font-mono text-xs text-on-surface overflow-x-auto my-6 leading-relaxed">
            <code className="text-electric-cyan font-mono select-all">
              {codeContent.join('\n')}
            </code>
          </pre>
        );
        codeContent = [];
        inCodeBlock = false;
      } else {
        // open code block
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    // Headers
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="font-sora text-3xl md:text-4xl font-bold text-on-surface mt-8 mb-4">{parseInline(line.substring(2))}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="font-sora text-2xl font-bold text-on-surface mt-8 mb-4 border-b border-white/5 pb-2">{parseInline(line.substring(3))}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="font-sora text-xl font-bold text-on-surface mt-6 mb-3">{parseInline(line.substring(4))}</h3>);
    }
    // Bullet lists
    else if (line.trim().startsWith('- ')) {
      elements.push(
        <ul key={i} className="list-disc pl-6 my-2 text-on-surface-variant leading-relaxed">
          <li>{parseInline(line.trim().substring(2))}</li>
        </ul>
      );
    }
    // Blockquote
    else if (line.trim().startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="border-l-4 border-electric-cyan bg-white/5 p-4 rounded-r-lg my-4 italic text-on-surface-variant font-sans">
          {parseInline(line.trim().substring(2))}
        </blockquote>
      );
    }
    // Paragraph
    else if (line.trim() !== '') {
      elements.push(<p key={i} className="my-4 text-on-surface-variant leading-relaxed font-sans text-body-md">{parseInline(line)}</p>);
    }
  }

  return elements;
}

// Helper to convert inline markdown elements like **bold**
function parseInline(text) {
  const parts = [];
  let currentText = text;

  // Basic regex to find **text**
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  let lastIndex = 0;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // Add bold text
    parts.push(
      <strong key={match.index} className="text-electric-cyan font-bold">
        {match[1]}
      </strong>
    );
    lastIndex = boldRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export default function BlogDetailPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState({ email: '' });

  useEffect(() => {
    async function loadData() {
      try {
        const blogData = await fetchApi(`/api/blogs/${slug}`);
        setBlog(blogData);
      } catch (err) {
        console.error('Error fetching blog details:', err);
      } finally {
        setLoading(false);
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
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center text-on-surface font-mono">
        <span className="material-symbols-outlined text-electric-cyan text-4xl animate-spin mb-4">sync</span>
        <span>Retrieving article details...</span>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center text-on-surface font-mono">
        <span className="material-symbols-outlined text-error text-4xl mb-4">warning</span>
        <span className="mb-6">Article not found or unavailable.</span>
        <Link href="/blog" className="bg-electric-cyan text-on-primary-fixed px-6 py-2 rounded-full font-mono text-xs hover:scale-95 transition-transform">
          Back to Archives
        </Link>
      </div>
    );
  }

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
          href={contacts.email ? `https://mail.google.com/mail/?view=cm&fs=1&to=${contacts.email}` : '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-electric-cyan text-on-primary-fixed font-mono text-label-mono px-6 py-2 rounded-full hover:scale-95 transition-transform active:scale-90"
        >
          Hire Me
        </a>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-32 px-margin-mobile md:px-margin-desktop max-w-[800px] mx-auto w-full">
        <article className="py-12 space-y-6">
          <div className="space-y-4 border-b border-white/5 pb-8">
            <Link href="/blog" className="inline-flex items-center gap-2 font-mono text-xs text-on-surface-variant hover:text-electric-cyan mb-2">
              <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Archives
            </Link>
            <div className="flex items-center gap-4 text-on-surface-variant font-mono text-xs">
              <span>Engineering</span>
              <span>•</span>
              <time>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
            </div>
            <h1 className="font-sora text-3xl md:text-5xl font-bold text-on-surface leading-tight">
              {blog.name}
            </h1>
            <p className="font-sans text-lg text-on-surface-variant italic leading-relaxed">
              {blog.summary}
            </p>
          </div>

          {/* Render parsed markdown content */}
          <div className="py-6 text-on-surface-variant font-sans text-body-md leading-relaxed prose prose-invert max-w-none">
            {renderMarkdown(blog.content)}
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-background">
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
