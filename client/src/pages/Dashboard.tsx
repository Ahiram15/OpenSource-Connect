import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { SkillProficiency } from '../types';

const dummySkillData: SkillProficiency[] = [
  { language: 'React', level: 85, color: '#6366f1' },
  { language: 'Node.js', level: 75, color: '#38bdf8' },
  { language: 'Python', level: 60, color: '#10b981' },
  { language: 'MongoDB', level: 70, color: '#f59e0b' }
];

export default function Dashboard(): React.ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }} className="gradient-text">
          Developer Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Overview of your open-source contributions and skill proficiency.
        </p>
      </div>

      {/* Summary Blocks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Summary Block 1: Total Contributions */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Contributions
          </span>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#38bdf8', marginTop: '8px' }}>
            0
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Merged pull requests & verified issues
          </p>
        </div>

        {/* Summary Block 2: Saved Issues */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Saved Issues
          </span>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#818cf8', marginTop: '8px' }}>
            0
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Bookmarked issues for roadmap learning
          </p>
        </div>
      </div>

      {/* Dummy Skill Chart */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', color: '#f8fafc' }}>
          Language Skill Proficiency
        </h3>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dummySkillData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="language" stroke="#64748b" tickLine={false} />
              <YAxis stroke="#64748b" tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="level" radius={[6, 6, 0, 0]}>
                {dummySkillData.map((entry, index) => (
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
