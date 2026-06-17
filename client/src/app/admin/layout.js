'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { removeToken, isAuthenticated } from '@/utils/api';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage) {
      if (!isAuthenticated()) {
        router.push('/admin/login');
      } else {
        setAuthChecked(true);
      }
    } else {
      setAuthChecked(true);
    }
  }, [pathname, router, isLoginPage]);

  const handleLogout = () => {
    removeToken();
    router.push('/');
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center text-on-surface font-mono">
        <span className="material-symbols-outlined text-electric-cyan text-4xl animate-spin mb-4">sync</span>
        <span>Checking authorization...</span>
      </div>
    );
  }

  // If it's the login page, just render the child component without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  const menuItems = [
    { name: 'Projects', path: '/admin/projects', icon: 'folder_open' },
    { name: 'Skills & Tech', path: '/admin/skills', icon: 'architecture' },
    { name: 'Blog Management', path: '/admin/blogs', icon: 'article' },
    { name: 'Messages Inbox', path: '/admin/messages', icon: 'mail' },
    { name: 'System Settings', path: '/admin/settings', icon: 'settings' }
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col md:flex-row font-sans">

      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-surface-dark/90 backdrop-blur-[20px] flex flex-col justify-between p-6 z-40">
        <div className="space-y-8">
          <div className="flex items-center gap-2 border-b border-white/5 pb-6">
            <span className="material-symbols-outlined text-electric-cyan text-3xl">terminal</span>
            <div>
              <div className="font-mono text-sm font-bold text-electric-cyan tracking-widest">QD</div>
              <div className="font-mono text-[10px] text-on-surface-variant uppercase">Admin Console</div>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map(item => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-xs uppercase tracking-wider transition-all duration-300 ${isActive
                      ? 'bg-electric-cyan text-on-primary-fixed font-semibold scale-102'
                      : 'text-on-surface-variant hover:bg-white/5 hover:text-electric-cyan'
                    }`}
                >
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-white/5 mt-8 md:mt-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-mono text-xs uppercase tracking-wider text-error hover:bg-error/10 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Admin View Container */}
      <main className="flex-grow p-6 md:p-12 overflow-y-auto max-w-[1200px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
