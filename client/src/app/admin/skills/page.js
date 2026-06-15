'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedSkillId, setSelectedSkillId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Backend',
    proficiency: '90%'
  });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const loadSkills = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/api/skills');
      setSkills(data);
    } catch (err) {
      console.error('Error loading skills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      category: 'Backend',
      proficiency: '90%'
    });
    setFormError(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleOpenEditModal = (skill) => {
    setFormData({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency
    });
    setFormError(null);
    setSelectedSkillId(skill.id);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      if (modalMode === 'create') {
        await fetchApi('/api/skills', {
          method: 'POST',
          body: formData
        });
      } else {
        await fetchApi(`/api/skills/${selectedSkillId}`, {
          method: 'PUT',
          body: formData
        });
      }
      setShowModal(false);
      loadSkills();
    } catch (err) {
      setFormError(err.message || 'Action failed.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (skillId) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    try {
      await fetchApi(`/api/skills/${skillId}`, {
        method: 'DELETE'
      });
      loadSkills();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Group skills by category
  const categories = ['Frontend', 'Backend', 'Database', 'DevOps'];
  const groupedSkills = skills.reduce((groups, skill) => {
    const cat = skill.category || 'Other';
    if (!groups[cat]) {
      groups[cat] = [];
    }
    groups[cat].push(skill);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 font-mono text-on-surface-variant">
        <span className="material-symbols-outlined text-electric-cyan text-3xl animate-spin mb-4">sync</span>
        <span>Loading tech stack...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-sora text-3xl font-bold text-on-surface">Skills & Tech Stack</h1>
          <p className="font-sans text-sm text-on-surface-variant">Configure core proficiencies shown in Technical Mastery section.</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-electric-cyan text-on-primary-fixed px-5 py-3 rounded-full font-mono text-xs uppercase tracking-wider font-semibold hover:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-sm">add_circle</span>
          Add New Skill
        </button>
      </div>

      {/* Skills Grouped by Category */}
      <div className="space-y-8">
        {Object.keys(groupedSkills).length > 0 ? (
          Object.keys(groupedSkills).map(catName => (
            <div key={catName} className="space-y-4">
              <h2 className="font-sora text-xl font-bold text-electric-cyan border-b border-white/5 pb-2 uppercase tracking-wider text-sm">
                {catName}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {groupedSkills[catName].map(skill => (
                  <div key={skill.id} className="glass-card rounded-xl p-6 flex justify-between items-center border border-white/5 hover:border-electric-cyan/15 transition-all">
                    <div className="space-y-2 flex-grow pr-4">
                      <div className="flex justify-between font-mono text-xs text-on-surface">
                        <span>{skill.name}</span>
                        <span className="text-electric-cyan">{skill.proficiency}</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-electric-cyan" style={{ width: skill.proficiency }}></div>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button 
                        onClick={() => handleOpenEditModal(skill)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-electric-cyan/15 hover:text-electric-cyan text-on-surface-variant transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(skill.id)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-error/15 hover:text-error text-on-surface-variant transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-on-surface-variant py-12 glass-card rounded-2xl">
            No skills available. Click "Add New Skill" to define backend technologies.
          </div>
        )}
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="glass-card w-full max-w-md rounded-2xl p-8 border border-white/10 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h2 className="font-sora text-lg font-bold text-on-surface uppercase tracking-wide">
                {modalMode === 'create' ? 'Define Skill' : 'Edit Skill Details'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-electric-cyan">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col space-y-2">
                <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest" htmlFor="skill-name">Technology Name</label>
                <input 
                  id="skill-name"
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="E.g. .NET 10, ReactJS, Docker"
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-electric-cyan transition-colors"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest" htmlFor="skill-category">Category</label>
                <select 
                  id="skill-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-primary-container border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-electric-cyan transition-colors font-mono text-xs"
                >
                  {categories.map(c => (
                    <option key={c} value={c} className="bg-background text-on-surface">{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest" htmlFor="skill-proficiency">Proficiency level</label>
                <input 
                  id="skill-proficiency"
                  type="text" 
                  value={formData.proficiency}
                  onChange={(e) => setFormData({ ...formData, proficiency: e.target.value })}
                  required
                  placeholder="E.g. 90%, 85%"
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-electric-cyan transition-colors"
                />
              </div>

              {formError && (
                <div className="p-4 bg-error/10 border border-error/20 text-error rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-4 border-t border-white/5 pt-4">
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
                  className="px-8 py-3 rounded-full bg-electric-cyan text-on-primary-fixed font-mono text-xs uppercase font-semibold hover:scale-95 transition-transform"
                >
                  {formLoading ? 'Saving...' : 'Save Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
