import React, { useState, useEffect } from 'react';
import { fetchUserProfile, updateUserProfile, UserProfile } from '../services/api';
import { MapPin, Link2, Users, GitFork, Star, BookOpen } from 'lucide-react';

const defaultAvailableList: string[] = [
  'React', 'Node', 'Python', 'MongoDB', 'Express', 'JavaScript',
  'TypeScript', 'CSS', 'HTML', 'Docker', 'Go', 'GraphQL', 'Rust', 'TailwindCSS', 'Next.js'
];

const levelMeta: Record<string, { color: string; bg: string; border: string; emoji: string }> = {
  Beginner:     { color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.25)',  emoji: '🌱' },
  Intermediate: { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.25)',  emoji: '⚡' },
  Advanced:     { color: '#818cf8', bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.25)',  emoji: '🚀' },
};

export default function Profile(): React.ReactElement {
  const [profile, setProfile]               = useState<UserProfile | null>(null);
  const [loading, setLoading]               = useState<boolean>(true);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel]     = useState<string>('Beginner');
  const [displayName, setDisplayName]             = useState<string>('');
  const [isEditingName, setIsEditingName]         = useState<boolean>(false);
  const [customSkillInput, setCustomSkillInput]   = useState<string>('');
  const [targetDomain, setTargetDomain]           = useState<string>('🌐 Frontend Development');
  const [weeklyGoal, setWeeklyGoal]               = useState<string>('2-3 Issues / Week (Regular)');
  const [starThreshold, setStarThreshold]         = useState<string>('All Repositories (0+ stars)');
  const [saving, setSaving]                       = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess]           = useState<boolean>(false);

  useEffect(() => {
    fetchUserProfile()
      .then((data) => {
        setProfile(data);
        setSelectedInterests(data.technicalInterests || ['React', 'Node']);
        setExperienceLevel(data.experienceLevel || 'Beginner');
        // Use displayName if present, otherwise fall back to username
        setDisplayName(data.displayName || data.username || '');
      })
      .catch((err) => console.error('Failed to load profile:', err))
      .finally(() => setLoading(false));
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
      setProfile((prev) => prev ? { ...prev, ...updated } : updated);
      setIsEditingName(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh', gap: '12px' }}>
        <div className="spinner" />
        <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
          Loading profile…
        </span>
      </div>
    );
  }

  const lvl = levelMeta[experienceLevel] || levelMeta['Beginner'];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', padding: '16px 8px' }}>

      {/* ─── Page Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'monospace' }}>
            User Settings
          </span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginTop: '4px', letterSpacing: '-0.015em' }}>
            Profile &amp; Preferences
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>
            Your live GitHub profile — customize skill preferences and contribution settings.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
          style={{ padding: '10px 20px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', border: 'none', boxShadow: 'none' }}
        >
          {saving ? 'Saving…' : savedSuccess ? '✓ Saved!' : 'Save Preferences'}
        </button>
      </div>

      {/* ─── GitHub Profile Hero Card ─────────────────────────────────── */}
      {profile && (
        <div className="glass-panel animate-fade-in delay-75" style={{ padding: '28px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>

            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={displayName || profile.username}
                  style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid var(--primary)', display: 'block' }}
                />
              ) : (
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                  👤
                </div>
              )}
              {/* Experience level badge overlay */}
              <span style={{
                position: 'absolute', bottom: '-4px', right: '-4px',
                fontSize: '0.65rem', fontWeight: 700, fontFamily: 'monospace',
                background: lvl.bg, border: `1px solid ${lvl.border}`, color: lvl.color,
                padding: '2px 7px', borderRadius: '10px'
              }}>
                {lvl.emoji} {experienceLevel}
              </span>
            </div>

            {/* Name + GitHub handle + bio */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                {isEditingName ? (
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onBlur={() => setIsEditingName(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                    autoFocus
                    style={{
                      fontSize: '1.1rem', fontWeight: 700, color: '#fff',
                      background: 'rgba(0,0,0,0.3)', border: '1px solid #6366f1',
                      borderRadius: '6px', padding: '4px 10px', outline: 'none'
                    }}
                  />
                ) : (
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    {displayName || profile.username}
                  </h3>
                )}
                <button
                  onClick={() => setIsEditingName(!isEditingName)}
                  style={{ fontSize: '0.62rem', color: '#818cf8', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 600, textTransform: 'uppercase' }}
                >
                  {isEditingName ? 'Done' : 'Edit'}
                </button>
              </div>

              {/* @username + link to GitHub */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>@{profile.username}</span>
                {profile.githubProfileUrl && (
                  <a
                    href={profile.githubProfileUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#818cf8', textDecoration: 'none', fontFamily: 'monospace' }}
                  >
                    <Link2 size={11} />
                    View on GitHub
                  </a>
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: 1.6 }}>
                  {profile.bio}
                </p>
              )}

              {/* Location + meta */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {profile.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    <MapPin size={12} />
                    {profile.location}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  <BookOpen size={12} />
                  {profile.savedIssueIds.length} roadmaps active
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary"
                style={{ padding: '7px 14px', fontSize: '0.75rem', borderRadius: '6px', whiteSpace: 'nowrap' }}
              >
                🔄 Sync Profile
              </button>
            </div>
          </div>

          {/* ── GitHub Stats Row ── */}
          <div style={{ display: 'flex', gap: '0', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '24px', paddingTop: '20px', flexWrap: 'wrap' }}>
            {[
              { icon: <GitFork size={14} />,  label: 'Public Repos', value: profile.publicRepos ?? '—' },
              { icon: <Users size={14} />,    label: 'Followers',    value: profile.followers   ?? '—' },
              { icon: <Star size={14} />,     label: 'Following',    value: profile.following   ?? '—' },
              { icon: <BookOpen size={14} />, label: 'Skills',       value: selectedInterests.length },
            ].map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  flex: '1 0 80px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 0',
                  borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  minWidth: '80px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-dim)' }}>
                  {stat.icon}
                  <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</span>
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f4f4f5' }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Technical Stack & Interests ──────────────────────────────── */}
      <div className="glass-panel animate-fade-in delay-150" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              Technical Stack &amp; Interests
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '4px 0 0 0' }}>
              Select skills to customize AI issue recommendation match scores
            </p>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#818cf8', backgroundColor: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', padding: '4px 10px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 600 }}>
            {selectedInterests.length} Active
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {Array.from(new Set([...selectedInterests, ...defaultAvailableList])).map((tech) => {
            const isChecked = selectedInterests.includes(tech);
            return (
              <div
                key={tech}
                onClick={() => toggleInterest(tech)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px', borderRadius: '6px',
                  border: isChecked ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(255,255,255,0.03)',
                  backgroundColor: isChecked ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.01)',
                  fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 600,
                  cursor: 'pointer',
                  color: isChecked ? '#a5b4fc' : 'var(--text-dim)',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: isChecked ? '#818cf8' : 'rgba(255,255,255,0.1)' }} />
                {tech}
                {isChecked && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeSkill(tech); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0 0 0 4px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center' }}
                    title="Remove skill"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <hr style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '0' }} />

        <form onSubmit={handleAddCustomSkill} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
            Add Custom Skill
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="e.g. GraphQL, WebSockets, Rust…"
              value={customSkillInput}
              onChange={(e) => setCustomSkillInput(e.target.value)}
              style={{ flex: 1, padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'rgba(0,0,0,0.3)', color: '#ffffff', fontSize: '0.8rem', outline: 'none' }}
            />
            <button type="submit" className="btn-secondary" style={{ padding: '10px 16px', fontSize: '0.8rem', borderRadius: '6px' }}>
              Add Skill
            </button>
          </div>
        </form>
      </div>

      {/* ─── Target Domain Focus ──────────────────────────────────────── */}
      <div className="glass-panel animate-fade-in delay-225" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1rem' }}>🎯</span>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>Target Domain Focus</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
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
                  padding: '14px 18px', borderRadius: '6px',
                  border: isSelected ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(255,255,255,0.03)',
                  backgroundColor: isSelected ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.01)',
                  color: isSelected ? '#a5b4fc' : 'var(--text-muted)',
                  fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s'
                }}
              >
                <span>{domain}</span>
                {isSelected && <span style={{ fontSize: '0.8rem' }}>→</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Weekly Goal + Star Threshold ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
        <div className="glass-panel animate-fade-in delay-300" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📅</span>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>Weekly Goal</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['1 Issue / Week (Casual)', '2-3 Issues / Week (Regular)', '4+ Issues / Week (Hardcore)'].map((goal) => {
              const isSelected = weeklyGoal === goal;
              return (
                <label key={goal} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '6px', border: isSelected ? '1px solid rgba(6,182,212,0.25)' : '1px solid rgba(255,255,255,0.03)', backgroundColor: isSelected ? 'rgba(6,182,212,0.04)' : 'rgba(255,255,255,0.01)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', color: isSelected ? '#22d3ee' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                  <input type="radio" name="weeklyGoal" checked={isSelected} onChange={() => setWeeklyGoal(goal)} style={{ cursor: 'pointer' }} />
                  {goal}
                </label>
              );
            })}
          </div>
        </div>

        <div className="glass-panel animate-fade-in delay-300" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⭐</span>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>Repository Popularity</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['All Repositories (0+ stars)', 'Popular Projects (1,000+ stars)', 'Superstar Projects (10,000+ stars)'].map((thresh) => {
              const isSelected = starThreshold === thresh;
              return (
                <label key={thresh} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '6px', border: isSelected ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.03)', backgroundColor: isSelected ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.01)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', color: isSelected ? '#34d399' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                  <input type="radio" name="starThreshold" checked={isSelected} onChange={() => setStarThreshold(thresh)} style={{ cursor: 'pointer' }} />
                  {thresh}
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Experience Level ─────────────────────────────────────────── */}
      <div className="glass-panel animate-fade-in delay-300" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🏆</span>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>Experience Level</h3>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => {
            const isSelected = experienceLevel === level;
            const meta = levelMeta[level];
            return (
              <button
                key={level}
                onClick={() => setExperienceLevel(level)}
                style={{
                  flex: 1, minWidth: '100px', padding: '14px',
                  borderRadius: '6px',
                  border: isSelected ? `1px solid ${meta.border}` : '1px solid rgba(255,255,255,0.03)',
                  backgroundColor: isSelected ? meta.bg : 'rgba(255,255,255,0.01)',
                  color: isSelected ? meta.color : 'var(--text-dim)',
                  fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                }}
              >
                {meta.emoji} {level}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
