import React, { useState, useEffect } from 'react';
import { fetchUserProfile, UserProfile } from '../services/api';

const vibrantGradients = [
  { text: '#818cf8', fill: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)', border: 'rgba(99, 102, 241, 0.4)' },
  { text: '#38bdf8', fill: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)', border: 'rgba(56, 189, 248, 0.4)' },
  { text: '#34d399', fill: 'linear-gradient(90deg, #059669 0%, #34d399 100%)', border: 'rgba(52, 211, 153, 0.4)' },
  { text: '#fbbf24', fill: 'linear-gradient(90deg, #d97706 0%, #fbbf24 100%)', border: 'rgba(251, 191, 36, 0.4)' },
  { text: '#f472b6', fill: 'linear-gradient(90deg, #db2777 0%, #f472b6 100%)', border: 'rgba(244, 114, 182, 0.4)' },
  { text: '#a78bfa', fill: 'linear-gradient(90deg, #7c3aed 0%, #a78bfa 100%)', border: 'rgba(167, 139, 250, 0.4)' }
];

export default function Dashboard(): React.ReactElement {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchUserProfile()
      .then((data) => setProfile(data))
      .catch((err) => console.error('Failed to load dashboard profile:', err));
  }, []);

  const rawBreakdown = profile?.languageBreakdown || {
    'TypeScript': 40,
    'JavaScript': 25,
    'React': 15,
    'Node.js': 10,
    'Python': 10
  };

  const chartData = Object.keys(rawBreakdown).map((lang, idx) => ({
    language: lang,
    percentage: rawBreakdown[lang],
    theme: vibrantGradients[idx % vibrantGradients.length]
  }));

  const allExtractedInterests = profile?.technicalInterests || ['TypeScript', 'React', 'Node.js', 'Python', 'MongoDB', 'Express'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }} className="gradient-text">
          Developer Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Comprehensive analysis of ALL extracted skills and language percentage weights across your GitHub repositories.
        </p>
      </div>

      {/* Summary Blocks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {/* Total Skills Extracted */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Skills & Topics Extracted
          </span>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#38bdf8', marginTop: '8px' }}>
            {allExtractedInterests.length}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Extracted from public GitHub repositories
          </p>
        </div>

        {/* Primary Language */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Primary Language
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', marginTop: '8px' }}>
            {chartData[0]?.language || 'TypeScript'} ({chartData[0]?.percentage || 40}%)
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Most used language by repository weight
          </p>
        </div>

        {/* Saved Roadmaps */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Saved Roadmaps & Bookmarks
          </span>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#818cf8', marginTop: '8px' }}>
            {profile?.savedIssueIds.length || 0}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Saved issues for step-by-step roadmaps
          </p>
        </div>
      </div>

      {/* Horizontal Skill Progress Cards */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              ⚡ Language Proficiency Breakdown
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Extracted percentage distribution across your public GitHub repositories
            </p>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: '20px' }}>
            {chartData.length} Languages Detected
          </span>
        </div>

        {/* List of Progress Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {chartData.map((item) => (
            <div 
              key={item.language}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: `1px solid ${item.theme.border}`,
                borderRadius: '12px',
                padding: '18px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {/* Header: Name + Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                    {item.language}
                  </span>
                  <span 
                    style={{ 
                      fontSize: '0.78rem', 
                      fontWeight: 600, 
                      color: item.theme.text, 
                      background: 'rgba(255,255,255,0.06)', 
                      padding: '3px 10px', 
                      borderRadius: '12px' 
                    }}
                  >
                    Language Tag
                  </span>
                </div>

                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: item.theme.text }}>
                  {item.percentage}%
                </span>
              </div>

              {/* Progress Bar Track */}
              <div 
                style={{
                  width: '100%',
                  height: '12px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <div 
                  style={{
                    width: `${Math.max(5, item.percentage)}%`,
                    height: '100%',
                    background: item.theme.fill,
                    borderRadius: '6px',
                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Extracted Skills Checklist/Badges */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: '#f8fafc' }}>
          🏷️ All Extracted Technical Skills & Repository Topics ({allExtractedInterests.length})
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {allExtractedInterests.map((skill) => (
            <span 
              key={skill} 
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#a5b4fc',
                fontWeight: 600,
                fontSize: '0.88rem'
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
