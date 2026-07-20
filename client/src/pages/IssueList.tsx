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

  const getDifficultyTheme = (difficulty: string) => {
    const diff = (difficulty || '').toLowerCase();
    if (diff.includes('beginner') || diff.includes('good first')) {
      return { text: '#10b981', bg: 'rgba(16, 185, 129, 0.05)', border: 'rgba(16, 185, 129, 0.15)' };
    } else if (diff.includes('intermediate') || diff.includes('help wanted')) {
      return { text: '#f59e0b', bg: 'rgba(245, 158, 11, 0.05)', border: 'rgba(245, 158, 11, 0.15)' };
    }
    return { text: '#6366f1', bg: 'rgba(99, 102, 241, 0.05)', border: 'rgba(99, 102, 241, 0.15)' };
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', padding: '16px 8px', maxWidth: '1200px', margin: '0 auto', width: '100%', alignItems: 'flex-start' }}>
      
      {/* Sidebar Search & Filters */}
      <div className="glass-panel" style={{ width: '300px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
            🔍 Search & Filters
          </h3>
          {isAutoMatched && (
            <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, fontFamily: 'monospace', textTransform: 'uppercase' }}>
              Auto
            </span>
          )}
        </div>

        {/* Auto Select Button */}
        <button
          onClick={handleAutoSelectSkills}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '10px 14px',
            fontSize: '0.8rem',
            borderRadius: '6px',
            background: 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)',
            justifyContent: 'center',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            boxShadow: 'none'
          }}
        >
          ✨ Auto-Select My Skills
        </button>

        <hr style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '0' }} />

        {/* Search Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
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
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.06)',
              backgroundColor: 'rgba(0,0,0,0.3)',
              color: '#ffffff',
              fontSize: '0.8rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Manual Language Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
            Language Focus
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
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.06)',
              backgroundColor: 'rgba(0,0,0,0.3)',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
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
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.06)',
              backgroundColor: 'rgba(0,0,0,0.3)',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
            Min Match Score
          </label>
          <select 
            value={minMatchScore}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMinMatchScore(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.06)',
              backgroundColor: 'rgba(0,0,0,0.3)',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
            Sort By
          </label>
          <select 
            value={sortBy}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.06)',
              backgroundColor: 'rgba(0,0,0,0.3)',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', minWidth: '320px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 650, color: '#ffffff', margin: 0, letterSpacing: '-0.015em' }}>
            Recommended Issues ({filteredIssues.length})
          </h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', backgroundColor: 'rgba(25, 25, 30, 0.4)', border: '1px solid rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '20px', fontFamily: 'monospace', textTransform: 'uppercase' }}>
            {selectedLanguage} • {selectedDifficulty}
          </span>
        </div>

        {loading ? (
          <div className="glass-panel" style={{ padding: '64px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            <span style={{ display: 'inline-block', animation: 'pulse 1.5s infinite', marginRight: '8px' }}>⚡</span>
            Fetching live GitHub issues & calculating Gemini AI match scores...
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="glass-panel" style={{ padding: '64px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No matching issues found for selected filters. Try changing language or labels.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {filteredIssues.map((issue: IssueItem) => {
              const githubUrl = issue.url || `https://github.com/${issue.repository}`;
              const diffTheme = getDifficultyTheme(issue.difficulty);
              
              return (
                <div 
                  key={issue.id}
                  className="glass-panel"
                  style={{
                    padding: '32px',
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '24px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Left colored border strip for high match score issues */}
                  {issue.matchScore >= 85 && (
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: 'linear-gradient(180deg, #6366f1, #4f46e5)' }} />
                  )}

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '280px' }}>
                    {/* Repository, Stars & Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
                      <a 
                        href={`https://github.com/${issue.repository}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.72rem',
                          color: '#a5b4fc',
                          backgroundColor: 'rgba(99, 102, 241, 0.05)',
                          border: '1px solid rgba(99, 102, 241, 0.15)',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                          textDecoration: 'none'
                        }}
                      >
                        {issue.repository} ↗
                      </a>
                      
                      <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ⭐ {issue.stars.toLocaleString()}
                      </span>

                      {/* Difficulty Badge */}
                      <span 
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          textTransform: 'uppercase',
                          padding: '2px 10px',
                          borderRadius: '20px',
                          color: diffTheme.text,
                          background: diffTheme.bg,
                          border: `1px solid ${diffTheme.border}`
                        }}
                      >
                        {issue.difficulty || 'Beginner'}
                      </span>

                      {/* Estimated Time Badge */}
                      {issue.estimatedTime && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, fontFamily: 'monospace', color: 'var(--text-dim)', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '2px 10px', borderRadius: '20px' }}>
                          ⏱️ {issue.estimatedTime}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: '1rem', fontWeight: 650, margin: 0, lineHeight: '1.4' }}>
                      <a 
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#ffffff', textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#818cf8'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
                      >
                        {issue.title}
                      </a>
                    </h3>

                    {/* Explanation Description */}
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                      {issue.explanation}
                    </p>

                    {/* Issue Labels */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {issue.labels.map(label => (
                        <span 
                          key={label}
                          style={{
                            fontSize: '0.68rem',
                            fontFamily: 'monospace',
                            color: 'var(--text-dim)',
                            backgroundColor: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.04)',
                            padding: '1px 6px',
                            borderRadius: '3px'
                          }}
                        >
                          #{label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Match Score Indicator & Action Column */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px', minWidth: '150px', justifyContent: 'flex-end' }}>
                    
                    {/* Compact Match Score Orb */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', border: '1px solid rgba(16, 185, 129, 0.15)', backgroundColor: 'rgba(16, 185, 129, 0.05)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 700 }}>
                        {issue.matchScore}%
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'monospace' }}>Match</span>
                    </div>

                    {/* Navigation Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button 
                        onClick={() => navigate(`/issues/${issue.id}`, { state: { issue } })}
                        className="btn-primary"
                        style={{
                          padding: '8px 16px',
                          fontSize: '0.78rem',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 650,
                          textAlign: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        Roadmap →
                      </button>

                      <button 
                        onClick={() => openCodespaces(issue.repository)}
                        className="btn-secondary"
                        style={{
                          padding: '8px 16px',
                          fontSize: '0.78rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 650,
                          textAlign: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        Codespace
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
