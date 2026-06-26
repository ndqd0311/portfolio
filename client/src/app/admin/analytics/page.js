'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '@/utils/api';

// ─── Date range presets ─────────────────────────────────────────────────────
const DATE_RANGES = [
  { label: '7 ngày', days: 7 },
  { label: '30 ngày', days: 30 },
  { label: '90 ngày', days: 90 },
];

// ─── Format helpers ─────────────────────────────────────────────────────────
const fmt = (v) => (v == null ? '—' : Number(v).toLocaleString());
const fmtPct = (v) => (v == null ? '—' : `${Number(v).toFixed(1)}%`);
const fmtTime = (secs) => {
  if (secs == null || secs === 0) return '—';
  const s = Math.round(secs);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
};

// parse YYYYMMDD → "Jun 24"
const fmtDateShort = (yyyymmdd) => {
  if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd;
  try {
    const d = new Date(
      parseInt(yyyymmdd.slice(0, 4)),
      parseInt(yyyymmdd.slice(4, 6)) - 1,
      parseInt(yyyymmdd.slice(6, 8))
    );
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return yyyymmdd; }
};

// ─── SVG Sparkline chart ────────────────────────────────────────────────────
function Sparkline({ data, color = '#00f5d4', height = 72 }) {
  if (!data || data.length < 2) {
    return <div style={{ height }} className="opacity-20 bg-white/5 rounded" />;
  }
  const values = data.map((d) => d.y ?? 0);
  const max = Math.max(...values, 1);
  const W = 300;
  const H = height;
  const step = W / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${H - (v / max) * (H - 6)}`).join(' ');
  const area = `0,${H} ${points} ${W},${H}`;
  const gradId = `sg-${color.replace('#', '')}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradId})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Dual-line chart for pageviews vs sessions ──────────────────────────────
function DualLineChart({ data, height = 110 }) {
  if (!data || data.length < 2) return <div style={{ height }} className="opacity-20 bg-white/5 rounded" />;
  const pvVals = data.map((d) => d.pageviews ?? 0);
  const sVals = data.map((d) => d.sessions ?? 0);
  const max = Math.max(...pvVals, ...sVals, 1);
  const W = 300;
  const H = height;
  const step = W / (data.length - 1);

  const toPoints = (vals) => vals.map((v, i) => `${i * step},${H - (v / max) * (H - 6)}`).join(' ');
  const toArea = (vals) => `0,${H} ${toPoints(vals)} ${W},${H}`;

  const pvPts = toPoints(pvVals);
  const sPts = toPoints(sVals);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="gPv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00f5d4" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00f5d4" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="gSe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={toArea(pvVals)} fill="url(#gPv)" />
      <polygon points={toArea(sVals)} fill="url(#gSe)" />
      <polyline points={pvPts} fill="none" stroke="#00f5d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={sPts} fill="none" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 2" />
    </svg>
  );
}

// ─── Horizontal bar chart ───────────────────────────────────────────────────
function BarList({ items, colorClass = 'bg-electric-cyan' }) {
  if (!items || items.length === 0) {
    return <p className="text-center font-mono text-xs text-on-surface-variant/50 py-6">No data available</p>;
  }
  const max = Math.max(...items.map((i) => i.y ?? 0), 1);
  return (
    <div className="space-y-2.5">
      {items.slice(0, 8).map((item, idx) => {
        const pct = Math.max(Math.round(((item.y ?? 0) / max) * 100), 2);
        return (
          <div key={idx} className="flex items-center gap-3 group">
            <div className="w-32 truncate font-sans text-xs text-on-surface-variant group-hover:text-on-surface transition-colors text-right shrink-0 leading-tight">
              {item.x || '(direct)'}
            </div>
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div style={{ width: `${pct}%` }} className={`h-full rounded-full transition-all duration-700 ${colorClass}`} />
            </div>
            <div className="font-mono text-[11px] text-on-surface-variant w-10 text-right shrink-0">
              {(item.y ?? 0).toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── KPI Card ──────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, colorClass, iconBgClass, loading }) {
  return (
    <div className={`glass-card rounded-2xl border border-white/5 p-5 bg-surface-dark/40 flex items-center gap-4 transition-all group hover:border-opacity-30 ${colorClass}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 ${iconBgClass}`}>
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        {loading ? (
          <div className="h-7 w-20 bg-white/10 rounded animate-pulse mb-1" />
        ) : (
          <div className="font-mono text-2xl font-bold text-on-surface leading-tight">{value ?? '—'}</div>
        )}
        <div className="font-sans text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">{label}</div>
        {sub && !loading && (
          <div className="font-mono text-[10px] text-on-surface-variant/60 mt-0.5">{sub}</div>
        )}
      </div>
    </div>
  );
}

// ─── Blog helpers ────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return dateStr; }
};
const getPercent = (v, max) => (!max ? 0 : Math.round((v / max) * 100));

// ════════════════════════════════════════════════════════════════════════════
// Main Page
// ════════════════════════════════════════════════════════════════════════════
export default function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState('blogs');
  const [trafficDays, setTrafficDays] = useState(7);

  // Blog state
  const [blogStats, setBlogStats] = useState(null);
  const [blogLoading, setBlogLoading] = useState(true);
  const [blogError, setBlogError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('viewCount');
  const [sortAsc, setSortAsc] = useState(false);

  // GA4 Traffic state
  const [gaData, setGaData] = useState(null);
  const [gaLoading, setGaLoading] = useState(false);
  const [gaError, setGaError] = useState(null);

  const [mounted, setMounted] = useState(false);

  // ─── Fetch blog stats ───────────────────────────────────────────────────
  const fetchBlogStats = async () => {
    setBlogLoading(true);
    setBlogError(null);
    try {
      const data = await fetchApi('/api/blogs/stats');
      setBlogStats(data);
    } catch (err) {
      setBlogError(err.message || 'Failed to load blog statistics.');
    } finally {
      setBlogLoading(false);
    }
  };

  // ─── Fetch GA4 data ─────────────────────────────────────────────────────
  const fetchGaData = useCallback(async (days) => {
    setGaLoading(true);
    setGaError(null);
    try {
      const res = await fetch(`/api/ga?days=${days}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setGaData(data);
    } catch (err) {
      setGaError(err.message || 'Failed to load analytics data.');
    } finally {
      setGaLoading(false);
    }
  }, []);

  useEffect(() => { setMounted(true); fetchBlogStats(); }, []);
  useEffect(() => { if (activeTab === 'traffic') fetchGaData(trafficDays); }, [activeTab, trafficDays, fetchGaData]);

  if (!mounted) return (
    <div className="flex flex-col justify-center items-center py-24 font-mono text-on-surface-variant bg-black/10 rounded-2xl border border-white/5 glass-card">
      <span className="material-symbols-outlined text-electric-cyan text-4xl animate-spin mb-4">sync</span>
      <span>Loading...</span>
    </div>
  );

  // ─── Blog table helpers ─────────────────────────────────────────────────
  const getProcessedBlogs = () => {
    if (!blogStats?.blogs) return [];
    let filtered = blogStats.blogs.filter((b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    filtered.sort((a, b) => {
      let aV = a[sortField], bV = b[sortField];
      if (sortField === 'createdAt') { aV = new Date(aV).getTime(); bV = new Date(bV).getTime(); }
      if (typeof aV === 'string') return sortAsc ? aV.localeCompare(bV) : bV.localeCompare(aV);
      return sortAsc ? aV - bV : bV - aV;
    });
    return filtered;
  };
  const handleSort = (f) => { if (sortField === f) setSortAsc(!sortAsc); else { setSortField(f); setSortAsc(false); } };

  const s = gaData?.summary;

  return (
    <div className="space-y-8 min-h-full flex flex-col pb-12">

      {/* ── Header & Tab switcher ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-sora text-3xl font-bold text-on-surface">Web Analytics</h1>
        </div>

        <div className="flex p-1 bg-surface-dark border border-white/5 rounded-xl self-start sm:self-center">
          {[
            { id: 'blogs', icon: 'database', label: 'Blog Statistics' },
            { id: 'traffic', icon: 'trending_up', label: 'Web Traffic' },
          ].map(({ id, icon, label }) => (
            <button key={id} id={`tab-${id}`} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-lg transition-all cursor-pointer ${activeTab === id
                ? 'bg-electric-cyan text-background font-bold shadow-lg shadow-electric-cyan/20'
                : 'text-on-surface-variant hover:text-on-surface'
                }`}>
              <span className="material-symbols-outlined text-sm">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          TAB 1 — BLOG STATISTICS
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'blogs' && (
        <div className="space-y-8">
          {blogLoading && (
            <div className="flex flex-col justify-center items-center py-24 font-mono text-on-surface-variant bg-black/10 rounded-2xl border border-white/5 glass-card">
              <span className="material-symbols-outlined text-electric-cyan text-4xl animate-spin mb-4">sync</span>
              <span>Retrieving Metrics from Database...</span>
            </div>
          )}
          {blogError && (
            <div className="glass-card rounded-2xl border border-red-500/10 p-8 bg-red-500/5 max-w-2xl mx-auto space-y-6">
              <div className="flex items-center gap-3 text-red-400">
                <span className="material-symbols-outlined text-3xl">error</span>
                <h3 className="font-sora text-lg font-bold">API Connection Error</h3>
              </div>
              <p className="font-sans text-sm text-on-surface-variant">{blogError}</p>
              <button onClick={fetchBlogStats}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-xs font-mono text-on-surface transition-all cursor-pointer">
                <span className="material-symbols-outlined text-sm">refresh</span>
                Retry Connection
              </button>
            </div>
          )}

          {blogStats && (
            <>
              {/* KPI row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <KpiCard icon="visibility" label="Accumulated Views" value={blogStats.totalViews?.toLocaleString()} colorClass="hover:border-electric-cyan/30" iconBgClass="bg-electric-cyan/10 text-electric-cyan" />
                <KpiCard icon="favorite" label="Total Likes" value={blogStats.totalLikes?.toLocaleString()} colorClass="hover:border-pink-400/30" iconBgClass="bg-pink-500/10 text-pink-400" />
                <KpiCard icon="comment" label="Total Comments" value={blogStats.totalComments?.toLocaleString()} colorClass="hover:border-amber-400/30" iconBgClass="bg-amber-500/10 text-amber-400" />
                <KpiCard icon="article" label="Total Blog Posts" value={blogStats.totalBlogs?.toLocaleString()} colorClass="hover:border-emerald-400/30" iconBgClass="bg-emerald-500/10 text-emerald-400" />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top 5 most viewed */}
                <div className="glass-card rounded-2xl border border-white/5 p-6 bg-surface-dark/30 space-y-6">
                  <div>
                    <h3 className="font-sora text-base font-bold text-on-surface">Top 5 Most Viewed Blogs</h3>
                    <p className="font-sans text-xs text-on-surface-variant">Sorted by reader viewership</p>
                  </div>
                  <div className="space-y-4">
                    {blogStats.blogs?.length > 0 ? blogStats.blogs.slice(0, 5).map((blog, idx) => {
                      const pct = getPercent(blog.viewCount, blogStats.blogs[0]?.viewCount || 1);
                      return (
                        <div key={blog.id} className="space-y-1.5 group">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-sans text-on-surface truncate pr-4 max-w-[75%] font-medium hover:text-electric-cyan transition-colors">
                              {idx + 1}. {blog.name}
                            </span>
                            <span className="font-mono text-on-surface-variant group-hover:text-electric-cyan transition-colors">
                              {blog.viewCount.toLocaleString()} views
                            </span>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div style={{ width: `${Math.max(pct, 3)}%` }}
                              className="h-full bg-gradient-to-r from-electric-cyan to-indigo-500 rounded-full transition-all duration-1000" />
                          </div>
                        </div>
                      );
                    }) : <p className="font-mono text-xs text-on-surface-variant text-center py-8">No blogs yet.</p>}
                  </div>
                </div>

                {/* Engagement breakdown */}
                <div className="glass-card rounded-2xl border border-white/5 p-6 bg-surface-dark/30 space-y-6">
                  <div>
                    <h3 className="font-sora text-base font-bold text-on-surface">Content Engagement Index</h3>
                    <p className="font-sans text-xs text-on-surface-variant">Likes vs. Comments breakdown</p>
                  </div>
                  <div className="space-y-4">
                    {blogStats.blogs?.length > 0 ? blogStats.blogs.slice(0, 5).map((blog) => {
                      const total = blog.likesCount + blog.commentsCount;
                      const likeP = total > 0 ? getPercent(blog.likesCount, total) : 0;
                      const cmtP = total > 0 ? getPercent(blog.commentsCount, total) : 0;
                      return (
                        <div key={blog.id} className="space-y-1.5 group">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-sans text-on-surface truncate pr-4 max-w-[75%] font-medium">{blog.name}</span>
                            <div className="flex gap-3 font-mono text-[10px]">
                              <span className="text-pink-400">♥ {blog.likesCount}</span>
                              <span className="text-amber-400">💬 {blog.commentsCount}</span>
                            </div>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                            {total > 0 ? (
                              <>
                                <div style={{ width: `${likeP}%` }} className="h-full bg-pink-500 transition-all duration-1000" />
                                <div style={{ width: `${cmtP}%` }} className="h-full bg-amber-500 transition-all duration-1000" />
                              </>
                            ) : <div className="h-full w-full bg-white/5 rounded-full" />}
                          </div>
                        </div>
                      );
                    }) : <p className="font-mono text-xs text-on-surface-variant text-center py-8">No blogs yet.</p>}
                  </div>
                </div>
              </div>

              {/* Detailed table */}
              <div className="glass-card rounded-2xl border border-white/5 bg-surface-dark/20 p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 className="font-sora text-base font-bold text-on-surface">Detailed Blogs Performance</h3>
                  <div className="relative w-full sm:w-72">
                    <span className="material-symbols-outlined text-on-surface-variant absolute left-3.5 top-2.5 text-lg">search</span>
                    <input type="text" placeholder="Search blogs..." value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-black/20 border border-white/5 focus:border-electric-cyan focus:outline-none font-sans placeholder:text-on-surface-variant/50 text-on-surface transition-all" />
                  </div>
                </div>
                <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/10">
                  <table className="w-full border-collapse text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02] text-on-surface-variant font-mono uppercase tracking-wider text-[10px]">
                        {[
                          { label: 'Blog Title', f: 'name', min: '280px', right: false },
                          { label: 'Created', f: 'createdAt', min: '120px', right: false },
                          { label: 'Views', f: 'viewCount', min: '100px', right: true },
                          { label: 'Likes', f: 'likesCount', min: '100px', right: true },
                          { label: 'Comments', f: 'commentsCount', min: '100px', right: true },
                        ].map(({ label, f, min, right }) => (
                          <th key={f} onClick={() => handleSort(f)}
                            style={{ minWidth: min }}
                            className="py-4 px-4 cursor-pointer select-none hover:text-on-surface transition-colors">
                            <div className={`flex items-center gap-1.5 ${right ? 'justify-end' : ''}`}>
                              {label}
                              {sortField === f && <span className="material-symbols-outlined text-xs">{sortAsc ? 'arrow_upward' : 'arrow_downward'}</span>}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {getProcessedBlogs().length > 0 ? getProcessedBlogs().map((blog) => (
                        <tr key={blog.id} className="hover:bg-white/[0.01] transition-all group">
                          <td className="py-4 px-4 font-medium text-on-surface group-hover:text-electric-cyan transition-colors max-w-sm truncate">{blog.name}</td>
                          <td className="py-4 px-4 text-on-surface-variant font-mono text-[11px]">{formatDate(blog.createdAt)}</td>
                          <td className="py-4 px-4 text-right font-mono font-medium text-on-surface">{blog.viewCount.toLocaleString()}</td>
                          <td className="py-4 px-4 text-right font-mono text-pink-400">{blog.likesCount.toLocaleString()}</td>
                          <td className="py-4 px-4 text-right font-mono text-amber-400">{blog.commentsCount.toLocaleString()}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="5" className="py-8 text-center font-mono text-on-surface-variant">No matching blogs found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 2 — WEB TRAFFIC (Google Analytics 4)
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'traffic' && (
        <div className="space-y-8">

          {/* Sub-header: date picker + GA badge */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 glass-card rounded-xl border border-white/5 bg-surface-dark/30">
              </div>
            </div>
            <div className="flex p-1 bg-surface-dark border border-white/5 rounded-xl self-start">
              {DATE_RANGES.map(({ label, days }) => (
                <button key={days} onClick={() => setTrafficDays(days)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer ${trafficDays === days
                    ? 'bg-electric-cyan/15 text-electric-cyan font-bold border border-electric-cyan/20'
                    : 'text-on-surface-variant hover:text-on-surface'
                    }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Error state ─────────────────────────────────────────── */}
          {gaError && (
            <div className="glass-card rounded-2xl border border-red-500/10 p-8 bg-red-500/5 max-w-3xl mx-auto space-y-5">
              <div className="flex items-center gap-3 text-red-400">
                <span className="material-symbols-outlined text-3xl">error</span>
                <h3 className="font-sora text-lg font-bold">Google Analytics Setup Required</h3>
              </div>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">{gaError}</p>

              <button onClick={() => fetchGaData(trafficDays)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-xs font-mono text-on-surface transition-all cursor-pointer">
                <span className="material-symbols-outlined text-sm">refresh</span>
                Retry
              </button>
            </div>
          )}

          {/* ── Loading skeleton ─────────────────────────────────────── */}
          {gaLoading && !gaData && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass-card rounded-2xl border border-white/5 p-5 bg-surface-dark/40 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-white/5 animate-pulse" />
                    <div className="space-y-2"><div className="h-6 w-16 bg-white/10 rounded animate-pulse" /><div className="h-3 w-20 bg-white/5 rounded animate-pulse" /></div>
                  </div>
                ))}
              </div>
              <div className="glass-card rounded-2xl border border-white/5 p-6 bg-surface-dark/30 h-52 animate-pulse rounded-2xl" />
            </div>
          )}

          {/* ── Dashboard ───────────────────────────────────────────── */}
          {gaData && !gaError && (
            s ? (
              <>
                {/* KPI row 1 */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <KpiCard icon="person" label="Unique Users" value={fmt(s.totalUsers)}
                    colorClass="hover:border-electric-cyan/30" iconBgClass="bg-electric-cyan/10 text-electric-cyan" loading={gaLoading} />
                  <KpiCard icon="pageview" label="Pageviews" value={fmt(s.pageviews)}
                    colorClass="hover:border-indigo-400/30" iconBgClass="bg-indigo-500/10 text-indigo-400" loading={gaLoading} />
                  <KpiCard icon="timeline" label="Sessions" value={fmt(s.sessions)}
                    colorClass="hover:border-emerald-400/30" iconBgClass="bg-emerald-500/10 text-emerald-400" loading={gaLoading} />
                  <KpiCard icon="timer" label="Avg. Session Duration" value={fmtTime(s.avgSessionDuration)}
                    colorClass="hover:border-amber-400/30" iconBgClass="bg-amber-500/10 text-amber-400" loading={gaLoading} />
                  <KpiCard icon="show_chart" label="Bounce Rate" value={fmtPct(s.bounceRate)}
                    colorClass="hover:border-pink-400/30" iconBgClass="bg-pink-500/10 text-pink-400" loading={gaLoading} />
                  <KpiCard icon="person_add" label="New Users" value={fmt(s.newUsers)}
                    sub={`${s.totalUsers > 0 ? Math.round((s.newUsers / s.totalUsers) * 100) : 0}% of total`}
                    colorClass="hover:border-purple-400/30" iconBgClass="bg-purple-500/10 text-purple-400" loading={gaLoading} />
                </div>

                {/* Pageviews vs Sessions chart */}
                {gaData.pageviewsOverTime?.length > 0 && (
                  <div className="glass-card rounded-2xl border border-white/5 p-6 bg-surface-dark/30 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <h3 className="font-sora text-base font-bold text-on-surface">Traffic Over Time</h3>
                        <p className="font-sans text-xs text-on-surface-variant">
                          Last {trafficDays} days — pageviews &amp; sessions per day
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="flex items-center gap-1.5">
                          <span className="w-4 h-0.5 bg-electric-cyan rounded inline-block" />
                          <span className="text-on-surface-variant">Pageviews</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-4 h-0.5 bg-indigo-400 rounded inline-block" style={{ borderTop: '2px dashed' }} />
                          <span className="text-on-surface-variant">Sessions</span>
                        </span>
                      </div>
                    </div>

                    <DualLineChart data={gaData.pageviewsOverTime} height={110} />

                    {/* Date labels */}
                    <div className="flex justify-between font-mono text-[10px] text-on-surface-variant/50 px-1">
                      {[0, Math.floor((gaData.pageviewsOverTime.length - 1) / 2), gaData.pageviewsOverTime.length - 1].map((i) => {
                        const d = gaData.pageviewsOverTime[i];
                        return d ? <span key={i}>{fmtDateShort(d.t)}</span> : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Breakdown grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="glass-card rounded-2xl border border-white/5 p-6 bg-surface-dark/30 space-y-5">
                    <div><h3 className="font-sora text-sm font-bold text-on-surface">Top Pages</h3><p className="font-sans text-xs text-on-surface-variant">Most visited URLs</p></div>
                    <BarList items={gaData.topPages} colorClass="bg-electric-cyan" />
                  </div>
                  <div className="glass-card rounded-2xl border border-white/5 p-6 bg-surface-dark/30 space-y-5">
                    <div><h3 className="font-sora text-sm font-bold text-on-surface">Traffic Sources</h3><p className="font-sans text-xs text-on-surface-variant">Where your visitors come from</p></div>
                    <BarList items={gaData.sources} colorClass="bg-indigo-500" />
                  </div>
                  <div className="glass-card rounded-2xl border border-white/5 p-6 bg-surface-dark/30 space-y-5">
                    <div><h3 className="font-sora text-sm font-bold text-on-surface">Browsers</h3><p className="font-sans text-xs text-on-surface-variant">Browser distribution</p></div>
                    <BarList items={gaData.browsers} colorClass="bg-emerald-500" />
                  </div>
                  <div className="glass-card rounded-2xl border border-white/5 p-6 bg-surface-dark/30 space-y-5">
                    <div><h3 className="font-sora text-sm font-bold text-on-surface">Devices</h3><p className="font-sans text-xs text-on-surface-variant">Desktop / Mobile / Tablet</p></div>
                    <BarList items={gaData.devices} colorClass="bg-pink-500" />
                  </div>
                  <div className="glass-card rounded-2xl border border-white/5 p-6 bg-surface-dark/30 space-y-5 lg:col-span-2">
                    <div><h3 className="font-sora text-sm font-bold text-on-surface">Top Countries</h3><p className="font-sans text-xs text-on-surface-variant">Geographic distribution of sessions</p></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
                      {gaData.countries?.length > 0 ? gaData.countries.map((item, idx) => {
                        const max = gaData.countries[0]?.y || 1;
                        const pct = Math.max(Math.round((item.y / max) * 100), 2);
                        return (
                          <div key={idx} className="flex items-center gap-3 py-1.5 group">
                            <div className="font-mono text-xs text-on-surface-variant w-5 text-right">{idx + 1}</div>
                            <div className="font-sans text-xs text-on-surface flex-1 truncate group-hover:text-electric-cyan transition-colors">{item.x || 'Unknown'}</div>
                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div style={{ width: `${pct}%` }} className="h-full bg-amber-500 rounded-full transition-all duration-700" />
                            </div>
                            <div className="font-mono text-[11px] text-on-surface-variant w-10 text-right">{item.y.toLocaleString()}</div>
                          </div>
                        );
                      }) : <p className="col-span-2 text-center font-mono text-xs text-on-surface-variant/50 py-6">No data</p>}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-card rounded-2xl border border-white/5 p-12 bg-surface-dark/20 text-center max-w-xl mx-auto space-y-4">
                <div className="w-16 h-16 bg-electric-cyan/10 text-electric-cyan rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                  <span className="material-symbols-outlined text-3xl">insights</span>
                </div>
                <h3 className="font-sora text-lg font-bold text-on-surface">No Traffic Data Yet</h3>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Your Google Analytics 4 tag is successfully connected! However, Google hasn't processed or collected any visitor data for this time period yet (which can take 24–48 hours for new properties).
                </p>
                <div className="text-xs font-mono text-on-surface-variant/60 bg-black/20 rounded-lg p-3 inline-block">
                  Tip: Visit your live website from multiple devices to generate initial traffic.
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
