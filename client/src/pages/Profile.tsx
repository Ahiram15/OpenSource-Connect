import React, { useState, useEffect } from 'react';
import { fetchUserProfile, updateUserProfile, UserProfile } from '../services/api';

const defaultAvailableList: string[] = ['React', 'Node', 'Python', 'MongoDB', 'Express', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'Docker', 'Go', 'GraphQL', 'Rust', 'TailwindCSS', 'Next.js'];

export default function Profile(): React.ReactElement {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string>('Beginner');
  const [displayName, setDisplayName] = useState<string>('Alex Developer');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [customSkillInput, setCustomSkillInput] = useState<string>('');
  const [targetDomain, setTargetDomain] = useState<string>('🌐 Frontend Development');
  const [weeklyGoal, setWeeklyGoal] = useState<string>('2-3 Issues / Week');
  const [starThreshold, setStarThreshold] = useState<string>('All Repositories (0+ stars)');
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetchUserProfile()
      .then((data) => {
        setProfile(data);
        setSelectedInterests(data.technicalInterests || ['React', 'Node']);
        setExperienceLevel(data.experienceLevel || 'Beginner');
        setDisplayName(data.username || 'Alex Developer');
      })
      .catch((err) => console.error('Failed to load profile:', err));
  }, []);

  const toggleInterest = (tech: string): void => {
    const updated = selectedInterests.includes(tech)
      ? selectedInterests.filter(item => item !== tech)
      : [...selectedInterests, tech];
    setSelectedInterests(updated);
  };

  const handleAddCustomSkill = (e?: React.FormEvent): void => {
    if (e) e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (trimmed && !selectedInterests.includes(trimmed)) {
      setSelectedInterests([...selectedInterests, trimmed]);
      setCustomSkillInput('');
    }
  };

  const removeSkill = (tech: string): void => {
    setSelectedInterests(selectedInterests.filter(item => item !== tech));
  };

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      const updated = await updateUserProfile(selectedInterests, experienceLevel, displayName);
      setProfile(updated);
      setIsEditingName(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }} className="gradient-text">
            Profile & Skill Preferences
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Customize your display name, technical interests, domain focus, contribution targets, and AI match rules.
          </p>
        </div>

        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn-primary"
          style={{ padding: '10px 24px', borderRadius: '8px', fontSize: '0.95rem' }}
        >
          {saving ? 'Saving...' : savedSuccess ? '✓ Saved!' : 'Save Preferences'}
        </button>
      </div>

      {/* User Info Card with Name Edit Option */}
      {profile && (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {profile.avatarUrl && (
              <img 
                src={profile.avatarUrl} 
                alt={displayName} 
                style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--primary)' }}
              />
            )}
            <div>
              {/* Name Display & Editable Field */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isEditingName ? (
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value)}
                    onBlur={() => setIsEditingName(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                    autoFocus
                    style={{
                      fontSize: '1.3rem',
                      fontWeight: 700,
                      color: '#fff',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid #6366f1',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      outline: 'none'
                    }}
                  />
                ) : (
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                    {displayName}
                  </h2>
                )}

                <button
                  onClick={() => setIsEditingName(!isEditingName)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '6px',
                    color: '#38bdf8',
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {isEditingName ? 'Done' : '✏️ Edit Name'}
                </button>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '6px 0 0 0' }}>
                GitHub ID: {profile.githubId} • {profile.savedIssueIds.length} Saved Bookmarks
              </p>
            </div>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '8px' }}
          >
            🔄 Re-Sync GitHub Skills
          </button>
        </div>
      )}

      {/* Custom Skill Creator Input */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: '#f8fafc' }}>
          ✨ Add Custom Skill / Framework
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Type any technology, framework, or tool to include in your AI match scoring profile.
        </p>

        <form onSubmit={handleAddCustomSkill} style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text"
            placeholder="e.g. GraphQL, TailwindCSS, Next.js, Rust..."
            value={customSkillInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomSkillInput(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--glass-border)',
              background: 'rgba(15, 23, 42, 0.7)',
              color: '#fff',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
          <button 
            type="submit"
            className="btn-primary"
            style={{ padding: '12px 24px', borderRadius: '8px', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
          >
            + Add Skill
          </button>
        </form>
      </div>

      {/* Selected Technical Interests Checklist */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            🏷️ Selected Technical Skills ({selectedInterests.length})
          </h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Check or uncheck to customize AI issue recommendations
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {Array.from(new Set([...selectedInterests, ...defaultAvailableList])).map((tech) => {
            const isChecked = selectedInterests.includes(tech);
            return (
              <div 
                key={tech}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: isChecked ? 'rgba(99, 102, 241, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  border: isChecked ? '1px solid #6366f1' : '1px solid var(--glass-border)',
                  color: isChecked ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              >
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={isChecked}
                    onChange={() => toggleInterest(tech)}
                    style={{ cursor: 'pointer' }}
                  />
                  {tech}
                </label>
                {isChecked && (
                  <button 
                    onClick={() => removeSkill(tech)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem', padding: '0 2px' }}
                    title="Remove skill"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Contribution Domain */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: '#f8fafc' }}>
          🎯 Target Domain / Category Focus
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            '🌐 Frontend Development',
            '⚙️ Backend API',
            '📱 Mobile Apps',
            '🤖 AI / Machine Learning',
            '☁️ DevOps / Infrastructure',
            '🎨 UI / UX Design'
          ].map((domain) => {
            const isSelected = targetDomain === domain;
            return (
              <button
                key={domain}
                onClick={() => setTargetDomain(domain)}
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  border: isSelected ? '1px solid #6366f1' : '1px solid var(--glass-border)',
                  color: isSelected ? '#a5b4fc' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {domain}
              </button>
            );
          })}
        </div>
      </div>

      {/* Weekly Contribution Target & Star Preferences */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Weekly Target */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px', color: '#f8fafc' }}>
            📅 Weekly Contribution Goal
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['1 Issue / Week (Casual)', '2-3 Issues / Week (Regular)', '4+ Issues / Week (Hardcore)'].map((goal) => (
              <label 
                key={goal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: weeklyGoal === goal ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                  border: weeklyGoal === goal ? '1px solid #38bdf8' : '1px solid var(--glass-border)',
                  color: weeklyGoal === goal ? '#38bdf8' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.88rem'
                }}
              >
                <input 
                  type="radio" 
                  name="weeklyGoal" 
                  checked={weeklyGoal === goal}
                  onChange={() => setWeeklyGoal(goal)}
                />
                {goal}
              </label>
            ))}
          </div>
        </div>

        {/* Repo Popularity Threshold */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px', color: '#f8fafc' }}>
            ⭐ Preferred Repository Popularity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              'All Repositories (0+ stars)',
              'Popular Projects (1,000+ stars)',
              'Superstar Projects (10,000+ stars)'
            ].map((thresh) => (
              <label 
                key={thresh}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: starThreshold === thresh ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                  border: starThreshold === thresh ? '1px solid #10b981' : '1px solid var(--glass-border)',
                  color: starThreshold === thresh ? '#34d399' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.88rem'
                }}
              >
                <input 
                  type="radio" 
                  name="starThreshold" 
                  checked={starThreshold === thresh}
                  onChange={() => setStarThreshold(thresh)}
                />
                {thresh}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Experience Level Selector */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: '#f8fafc' }}>
          Experience Level
        </h3>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {['Beginner', 'Intermediate', 'Advanced'].map((level) => {
            const isSelected = experienceLevel === level;
            return (
              <button
                key={level}
                onClick={() => setExperienceLevel(level)}
                style={{
                  flex: 1,
                  minWidth: '150px',
                  padding: '16px',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid var(--glass-border)',
                  color: isSelected ? '#38bdf8' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
