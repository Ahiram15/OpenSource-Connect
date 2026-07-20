import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Issue } from '../types';

const mockIssues: Issue[] = [
  {
    id: "issue-101",
    title: "Fix React routing leak on component unmount",
    repository: "facebook/react-router",
    stars: 49200,
    labels: ["bug", "good first issue"],
    matchScore: 92,
    explanation: "Matches your profile history because you have React experience.",
    difficulty: "good first issue",
    language: "React",
    estimatedTime: "2-3 hours"
  },
  {
    id: "issue-102",
    title: "Add TypeScript definitions for async middleware error handlers",
    repository: "expressjs/express",
    stars: 62400,
    labels: ["help wanted", "good first issue"],
    matchScore: 88,
    explanation: "Matches your Node.js and Express backend skill set.",
    difficulty: "good first issue",
    language: "Node",
    estimatedTime: "1-2 hours"
  },
  {
    id: "issue-103",
    title: "Optimize AST parser speed for multi-line string interpolation",
    repository: "python/cpython",
    stars: 58900,
    labels: ["performance", "Intermediate"],
    matchScore: 75,
    explanation: "Good fit based on your Python profile interest.",
    difficulty: "Intermediate",
    language: "Python",
    estimatedTime: "4-5 hours"
  }
];

export default function IssueList(): React.ReactElement {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const filteredIssues = mockIssues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          issue.repository.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = selectedLanguage === 'All' || issue.language === selectedLanguage;
    const matchesDifficulty = selectedDifficulty === 'All' || issue.difficulty === selectedDifficulty;
    return matchesSearch && matchesLanguage && matchesDifficulty;
  });

  const openCodespaces = (repository: string): void => {
    window.open(`https://codespaces.new/${repository}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {/* Sidebar Search & Filters */}
      <div className="glass-panel" style={{ width: '280px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
          🔍 Search & Filters
        </h3>

        {/* Search Input */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
            Search Issues
          </label>
          <input 
            type="text"
            placeholder="Search repo or title..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid var(--glass-border)',
              background: 'rgba(15, 23, 42, 0.7)',
              color: '#fff',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Language Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
            Language
          </label>
          <select 
            value={selectedLanguage}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedLanguage(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid var(--glass-border)',
              background: 'rgba(15, 23, 42, 0.7)',
              color: '#fff',
              fontSize: '0.88rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="All">All Languages</option>
            <option value="React">React</option>
            <option value="Node">Node</option>
            <option value="Python">Python</option>
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
            Difficulty Level
          </label>
          <select 
            value={selectedDifficulty}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedDifficulty(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid var(--glass-border)',
              background: 'rgba(15, 23, 42, 0.7)',
              color: '#fff',
              fontSize: '0.88rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="All">All Difficulties</option>
            <option value="good first issue">good first issue</option>
            <option value="Intermediate">Intermediate</option>
          </select>
        </div>
      </div>

      {/* Issue Cards Feed */}
      <div style={{ flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
          Recommended GitHub Issues ({filteredIssues.length})
        </h2>

        {filteredIssues.map((issue: Issue) => (
          <div 
            key={issue.id}
            className="glass-panel"
            style={{
              padding: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '20px'
            }}
          >
            <div style={{ flex: 1 }}>
              {/* Repository & Language Tags */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span className="badge-tag">{issue.repository}</span>
                <span className="badge-tag" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                  {issue.language}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ★ {issue.stars.toLocaleString()}
                </span>
              </div>

              {/* Title */}
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
                {issue.title}
              </h3>

              {/* Labels */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {issue.labels.map(label => (
                  <span 
                    key={label}
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      background: 'rgba(255,255,255,0.06)',
                      padding: '3px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    #{label}
                  </span>
                ))}
              </div>
            </div>

            {/* Circular Green Match Score Badge & Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '140px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                border: '2px solid #10b981',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.05rem',
                boxShadow: '0 0 12px rgba(16, 185, 129, 0.25)'
              }}>
                {issue.matchScore}%
              </div>

              <button 
                onClick={() => navigate(`/issues/${issue.id}`)}
                className="btn-primary"
                style={{ width: '100%', padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px', justifyContent: 'center' }}
              >
                View Roadmap
              </button>

              <button 
                onClick={() => openCodespaces(issue.repository)}
                className="btn-secondary"
                style={{ width: '100%', padding: '6px 12px', fontSize: '0.78rem', borderRadius: '6px', justifyContent: 'center' }}
              >
                🚀 Codespaces
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
