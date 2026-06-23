'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & form states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    summary: '',
    content: '',
    isPublished: false
  });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Comments Management modal states
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [commentsBlog, setCommentsBlog] = useState(null);
  const [blogComments, setBlogComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const handleOpenCommentsModal = async (blog) => {
    setCommentsBlog(blog);
    setShowCommentsModal(true);
    setBlogComments([]);
    setLoadingComments(true);
    try {
      const data = await fetchApi(`/api/blogs/${blog.slug}/comments`);
      setBlogComments(data || []);
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await fetchApi(`/api/blogs/comments/${commentId}`, {
        method: 'DELETE'
      });
      if (commentsBlog) {
        const data = await fetchApi(`/api/blogs/${commentsBlog.slug}/comments`);
        setBlogComments(data || []);
      }
    } catch (err) {
      alert(`Failed to delete comment: ${err.message}`);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const blogsData = await fetchApi('/api/blogs?includeUnpublished=true');
      // Sort blogs by newest first
      const sortedBlogs = blogsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBlogs(sortedBlogs);
    } catch (err) {
      console.error('Error fetching blogs dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      summary: '',
      content: '',
      isPublished: false
    });
    setFormError(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleOpenEditModal = (blog) => {
    setFormData({
      name: blog.name,
      summary: blog.summary || '',
      content: blog.content || '',
      isPublished: blog.isPublished || false
    });
    setFormError(null);
    setSelectedBlogId(blog.id);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      if (modalMode === 'create') {
        await fetchApi('/api/blogs', {
          method: 'POST',
          body: formData
        });
      } else {
        await fetchApi(`/api/blogs/${selectedBlogId}`, {
          method: 'PUT',
          body: formData
        });
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setFormError(err.message || 'Action failed.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (blogId) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await fetchApi(`/api/blogs/${blogId}`, {
        method: 'DELETE'
      });
      loadData();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 font-mono text-on-surface-variant">
        <span className="material-symbols-outlined text-electric-cyan text-3xl animate-spin mb-4">sync</span>
        <span>Loading articles dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-sora text-3xl font-bold text-on-surface">Blog Management</h1>
          <p className="font-sans text-sm text-on-surface-variant">Write, edit, publish or remove your articles.</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-electric-cyan text-on-primary-fixed px-5 py-3 rounded-full font-mono text-xs uppercase tracking-wider font-semibold hover:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-sm">add_circle</span>
          Add New Article
        </button>
      </div>

      {/* Blogs Grid List */}
      <div className="grid grid-cols-1 gap-6">
        {blogs.length > 0 ? (
          blogs.map(blog => (
            <div key={blog.id} className="glass-card rounded-2xl flex flex-col md:flex-row justify-between border border-white/5 p-6 hover:border-electric-cyan/20 transition-all duration-300 gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full border uppercase ${
                    blog.isPublished 
                      ? 'border-green-500/30 bg-green-500/10 text-green-400' 
                      : 'border-white/10 bg-white/5 text-on-surface-variant'
                  }`}>
                    {blog.isPublished ? 'Published' : 'Draft'}
                  </span>
                  <span className="font-mono text-[10px] text-on-surface-variant">
                    {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="font-sora text-xl font-bold text-on-surface">{blog.name}</h3>
                <p className="font-sans text-xs text-on-surface-variant line-clamp-2 leading-relaxed">{blog.summary}</p>
              </div>

              <div className="flex md:flex-col justify-between items-end shrink-0 gap-4 md:border-l md:border-white/5 md:pl-6">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenCommentsModal(blog)}
                    className="flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-electric-cyan/10 hover:text-electric-cyan transition-colors"
                    title="Manage Comments"
                  >
                    <span className="material-symbols-outlined text-sm">forum</span>
                  </button>
                  <button 
                    onClick={() => handleOpenEditModal(blog)}
                    className="flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-electric-cyan/10 hover:text-electric-cyan transition-colors"
                    title="Edit Post"
                  >
                    <span className="material-symbols-outlined text-sm">edit_square</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(blog.id)}
                    className="flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-error/10 hover:text-error transition-colors"
                    title="Delete Post"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-on-surface-variant py-12 glass-card rounded-2xl">
            No blog posts available. Click "Add New Article" to get started.
          </div>
        )}
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="glass-card w-full max-w-4xl rounded-2xl border border-white/10 shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-white/5 px-8 py-5 shrink-0">
              <h2 className="font-sora text-xl font-bold text-on-surface uppercase tracking-wide">
                {modalMode === 'create' ? 'Create New Article' : 'Edit Article Details'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-electric-cyan">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                <div className="flex flex-col space-y-2">
                  <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest" htmlFor="blog-name">Article Title</label>
                  <input 
                    id="blog-name"
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="E.g. Securing APIs with JWT Authentication"
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-electric-cyan transition-colors"
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest" htmlFor="blog-summary">Summary</label>
                  <textarea 
                    id="blog-summary"
                    rows="3"
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    required
                    placeholder="Write a brief, engaging summary of the article..."
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-electric-cyan transition-colors resize-none text-xs"
                  ></textarea>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest" htmlFor="blog-content">Content (Markdown Support)</label>
                  <textarea 
                    id="blog-content"
                    rows="12"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    placeholder="Write your article content using Markdown syntax..."
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-electric-cyan transition-colors font-mono text-xs"
                  ></textarea>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                  <input 
                    id="blog-publish"
                    type="checkbox" 
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="rounded text-electric-cyan focus:ring-electric-cyan focus:ring-offset-background border-white/10 bg-white/5 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="blog-publish" className="font-mono text-xs text-on-surface-variant cursor-pointer select-none">
                    Publish immediately (If unchecked, this post will save as a Draft)
                  </label>
                </div>

                {formError && (
                  <div className="p-4 bg-error/10 border border-error/20 text-error rounded-lg text-sm break-words">
                    {formError}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-4 border-t border-white/5 px-8 py-5 shrink-0">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-full border border-white/10 font-mono text-xs uppercase text-on-surface-variant hover:bg-white/5"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={formLoading}
                  className="px-8 py-3 rounded-full bg-electric-cyan text-on-primary-fixed font-mono text-xs uppercase font-semibold hover:scale-95 transition-transform disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : 'Save Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comments Management Modal */}
      {showCommentsModal && commentsBlog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="glass-card w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl flex flex-col" style={{ maxHeight: '80vh' }}>
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-white/5 px-8 py-5 shrink-0">
              <div>
                <h2 className="font-sora text-lg font-bold text-on-surface uppercase tracking-wide">
                  Manage Comments
                </h2>
                <p className="text-xs text-on-surface-variant line-clamp-1 mt-1">{commentsBlog.name}</p>
              </div>
              <button onClick={() => setShowCommentsModal(false)} className="text-on-surface-variant hover:text-electric-cyan">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {loadingComments ? (
                <div className="flex flex-col justify-center items-center py-12 text-on-surface-variant font-mono text-xs">
                  <span className="material-symbols-outlined text-electric-cyan animate-spin mb-2">sync</span>
                  <span>Loading comments...</span>
                </div>
              ) : blogComments.length > 0 ? (
                <div className="space-y-4">
                  {blogComments.map(comment => (
                    <div key={comment.id} className="flex justify-between items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-electric-cyan">{comment.username}</span>
                          <span className="text-[10px] text-on-surface-variant">
                            {new Date(comment.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface font-sans leading-relaxed">{comment.content}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-error/10 hover:text-error transition-colors shrink-0"
                        title="Delete Comment"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-on-surface-variant text-sm font-sans">
                  No comments yet on this article.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-white/5 px-8 py-5 shrink-0">
              <button 
                type="button"
                onClick={() => setShowCommentsModal(false)}
                className="px-6 py-3 rounded-full border border-white/10 font-mono text-xs uppercase text-on-surface-variant hover:bg-white/5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
