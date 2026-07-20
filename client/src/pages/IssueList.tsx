import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRecommendations, IssueItem } from '../services/api';

export default function IssueList(): React.ReactElement {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('good first issue');
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchRecommendations(selectedLanguage === 'All' ? 'javascript' : selectedLanguage.toLowerCase(), selectedDifficulty === 'All' ? 'good first issue' : selectedDifficulty)
      .then((data) => {
        if (isMounted) {
          setIssues(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch live recommendations:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedLanguage, selectedDifficulty]);

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          issue.repository.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="react">React</option>
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
            <option value="good first issue">good first issue</option>
            <option value="help wanted">help wanted</option>
            <option value="bug">bug</option>
          </select>
        </div>
      </div>

      {/* Issue Cards Feed */}
      <div style={{ flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
          Recommended GitHub Issues ({filteredIssues.length})
        </h2>

        {loading ? (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            ⚡ Fetching live GitHub issues & calculating Gemini AI match scores...
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No matching issues found for selected filters. Try changing language or label.
          </div>
        ) : (
          filteredIssues.map((issue: IssueItem) => (
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
                {/* Repository & Stars */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span className="badge-tag">{issue.repository}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    ★ {issue.stars.toLocaleString()}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
                  {issue.title}
                </h3>

                {/* Explanation */}
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  {issue.explanation}
                </p>

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
                  onClick={() => navigate(`/issues/${issue.id}`, { state: { issue } })}
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
          ))
        )}
      </div>
    </div>
  );
}
