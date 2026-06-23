'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { fetchApi, getToken } from '@/utils/api';

const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState({ phone: '', email: '', facebook: '', github: '' });
  const [user, setUser] = useState(null);
  
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check authentication
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

    // Fetch contact email for "Hire Me" button
    async function loadContacts() {
      try {
        const contactsData = await fetchApi('/api/contacts');
        if (contactsData) {
          setContacts(contactsData);
        }
      } catch (err) {
        console.error('Error fetching contacts in Navbar:', err);
      }
    }
    loadContacts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('portfolio_auth_token');
    setUser(null);
    window.location.reload();
  };

  const handleLogoClick = (e) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Helper to determine if link is active
  const isActive = (path) => {
    if (path === '/blog') {
      return pathname.startsWith('/blog') ? 'text-electric-cyan' : 'text-on-surface-variant';
    }
    return pathname === path ? 'text-electric-cyan' : 'text-on-surface-variant';
  };

  return (
    <nav
      className={`fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[1280px] border border-white/10 z-50 bg-background/80 backdrop-blur-[20px] shadow-2xl transition-all duration-500 ease-in-out px-8 py-4 ${
        isOpen ? 'rounded-[2rem] flex flex-col gap-6' : 'rounded-full flex justify-between items-center'
      }`}
      id="main-nav"
    >
      {/* Brand, Desktop Navigation, & Actions Container */}
      <div className="w-full flex justify-between items-center md:contents">
        {/* Brand Logo */}
        <Link
          href="/"
          onClick={handleLogoClick}
          className="font-mono text-body-lg font-bold tracking-tighter text-electric-cyan hover:opacity-85 transition-opacity"
        >
          QD
        </Link>

        {/* Desktop Links (Hidden on Mobile, Centered on Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/projects" className={`${isActive('/projects')} font-medium hover:text-electric-cyan transition-colors duration-300 font-sans text-body-md`}>
            Projects
          </Link>
          <Link href="/blog" className={`${isActive('/blog')} font-medium hover:text-electric-cyan transition-colors duration-300 font-sans text-body-md`}>
            Blog
          </Link>
          <Link href="/#tech-mastery" className="text-on-surface-variant font-medium hover:text-electric-cyan transition-colors duration-300 font-sans text-body-md">
            Skills
          </Link>
          <Link href="/#contact" className="text-on-surface-variant font-medium hover:text-electric-cyan transition-colors duration-300 font-sans text-body-md">
            Contact
          </Link>
          {user ? (
            <button
              onClick={handleLogout}
              className="text-on-surface-variant font-medium hover:text-electric-cyan transition-colors duration-300 font-sans text-body-md cursor-pointer"
            >
              Logout ({user.username})
            </button>
          ) : (
            <Link href="/admin/login" className="text-on-surface-variant font-medium hover:text-electric-cyan transition-colors duration-300 font-sans text-body-md">
              Login
            </Link>
          )}
        </div>

        {/* Actions Button Container (Right Aligned) */}
        <div className="flex items-center gap-4">
          <a
            href={contacts.email ? `https://mail.google.com/mail/?view=cm&fs=1&to=${contacts.email}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-electric-cyan text-on-primary-fixed font-mono text-label-mono px-5 py-2 rounded-full text-[11px] tracking-wider uppercase font-semibold hover:scale-95 transition-all duration-300 active:scale-90"
          >
            Hire Me
          </a>

          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-on-surface hover:text-electric-cyan transition-colors md:hidden focus:outline-none flex items-center justify-center p-1"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {isOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown (Visible on Mobile when open) */}
      {isOpen && (
        <div className="flex flex-col w-full gap-4 md:hidden border-t border-white/5 pt-4 animate-[fadeUp_0.3s_ease-out]">
          <Link
            href="/projects"
            onClick={() => setIsOpen(false)}
            className={`${isActive('/projects')} font-medium hover:text-electric-cyan transition-colors duration-300 font-sans py-2 text-center text-body-md`}
          >
            Projects
          </Link>
          <Link
            href="/blog"
            onClick={() => setIsOpen(false)}
            className={`${isActive('/blog')} font-medium hover:text-electric-cyan transition-colors duration-300 font-sans py-2 text-center text-body-md`}
          >
            Blog
          </Link>
          <Link
            href="/#tech-mastery"
            onClick={() => setIsOpen(false)}
            className="text-on-surface-variant font-medium hover:text-electric-cyan transition-colors duration-300 font-sans py-2 text-center text-body-md"
          >
            Skills
          </Link>
          <Link
            href="/#contact"
            onClick={() => setIsOpen(false)}
            className="text-on-surface-variant font-medium hover:text-electric-cyan transition-colors duration-300 font-sans py-2 text-center text-body-md"
          >
            Contact
          </Link>
          {user ? (
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="text-on-surface-variant font-medium hover:text-electric-cyan transition-colors duration-300 font-sans py-2 text-center text-body-md cursor-pointer"
            >
              Logout ({user.username})
            </button>
          ) : (
            <Link
              href="/admin/login"
              onClick={() => setIsOpen(false)}
              className="text-on-surface-variant font-medium hover:text-electric-cyan transition-colors duration-300 font-sans py-2 text-center text-body-md"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
