import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { fetchUserProfile, UserProfile } from '../services/api';

const colorPalette = ['#6366f1', '#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function Dashboard(): React.ReactElement {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchUserProfile()
      .then((data) => setProfile(data))
      .catch((err) => console.error('Failed to load dashboard profile:', err));
  }, []);

  const chartData = (profile?.technicalInterests || ['React', 'Node', 'TypeScript']).map((tech, idx) => ({
    language: tech,
    level: Math.max(50, 95 - idx * 10),
    color: colorPalette[idx % colorPalette.length]
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }} className="gradient-text">
          Developer Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Overview of your extracted skills, GitHub experience level ({profile?.experienceLevel || 'Beginner'}), and saved roadmaps.
        </p>
      </div>

      {/* Summary Blocks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Summary Block 1: Extracted Skills */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Extracted Technical Skills
          </span>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#38bdf8', marginTop: '8px' }}>
            {profile?.technicalInterests.length || 0}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Parsed from public GitHub repositories
          </p>
        </div>

        {/* Summary Block 2: Saved Issues */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Saved Roadmaps & Bookmarks
          </span>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#818cf8', marginTop: '8px' }}>
            {profile?.savedIssueIds.length || 0}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Bookmarked issues for learning milestones
          </p>
        </div>
      </div>

      {/* Dynamic Skill Chart */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', color: '#f8fafc' }}>
          Repository Skill Proficiency Breakdown
        </h3>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="language" stroke="#64748b" tickLine={false} />
              <YAxis stroke="#64748b" tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="level" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
