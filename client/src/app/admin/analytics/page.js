'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';

export default function AdminAnalyticsPage() {
  const shareUrl = process.env.NEXT_PUBLIC_UMAMI_SHARE_URL;
  const [activeTab, setActiveTab] = useState(shareUrl ? 'umami' : 'local');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [iframeLoading, setIframeLoading] = useState(true);

  // Table sorting and searching state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('viewCount');
  const [sortAsc, setSortAsc] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApi('/api/blogs/stats');
      setStats(data);
    } catch (err) {
      console.error('Error fetching analytics stats:', err);
      setError(err.message || 'Failed to load local statistics from the API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Format date helper
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Safe division helper
  const getPercent = (value, max) => {
    if (!max) return 0;
    return Math.round((value / max) * 100);
  };

  // Sort and filter blogs
  const getProcessedBlogs = () => {
    if (!stats || !stats.blogs) return [];
    
    // Filter
    let filtered = stats.blogs.filter(blog => 
      blog.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (typeof aVal === 'string') {
        return sortAsc 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return sortAsc 
          ? aVal - bVal 
          : bVal - aVal;
      }
    });

    return filtered;
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending for numbers
    }
  };

  // Clean iframe URL (appends header/footer flags to hide Umami wrapper header/footers)
  const cleanIframeUrl = shareUrl
    ? (shareUrl.includes('?') 
      ? `${shareUrl}&header=false&footer=false`
      : `${shareUrl}?header=false&footer=false`)
    : null;

  return (
    <div className="space-y-8 min-h-full flex flex-col pb-12">
      
      {/* Header and Toggle Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-sora text-3xl font-bold text-on-surface">Web Analytics</h1>
          <p className="font-sans text-sm text-on-surface-variant">View website visitors, reader insights, and engagement metrics.</p>
        </div>

        {/* Tab Switcher if Umami is configured */}
        {shareUrl && (
          <div className="flex p-1 bg-surface-dark border border-white/5 rounded-xl self-start sm:self-center">
            <button
              onClick={() => setActiveTab('umami')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-lg transition-all ${
                activeTab === 'umami'
                  ? 'bg-electric-cyan text-background font-bold shadow-lg shadow-electric-cyan/20'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-sm">hourglass_empty</span>
              Umami Live Visitor
            </button>
            <button
              onClick={() => setActiveTab('local')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-lg transition-all ${
                activeTab === 'local'
                  ? 'bg-electric-cyan text-background font-bold shadow-lg shadow-electric-cyan/20'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-sm">database</span>
              Database Statistics
            </button>
          </div>
        )}
      </div>

      {/* --- TAB CONTENT: UMAMI --- */}
      {activeTab === 'umami' && shareUrl && (
        <div className="relative flex-1 min-h-[720px] rounded-2xl overflow-hidden border border-white/10 bg-black/25 shadow-2xl glass-card">
          {iframeLoading && (
            <div className="absolute inset-0 flex flex-col justify-center items-center font-mono text-on-surface-variant bg-background/50 backdrop-blur-sm z-10">
              <span className="material-symbols-outlined text-electric-cyan text-4xl animate-spin mb-4">sync</span>
              <span>Loading Live Dashboard...</span>
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
      )}

      {/* --- TAB CONTENT: LOCAL DATABASE STATS --- */}
      {activeTab === 'local' && (
        <div className="space-y-8">
          
          {/* Loading state */}
          {loading && (
            <div className="flex flex-col justify-center items-center py-24 font-mono text-on-surface-variant bg-black/10 rounded-2xl border border-white/5 glass-card">
              <span className="material-symbols-outlined text-electric-cyan text-4xl animate-spin mb-4">sync</span>
              <span>Retrieving Metrics from Database...</span>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="glass-card rounded-2xl border border-red-500/10 p-8 bg-red-500/5 max-w-2xl mx-auto space-y-6">
              <div className="flex items-center gap-3 text-red-400">
                <span className="material-symbols-outlined text-3xl">error</span>
                <h3 className="font-sora text-lg font-bold">API Connection Error</h3>
              </div>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                {error}
              </p>
              <button 
                onClick={fetchStats}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-xs font-mono text-on-surface transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Retry Connection
              </button>
            </div>
          )}

          {/* Statistics Display */}
          {stats && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Views */}
                <div className="glass-card rounded-2xl border border-white/5 p-6 bg-surface-dark/40 flex items-center gap-4 hover:border-electric-cyan/20 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-electric-cyan/10 flex items-center justify-center text-electric-cyan group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">visibility</span>
                  </div>
                  <div>
                    <div className="font-mono text-2xl font-bold text-on-surface group-hover:text-electric-cyan transition-colors">
                      {stats.totalViews.toLocaleString()}
                    </div>
                    <div className="font-sans text-xs text-on-surface-variant uppercase tracking-wider">Accumulated Views</div>
                  </div>
                </div>

                {/* Likes */}
                <div className="glass-card rounded-2xl border border-white/5 p-6 bg-surface-dark/40 flex items-center gap-4 hover:border-pink-500/20 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">favorite</span>
                  </div>
                  <div>
                    <div className="font-mono text-2xl font-bold text-on-surface group-hover:text-pink-400 transition-colors">
                      {stats.totalLikes.toLocaleString()}
                    </div>
                    <div className="font-sans text-xs text-on-surface-variant uppercase tracking-wider">Total Likes</div>
                  </div>
                </div>

                {/* Comments */}
                <div className="glass-card rounded-2xl border border-white/5 p-6 bg-surface-dark/40 flex items-center gap-4 hover:border-amber-500/20 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">comment</span>
                  </div>
                  <div>
                    <div className="font-mono text-2xl font-bold text-on-surface group-hover:text-amber-400 transition-colors">
                      {stats.totalComments.toLocaleString()}
                    </div>
                    <div className="font-sans text-xs text-on-surface-variant uppercase tracking-wider">Total Comments</div>
                  </div>
                </div>

                {/* Total Blogs */}
                <div className="glass-card rounded-2xl border border-white/5 p-6 bg-surface-dark/40 flex items-center gap-4 hover:border-emerald-500/20 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">article</span>
                  </div>
                  <div>
                    <div className="font-mono text-2xl font-bold text-on-surface group-hover:text-emerald-400 transition-colors">
                      {stats.totalBlogs.toLocaleString()}
                    </div>
                    <div className="font-sans text-xs text-on-surface-variant uppercase tracking-wider">Total Blog Posts</div>
                  </div>
                </div>

              </div>

              {/* Custom CSS Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Chart 1: Views Bar Chart */}
                <div className="glass-card rounded-2xl border border-white/5 p-6 bg-surface-dark/30 space-y-6">
                  <div>
                    <h3 className="font-sora text-base font-bold text-on-surface">Top 5 Most Viewed Blogs</h3>
                    <p className="font-sans text-xs text-on-surface-variant">Blog posts sorted by reader viewership</p>
                  </div>
                  
                  <div className="space-y-4">
                    {stats.blogs && stats.blogs.length > 0 ? (
                      stats.blogs.slice(0, 5).map((blog, idx) => {
                        const maxViews = stats.blogs[0]?.viewCount || 1;
                        const percentage = getPercent(blog.viewCount, maxViews);
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
                              <div 
                                style={{ width: `${Math.max(percentage, 3)}%` }} 
                                className="h-full bg-gradient-to-r from-electric-cyan to-indigo-500 rounded-full transition-all duration-1000 group-hover:brightness-125"
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="font-mono text-xs text-on-surface-variant text-center py-8">No blogs created yet.</div>
                    )}
                  </div>
                </div>

                {/* Chart 2: Engagement Breakdown (Likes vs Comments) */}
                <div className="glass-card rounded-2xl border border-white/5 p-6 bg-surface-dark/30 space-y-6">
                  <div>
                    <h3 className="font-sora text-base font-bold text-on-surface">Content Engagement Index</h3>
                    <p className="font-sans text-xs text-on-surface-variant">Breakdown of Likes vs. Comments on top blogs</p>
                  </div>

                  <div className="space-y-4">
                    {stats.blogs && stats.blogs.length > 0 ? (
                      stats.blogs.slice(0, 5).map((blog) => {
                        const totalEngage = blog.likesCount + blog.commentsCount;
                        const maxEngage = stats.blogs.reduce((max, b) => {
                          const sum = b.likesCount + b.commentsCount;
                          return sum > max ? sum : max;
                        }, 0) || 1;

                        const likePercent = totalEngage > 0 ? getPercent(blog.likesCount, totalEngage) : 0;
                        const commentPercent = totalEngage > 0 ? getPercent(blog.commentsCount, totalEngage) : 0;
                        const totalPercent = getPercent(totalEngage, maxEngage);

                        return (
                          <div key={blog.id} className="space-y-1.5 group">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-sans text-on-surface truncate pr-4 max-w-[75%] font-medium">
                                {blog.name}
                              </span>
                              <div className="flex gap-3 font-mono text-[10px]">
                                <span className="text-pink-400">♥ {blog.likesCount}</span>
                                <span className="text-amber-400">💬 {blog.commentsCount}</span>
                              </div>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                              {totalEngage > 0 ? (
                                <>
                                  <div 
                                    style={{ width: `${likePercent}%` }} 
                                    className="h-full bg-pink-500 transition-all duration-1000 group-hover:brightness-110"
                                    title={`${likePercent}% Likes`}
                                  />
                                  <div 
                                    style={{ width: `${commentPercent}%` }} 
                                    className="h-full bg-amber-500 transition-all duration-1000 group-hover:brightness-110"
                                    title={`${commentPercent}% Comments`}
                                  />
                                </>
                              ) : (
                                <div className="h-full w-full bg-white/5 rounded-full" />
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="font-mono text-xs text-on-surface-variant text-center py-8">No blogs created yet.</div>
                    )}
                  </div>
                </div>

              </div>

              {/* Blogs Performance Table */}
              <div className="glass-card rounded-2xl border border-white/5 bg-surface-dark/20 p-6 space-y-6">
                
                {/* Table Header / Filter Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 className="font-sora text-base font-bold text-on-surface">Detailed Blogs Performance</h3>
                  
                  {/* Search Bar */}
                  <div className="relative w-full sm:w-72">
                    <span className="material-symbols-outlined text-on-surface-variant absolute left-3.5 top-2.5 text-lg">search</span>
                    <input
                      type="text"
                      placeholder="Search blogs by title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-black/20 border border-white/5 focus:border-electric-cyan focus:outline-none font-sans placeholder:text-on-surface-variant/50 text-on-surface transition-all"
                    />
                  </div>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/10">
                  <table className="w-full border-collapse text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02] text-on-surface-variant font-mono uppercase tracking-wider text-[10px]">
                        <th 
                          onClick={() => handleSort('name')} 
                          className="py-4 px-6 cursor-pointer select-none hover:text-on-surface transition-colors min-w-[280px]"
                        >
                          <div className="flex items-center gap-1.5">
                            Blog Title
                            {sortField === 'name' && (
                              <span className="material-symbols-outlined text-xs">{sortAsc ? 'arrow_upward' : 'arrow_downward'}</span>
                            )}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('createdAt')} 
                          className="py-4 px-4 cursor-pointer select-none hover:text-on-surface transition-colors min-w-[120px]"
                        >
                          <div className="flex items-center gap-1.5">
                            Created Date
                            {sortField === 'createdAt' && (
                              <span className="material-symbols-outlined text-xs">{sortAsc ? 'arrow_upward' : 'arrow_downward'}</span>
                            )}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('viewCount')} 
                          className="py-4 px-4 cursor-pointer select-none hover:text-on-surface transition-colors min-w-[100px] text-right"
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            Views
                            {sortField === 'viewCount' && (
                              <span className="material-symbols-outlined text-xs">{sortAsc ? 'arrow_upward' : 'arrow_downward'}</span>
                            )}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('likesCount')} 
                          className="py-4 px-4 cursor-pointer select-none hover:text-on-surface transition-colors min-w-[100px] text-right"
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            Likes
                            {sortField === 'likesCount' && (
                              <span className="material-symbols-outlined text-xs">{sortAsc ? 'arrow_upward' : 'arrow_downward'}</span>
                            )}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('commentsCount')} 
                          className="py-4 px-4 cursor-pointer select-none hover:text-on-surface transition-colors min-w-[100px] text-right"
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            Comments
                            {sortField === 'commentsCount' && (
                              <span className="material-symbols-outlined text-xs">{sortAsc ? 'arrow_upward' : 'arrow_downward'}</span>
                            )}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {getProcessedBlogs().length > 0 ? (
                        getProcessedBlogs().map((blog) => (
                          <tr key={blog.id} className="hover:bg-white/[0.01] transition-all group">
                            <td className="py-4 px-6 font-medium text-on-surface group-hover:text-electric-cyan transition-colors max-w-sm truncate">
                              {blog.name}
                            </td>
                            <td className="py-4 px-4 text-on-surface-variant font-mono text-[11px]">
                              {formatDate(blog.createdAt)}
                            </td>
                            <td className="py-4 px-4 text-right font-mono font-medium text-on-surface">
                              {blog.viewCount.toLocaleString()}
                            </td>
                            <td className="py-4 px-4 text-right font-mono text-pink-400">
                              {blog.likesCount.toLocaleString()}
                            </td>
                            <td className="py-4 px-4 text-right font-mono text-amber-400">
                              {blog.commentsCount.toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="py-8 px-6 text-center font-mono text-on-surface-variant">
                            No matching blogs found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

              {/* Setup warning if Umami is not configured */}
              {!shareUrl && (
                <div className="glass-card rounded-2xl border border-electric-cyan/10 p-6 bg-electric-cyan/[0.02] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-electric-cyan">
                    <span className="material-symbols-outlined text-2xl">info</span>
                    <div className="font-sans text-xs text-on-surface-variant leading-relaxed">
                      <strong className="text-on-surface block font-sora mb-0.5">Need Live Web Traffic Analytics?</strong>
                      You can hook up Umami Analytics to track device types, country locations, and live visitors.
                    </div>
                  </div>
                  <div className="font-mono text-[10px] text-electric-cyan/70 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg select-all">
                    NEXT_PUBLIC_UMAMI_SHARE_URL=&lt;your_share_link&gt;
                  </div>
                </div>
              )}

            </>
          )}

        </div>
      )}

    </div>
  );
}
