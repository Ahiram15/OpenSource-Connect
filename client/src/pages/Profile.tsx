import React, { useState, useEffect } from 'react';
import { fetchUserProfile, updateUserProfile, UserProfile } from '../services/api';

const availableInterestsList: string[] = ['React', 'Node', 'Python', 'MongoDB', 'Express', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'Docker', 'Go'];

export default function Profile(): React.ReactElement {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string>('Beginner');
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetchUserProfile()
      .then((data) => {
        setProfile(data);
        setSelectedInterests(data.technicalInterests || ['React', 'Node']);
        setExperienceLevel(data.experienceLevel || 'Beginner');
      })
      .catch((err) => console.error('Failed to load profile:', err));
  }, []);

  const toggleInterest = (tech: string): void => {
    const updated = selectedInterests.includes(tech)
      ? selectedInterests.filter(item => item !== tech)
      : [...selectedInterests, tech];
    setSelectedInterests(updated);
  };

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      const updated = await updateUserProfile(selectedInterests, experienceLevel);
      setProfile(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }} className="gradient-text">
            Profile & Skill Preferences
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Auto-extracted skills from your public GitHub repos & customized interests.
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

      {/* User Info Card */}
      {profile && (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          {profile.avatarUrl && (
            <img 
              src={profile.avatarUrl} 
              alt={profile.username} 
              style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--primary)' }}
            />
          )}
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              {profile.username}
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              GitHub ID: {profile.githubId} • {profile.savedIssueIds.length} Saved Bookmarks
            </p>
          </div>
        </div>
      )}

      {/* Technical Interests Checklist */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: '#f8fafc' }}>
          Extracted Technical Interests
        </h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {Array.from(new Set([...selectedInterests, ...availableInterestsList])).map((tech) => {
            const isChecked = selectedInterests.includes(tech);
            return (
              <label 
                key={tech} 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: isChecked ? 'rgba(99, 102, 241, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  border: isChecked ? '1px solid #6366f1' : '1px solid var(--glass-border)',
                  color: isChecked ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              >
                <input 
                  type="checkbox" 
                  checked={isChecked}
                  onChange={() => toggleInterest(tech)}
                  style={{ cursor: 'pointer' }}
                />
                {tech}
              </label>
            );
          })}
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
