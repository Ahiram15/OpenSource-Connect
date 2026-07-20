import React, { useState } from 'react';

const availableInterests: string[] = ['React', 'Node', 'Python', 'MongoDB', 'Express', 'JavaScript', 'TypeScript'];

export default function Profile(): React.ReactElement {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['React', 'Node']);
  const [experienceLevel, setExperienceLevel] = useState<string>('Beginner');

  const toggleInterest = (tech: string): void => {
    if (selectedInterests.includes(tech)) {
      setSelectedInterests(selectedInterests.filter(item => item !== tech));
    } else {
      setSelectedInterests([...selectedInterests, tech]);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }} className="gradient-text">
          Profile Settings
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Select your technical interests and experience level.
        </p>
      </div>

      {/* Technical Interests Checklist */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: '#f8fafc' }}>
          Technical Interests Checklist
        </h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {availableInterests.map((tech) => {
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
