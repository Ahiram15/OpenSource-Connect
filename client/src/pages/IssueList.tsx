import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRecommendations, fetchUserProfile, IssueItem, UserProfile } from '../services/api';

export default function IssueList(): React.ReactElement {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('good first issue');
  const [minMatchScore, setMinMatchScore] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('matchScore');
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAutoMatched, setIsAutoMatched] = useState<boolean>(false);

  useEffect(() => {
    fetchUserProfile()
      .then((profile) => setUserProfile(profile))
      .catch((err) => console.error('Failed to load profile for auto-select:', err));
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const langQuery = selectedLanguage === 'All' ? 'javascript' : selectedLanguage.toLowerCase();
    const diffQuery = selectedDifficulty === 'All' ? 'good first issue' : selectedDifficulty;

    fetchRecommendations(langQuery, diffQuery)
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

  // Handle Auto-Select Skills
  const handleAutoSelectSkills = (): void => {
    if (userProfile && userProfile.technicalInterests.length > 0) {
      const topSkill = userProfile.technicalInterests[0].toLowerCase();
      setSelectedLanguage(topSkill);
      setSelectedDifficulty('good first issue');
      setIsAutoMatched(true);
    }
  };

  // Filter and Sort issues
  const filteredIssues = issues
    .filter(issue => {
      const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            issue.repository.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesScore = issue.matchScore >= minMatchScore;
      return matchesSearch && matchesScore;
    })
    .sort((a, b) => {
      if (sortBy === 'stars') return b.stars - a.stars;
      return b.matchScore - a.matchScore;
    });

  const openCodespaces = (repository: string): void => {
    window.open(`https://codespaces.new/${repository}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {/* Sidebar Search & Filters */}
      <div className="glass-panel" style={{ width: '300px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            🔍 Search & Filters
          </h3>
          {isAutoMatched && (
            <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
              Auto-Matched
            </span>
          )}
        </div>

        {/* ⚡ Auto Select Button */}
        <button
          onClick={handleAutoSelectSkills}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '0.85rem',
            borderRadius: '8px',
            background: 'linear-gradient(90deg, #6366f1 0%, #38bdf8 100%)',
            justifyContent: 'center',
            fontWeight: 700
          }}
        >
          ⚡ Auto-Select My GitHub Skills
        </button>

        <hr style={{ borderColor: 'var(--glass-border)', margin: '0' }} />

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

        {/* Manual Language Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
            Language (Manual Select)
          </label>
          <select 
            value={selectedLanguage}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setSelectedLanguage(e.target.value);
              setIsAutoMatched(false);
            }}
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
            <option value="node">Node.js</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="html">HTML / CSS</option>
            <option value="All">All Languages</option>
          </select>
        </div>

        {/* Manual Difficulty Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
            Difficulty / Label
          </label>
          <select 
            value={selectedDifficulty}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setSelectedDifficulty(e.target.value);
              setIsAutoMatched(false);
            }}
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
            <option value="enhancement">enhancement</option>
            <option value="documentation">documentation</option>
            <option value="Intermediate">Intermediate</option>
            <option value="All">All Difficulties</option>
          </select>
        </div>

        {/* Minimum Match Score Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
            Minimum AI Match Score (%)
          </label>
          <select 
            value={minMatchScore}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMinMatchScore(Number(e.target.value))}
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
            <option value={0}>All Scores (0%+)</option>
            <option value={80}>High Match (80%+)</option>
            <option value={70}>Medium Match (70%+)</option>
            <option value={60}>Moderate Match (60%+)</option>
          </select>
        </div>

        {/* Sort By Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
            Sort Recommendations By
          </label>
          <select 
            value={sortBy}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)}
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
            <option value="matchScore">Highest AI Match Score</option>
            <option value="stars">Most Repository Stars</option>
          </select>
        </div>
      </div>

      {/* Issue Cards Feed */}
      <div style={{ flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Recommended GitHub Issues ({filteredIssues.length})
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing {selectedLanguage.toUpperCase()} • {selectedDifficulty}
          </span>
        </div>

        {loading ? (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            ⚡ Fetching live GitHub issues & calculating Gemini AI match scores...
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No matching issues found for selected filters. Try changing language or label.
          </div>
        ) : (
          filteredIssues.map((issue: IssueItem) => {
            const githubUrl = issue.url || `https://github.com/${issue.repository}`;
            return (
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
                  {/* Repository & Stars (Clickable Link) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <a 
                      href={`https://github.com/${issue.repository}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="badge-tag"
                      style={{ textDecoration: 'none', cursor: 'pointer' }}
                    >
                      {issue.repository} ↗
                    </a>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      ★ {issue.stars.toLocaleString()}
                    </span>
                  </div>

                  {/* Title (Clickable Redirect Link) */}
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
                    <a 
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#f8fafc', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#f8fafc')}
                    >
                      {issue.title} 🔗
                    </a>
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

                  <a 
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ width: '100%', padding: '6px 12px', fontSize: '0.78rem', borderRadius: '6px', justifyContent: 'center', textAlign: 'center', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                  >
                    🔗 GitHub Issue
                  </a>

                  <button 
                    onClick={() => openCodespaces(issue.repository)}
                    className="btn-secondary"
                    style={{ width: '100%', padding: '6px 12px', fontSize: '0.78rem', borderRadius: '6px', justifyContent: 'center' }}
                  >
                    🚀 Codespaces
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
