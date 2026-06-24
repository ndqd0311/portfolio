'use client';

import { useState } from 'react';

export default function AdminAnalyticsPage() {
  const shareUrl = process.env.NEXT_PUBLIC_UMAMI_SHARE_URL;
  const [iframeLoading, setIframeLoading] = useState(true);

  // If shareUrl is not configured, show instructions on how to set it up
  if (!shareUrl) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-sora text-3xl font-bold text-on-surface">Web Analytics</h1>
          <p className="font-sans text-sm text-on-surface-variant">View website visitors, reader insights, and engagement metrics.</p>
        </div>

        <div className="glass-card rounded-2xl border border-white/5 p-8 max-w-2xl space-y-6">
          <div className="flex items-center gap-3 text-electric-cyan">
            <span className="material-symbols-outlined text-3xl">info</span>
            <h3 className="font-sora text-lg font-bold">Analytics Integration Required</h3>
          </div>
          
          <div className="font-sans text-sm text-on-surface-variant leading-relaxed space-y-4">
            <p>
              To view real-time statistics (visitors, reading paths, likes, and comments) directly inside this dashboard, you need to configure the Umami Share URL.
            </p>
            <p className="font-mono text-xs text-electric-cyan/80">
              Note: This website has already been prepared with Umami script trackers. You only need to provide the environment variables.
            </p>
          </div>

          <div className="border-t border-white/5 pt-6 space-y-4">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-on-surface">Setup Instructions</h4>
            <ol className="list-decimal list-inside font-sans text-xs text-on-surface-variant space-y-3 leading-relaxed">
              <li>
                Create or log into your account on <a href="https://umami.is" target="_blank" rel="noopener noreferrer" className="text-electric-cyan hover:underline">Umami Cloud</a>.
              </li>
              <li>
                Add your website <code className="bg-white/5 px-1.5 py-0.5 rounded font-mono text-[11px]">portfolio-justad311s-projects.vercel.app</code> to get a <strong>Website ID</strong>.
              </li>
              <li>
                Go to Website Settings &gt; <strong>Share</strong> and enable the <strong>Share URL</strong>. Copy the link.
              </li>
              <li>
                Add the following keys to your local <code className="bg-white/5 px-1.5 py-0.5 rounded font-mono text-[11px]">.env.local</code> file (or in Vercel settings):
                <pre className="bg-primary-container p-4 rounded-xl border border-white/5 font-mono text-[11px] text-electric-cyan select-all mt-2 space-y-1">
                  <div>NEXT_PUBLIC_UMAMI_WEBSITE_ID=your-website-uuid</div>
                  <div>NEXT_PUBLIC_UMAMI_SHARE_URL=your-copied-share-link</div>
                </pre>
              </li>
              <li>Restart your development server or redeploy to Vercel.</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Clean iframe URL (appends header/footer flags to hide Umami wrapper header/footers)
  const cleanIframeUrl = shareUrl.includes('?') 
    ? `${shareUrl}&header=false&footer=false`
    : `${shareUrl}?header=false&footer=false`;

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div>
        <h1 className="font-sora text-3xl font-bold text-on-surface">Web Analytics</h1>
        <p className="font-sans text-sm text-on-surface-variant">View website visitors, reader insights, and engagement metrics.</p>
      </div>

      <div className="relative flex-1 min-h-[720px] rounded-2xl overflow-hidden border border-white/10 bg-black/25 shadow-2xl glass-card">
        {iframeLoading && (
          <div className="absolute inset-0 flex flex-col justify-center items-center font-mono text-on-surface-variant bg-background/50 backdrop-blur-sm z-10">
            <span className="material-symbols-outlined text-electric-cyan text-4xl animate-spin mb-4">sync</span>
            <span>Loading Analytics Dashboard...</span>
          </div>
        )}
        <iframe
          src={cleanIframeUrl}
          onLoad={() => setIframeLoading(false)}
          className="w-full h-full min-h-[720px] border-0 rounded-2xl"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}
