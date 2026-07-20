import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { fetchUserProfile, UserProfile } from '../services/api';

const vibrantColors = [
  '#6366f1', '#38bdf8', '#10b981', '#f59e0b', '#ec4899', 
  '#8b5cf6', '#06b6d4', '#f43f5e', '#a855f7', '#84cc16'
];

export default function Dashboard(): React.ReactElement {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchUserProfile()
      .then((data) => setProfile(data))
      .catch((err) => console.error('Failed to load dashboard profile:', err));
  }, []);

  // Compute graph data from ALL extracted languages
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
    color: vibrantColors[idx % vibrantColors.length]
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
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: '8px' }}>
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

      {/* Enhanced Skill Bar Graph */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            📊 Language Percentage Breakdown (% Repo Code)
          </h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing all {chartData.length} detected languages
          </span>
        </div>

        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 15, right: 15, left: -15, bottom: 25 }}>
              <XAxis 
                dataKey="language" 
                stroke="#94a3b8" 
                tickLine={false} 
                interval={0}
                angle={-15}
                textAnchor="end"
                style={{ fontSize: '0.85rem' }}
              />
              <YAxis stroke="#94a3b8" tickLine={false} unit="%" />
              <Tooltip 
                formatter={(value: any) => [`${value}% of code`, 'Usage Weight']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff' }}
              />
              <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* All Extracted Skills Checklist/Badges */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: '#f8fafc' }}>
          🏷️ All Extracted Technical Skills & Repository Topics ({allExtractedInterests.length})
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {allExtractedInterests.map((skill, index) => (
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
