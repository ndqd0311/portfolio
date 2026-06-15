'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchApi, setToken } from '@/utils/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetchApi('/api/auth/login', {
        method: 'POST',
        body: { username, password }
      });

      const token = response?.Token || response?.token;
      if (token) {
        setToken(token);
        router.push('/admin/projects');
      } else {
        throw new Error('Authentication token not received.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-electric-cyan/5 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-muted-gold/5 rounded-full filter blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-mono text-3xl font-bold tracking-tighter text-electric-cyan hover:opacity-85 transition-opacity">
            QD
          </Link>
          <p className="font-sans text-sm text-on-surface-variant mt-2">
            Administrator Access Panel
          </p>
        </div>

        <form onSubmit={handleLogin} className="glass-card p-8 md:p-10 rounded-2xl space-y-6">
          <h2 className="font-sora text-xl font-semibold text-on-surface text-center">Secure Sign In</h2>

          <div className="flex flex-col space-y-2">
            <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="admin"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-on-surface placeholder-white/20 focus:outline-none focus:border-electric-cyan transition-colors"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-on-surface placeholder-white/20 focus:outline-none focus:border-electric-cyan transition-colors"
            />
          </div>

          {error && (
            <div className="p-4 bg-error/10 border border-error/20 text-error rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-electric-cyan text-on-primary-fixed py-4 rounded-full font-mono text-label-mono hover:scale-[0.98] active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/" className="font-mono text-xs text-on-surface-variant hover:text-electric-cyan transition-colors flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Return to Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}
