'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState({
    id: 0,
    phone: '',
    email: '',
    facebook: '',
    github: ''
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ success: null, error: null, saving: false });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await fetchApi('/api/contacts');
        if (data) {
          setFormData({
            id: data.id || 0,
            phone: data.phone || '',
            email: data.email || '',
            facebook: data.facebook || '',
            github: data.github || ''
          });
        }
      } catch (err) {
        console.error('Error fetching system settings:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ success: null, error: null, saving: true });

    try {
      await fetchApi('/api/contacts', {
        method: 'PUT',
        body: formData
      });
      setStatus({ success: 'System settings updated successfully!', error: null, saving: false });
    } catch (err) {
      setStatus({ success: null, error: err.message || 'Failed to save settings.', saving: false });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 font-mono text-on-surface-variant">
        <span className="material-symbols-outlined text-electric-cyan text-3xl animate-spin mb-4">sync</span>
        <span>Loading system settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-xl">
      <div>
        <h1 className="font-sora text-3xl font-bold text-on-surface">System Settings</h1>
        <p className="font-sans text-sm text-on-surface-variant">Configure owner contact information displayed in the portfolio footer and emails.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-8 rounded-2xl space-y-6">
        <h2 className="font-sora text-lg font-bold text-electric-cyan border-b border-white/5 pb-2 uppercase tracking-wider text-xs">
          Owner Contact Details
        </h2>

        <div className="flex flex-col space-y-2">
          <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest" htmlFor="sett-phone">Phone Number</label>
          <input 
            id="sett-phone"
            type="text" 
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            placeholder="E.g. 0123456789"
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-electric-cyan transition-colors"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest" htmlFor="sett-email">Email Address</label>
          <input 
            id="sett-email"
            type="email" 
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="E.g. developer@example.com"
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-electric-cyan transition-colors"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest" htmlFor="sett-facebook">Facebook Profile Link</label>
          <input 
            id="sett-facebook"
            type="text" 
            value={formData.facebook}
            onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
            required
            placeholder="E.g. https://facebook.com/username"
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-electric-cyan transition-colors"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest" htmlFor="sett-github">GitHub Profile Link</label>
          <input 
            id="sett-github"
            type="text" 
            value={formData.github}
            onChange={(e) => setFormData({ ...formData, github: e.target.value })}
            required
            placeholder="E.g. https://github.com/username"
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-electric-cyan transition-colors"
          />
        </div>

        {status.success && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm">
            {status.success}
          </div>
        )}

        {status.error && (
          <div className="p-4 bg-error/10 border border-error/20 text-error rounded-lg text-sm">
            {status.error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={status.saving}
          className="w-full bg-electric-cyan text-on-primary-fixed py-4 rounded-full font-mono text-label-mono hover:scale-[0.98] active:scale-95 transition-transform disabled:opacity-50 font-semibold"
        >
          {status.saving ? 'Saving Changes...' : 'Save System Settings'}
        </button>
      </form>
    </div>
  );
}
