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
  const [isRegister, setIsRegister] = useState(false);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        // Step 1: Register User (role is forced to User/2 in backend)
        await fetchApi('/api/auth/register', {
          method: 'POST',
          body: { username, password }
        });
      }

      // Step 2: Log In
      const response = await fetchApi('/api/auth/login', {
        method: 'POST',
        body: { username, password }
      });

      const token = response?.Token || response?.token;
      if (token) {
        setToken(token);
        
        // Step 3: Decode role and redirect
        const decoded = decodeJwt(token);
        const role = decoded?.role || decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        if (role === 'Admin') {
          router.push('/admin/projects');
        } else {
          router.push('/');
        }
      } else {
        throw new Error('Authentication token not received.');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
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
            {isRegister ? 'Access Registration Portal' : 'Administrator Access Panel'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="glass-card p-8 md:p-10 rounded-2xl space-y-6">
          <h2 className="font-sora text-xl font-semibold text-on-surface text-center">
            {isRegister ? 'Create Account' : 'Secure Sign In'}
          </h2>

          <div className="flex flex-col space-y-2">
            <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Username"
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
            {loading ? 'Processing...' : (isRegister ? 'Sign Up & Login' : 'Sign In')}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="font-mono text-xs text-electric-cyan hover:underline"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register as User"}
            </button>
          </div>
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
