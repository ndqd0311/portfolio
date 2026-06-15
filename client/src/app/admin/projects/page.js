'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';

// Cloudinary configuration constants
// You can replace these with your own Cloudinary Cloud Name and Unsigned Upload Preset
const CLOUDINARY_CLOUD_NAME = 'dcnblgy5h';
const CLOUDINARY_UPLOAD_PRESET = 'qd0311';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & form states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    thumbnail: '',
    githubUrl: '',
    websiteUrl: '',
    skillIds: []
  });
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const projectsData = await fetchApi('/api/projects');
      setProjects(projectsData);
      const skillsData = await fetchApi('/api/skills');
      setSkills(skillsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
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
      description: '',
      thumbnail: '',
      githubUrl: '',
      websiteUrl: '',
      skillIds: []
    });
    setFormError(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleOpenEditModal = (project) => {
    setFormData({
      name: project.name,
      description: project.description,
      thumbnail: project.thumbnail || '',
      githubUrl: project.githubUrl || '',
      websiteUrl: project.websiteUrl || '',
      skillIds: project.skills?.map(s => s.id) || []
    });
    setFormError(null);
    setSelectedProjectId(project.id);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setFormError(null);

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Failed to upload image to Cloudinary.');
      }

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        thumbnail: data.secure_url
      }));
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      setFormError(`Cloudinary Upload Error: ${err.message} (Please make sure you have created an Unsigned Upload Preset named "${CLOUDINARY_UPLOAD_PRESET}" on Cloudinary).`);
    } finally {
      setUploading(false);
    }
  };

  const handleToggleSkill = (skillId) => {
    setFormData(prev => {
      const idx = prev.skillIds.indexOf(skillId);
      let newSkillIds = [...prev.skillIds];
      if (idx > -1) {
        newSkillIds.splice(idx, 1);
      } else {
        newSkillIds.push(skillId);
      }
      return { ...prev, skillIds: newSkillIds };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      if (modalMode === 'create') {
        await fetchApi('/api/projects', {
          method: 'POST',
          body: formData
        });
      } else {
        await fetchApi(`/api/projects/${selectedProjectId}`, {
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

  const handleDelete = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await fetchApi(`/api/projects/${projectId}`, {
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
        <span>Loading projects dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-sora text-3xl font-bold text-on-surface">Projects Management</h1>
          <p className="font-sans text-sm text-on-surface-variant">Create, edit, or remove your portfolio works.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-electric-cyan text-on-primary-fixed px-5 py-3 rounded-full font-mono text-xs uppercase tracking-wider font-semibold hover:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-sm">add_circle</span>
          Add New Project
        </button>
      </div>

      {/* Projects Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.length > 0 ? (
          projects.map(project => (
            <div key={project.id} className="glass-card rounded-2xl flex flex-col justify-between border border-white/5 p-6 hover:border-electric-cyan/20 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center shrink-0">
                    {project.thumbnail ? (
                      <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-electric-cyan text-2xl">folder_open</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-sora text-lg font-bold text-on-surface">{project.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.skills?.map(s => (
                        <span key={s.id} className="font-mono text-[9px] px-2 py-0.5 rounded-full border border-white/5 bg-white/5 text-on-surface-variant uppercase">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="font-sans text-xs text-on-surface-variant line-clamp-3 leading-relaxed">{project.description}</p>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
                <div className="flex gap-4 font-mono text-[10px] text-on-surface-variant">
                  {project.websiteUrl && <a href={project.websiteUrl} target="_blank" rel="noreferrer" className="hover:text-electric-cyan">Live Link</a>}
                  {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer" className="hover:text-electric-cyan">Source</a>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(project)}
                    className="flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-electric-cyan/10 hover:text-electric-cyan transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">edit_square</span>
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-error/10 hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center text-on-surface-variant py-12 glass-card rounded-2xl">
            No projects available. Click "Add New Project" to get started.
          </div>
        )}
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="glass-card w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
            {/* Modal Header - fixed */}
            <div className="flex justify-between items-center border-b border-white/5 px-8 py-5 shrink-0">
              <h2 className="font-sora text-xl font-bold text-on-surface uppercase tracking-wide">
                {modalMode === 'create' ? 'Create New Project' : 'Edit Project Details'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-electric-cyan">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body - scrollable */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                <div className="flex flex-col space-y-2">
                  <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest" htmlFor="proj-name">Project Name</label>
                  <input
                    id="proj-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="E.g. RESTful API Service"
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-electric-cyan transition-colors"
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest" htmlFor="proj-desc">Description</label>
                  <textarea
                    id="proj-desc"
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    placeholder="Summarize the core technical features and backend architecture..."
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-electric-cyan transition-colors resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-2">
                    <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest" htmlFor="proj-thumb">Thumbnail URL</label>
                    <input
                      id="proj-thumb"
                      type="text"
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      placeholder="E.g. https://images.unsplash.com/... or upload"
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-electric-cyan transition-colors"
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">Upload Image (Cloudinary)</label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-on-surface-variant hover:text-electric-cyan hover:border-electric-cyan transition-all text-xs font-mono text-center flex items-center justify-center gap-2">
                        <span className={`material-symbols-outlined text-sm ${uploading ? 'animate-spin text-electric-cyan' : ''}`}>
                          {uploading ? 'sync' : 'upload'}
                        </span>
                        {uploading ? 'Uploading...' : 'Choose Image File'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                      {formData.thumbnail && (
                        <div className="w-12 h-12 rounded-lg border border-white/10 overflow-hidden shrink-0 bg-white/5 relative">
                          <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-2">
                    <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest" htmlFor="proj-git">GitHub Code Link</label>
                    <input
                      id="proj-git"
                      type="text"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                      placeholder="https://github.com/username/project"
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-electric-cyan transition-colors"
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest" htmlFor="proj-site">Live Website URL</label>
                    <input
                      id="proj-site"
                      type="text"
                      value={formData.websiteUrl}
                      onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                      placeholder="https://project-demo.com"
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-electric-cyan transition-colors"
                    />
                  </div>
                </div>

                {/* Skills checklist */}
                <div className="flex flex-col space-y-2">
                  <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">Select Linked Skills</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-white/5 border border-white/5 max-h-36 overflow-y-auto">
                    {skills.map(skill => {
                      const isChecked = formData.skillIds.includes(skill.id);
                      return (
                        <label key={skill.id} className="flex items-center gap-2 font-mono text-[11px] text-on-surface-variant cursor-pointer hover:text-electric-cyan">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSkill(skill.id)}
                            className="rounded text-electric-cyan focus:ring-electric-cyan focus:ring-offset-background border-white/10 bg-white/5"
                          />
                          {skill.name}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {formError && (
                  <div className="p-4 bg-error/10 border border-error/20 text-error rounded-lg text-sm break-words">
                    {formError}
                  </div>
                )}
              </div>

              {/* Modal Footer - fixed */}
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
                  {formLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
