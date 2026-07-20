import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { IssueItem } from '../services/api';

export default function IssueDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const stateIssue = (location.state as { issue?: IssueItem })?.issue;

  const currentIssue: IssueItem = stateIssue || {
    id: id || 'issue-101',
    title: 'Fix React routing leak on component unmount',
    repository: 'facebook/react-router',
    stars: 49200,
    labels: ['bug', 'good first issue'],
    matchScore: 92,
    explanation: 'Matches your profile history because you have React experience.',
    difficulty: 'Intermediate',
    estimatedTime: '2-3 hours',
    knowledgeGaps: ['React Router transitions', 'Effect unmount cleanup hooks'],
    roadmap: [
      { step: 1, task: 'Read React Router documentation on route transitions', completed: false },
      { step: 2, task: 'Locate the memory leak event listener inside code', completed: false },
      { step: 3, task: 'Add a return function inside useEffect to remove listener', completed: false }
    ],
    url: 'https://github.com/facebook/react-router/issues/101'
  };

  const [roadmap, setRoadmap] = useState(currentIssue.roadmap || []);

  const toggleStep = (index: number): void => {
    const updated = [...roadmap];
    updated[index].completed = !updated[index].completed;
    setRoadmap(updated);
  };

  const openCodespaces = (): void => {
    window.open(`https://codespaces.new/${currentIssue.repository}`, '_blank', 'noopener,noreferrer');
  };

  const githubUrl = currentIssue.url || `https://github.com/${currentIssue.repository}`;

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Back Link */}
      <button 
        onClick={() => navigate('/issues')}
        className="btn-secondary"
        style={{ width: 'fit-content', padding: '6px 14px', fontSize: '0.85rem' }}
      >
        ← Back to Issue Feed
      </button>

      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '12px' }}>
          <div>
            <a 
              href={`https://github.com/${currentIssue.repository}`}
              target="_blank"
              rel="noopener noreferrer"
              className="badge-tag"
              style={{ marginBottom: '8px', display: 'inline-block', textDecoration: 'none' }}
            >
              {currentIssue.repository} ↗
            </a>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0' }}>
              <a 
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#f8fafc', textDecoration: 'none' }}
              >
                {currentIssue.title} 🔗
              </a>
            </h1>
          </div>

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
            {currentIssue.matchScore}%
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
          <a 
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.9rem', borderRadius: '8px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            🔗 Open Original Issue on GitHub
          </a>

          <button 
            onClick={openCodespaces}
            className="btn-secondary"
            style={{ padding: '10px 20px', fontSize: '0.9rem', borderRadius: '8px' }}
          >
            🚀 Open in GitHub Codespaces
          </button>
        </div>
      </div>

      {/* AI Match Rationale & Knowledge Gaps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
            🤖 AI Match Rationale
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            {currentIssue.explanation}
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
            ⚠️ Knowledge Gaps
          </h3>
          <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            {currentIssue.knowledgeGaps?.map((gap: string) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Interactive Step-by-Step Learning Roadmap Checklist */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', marginBottom: '20px' }}>
          🗺️ Interactive Learning Roadmap Checklist
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {roadmap.map((item, index: number) => (
            <label 
              key={item.step}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px 20px',
                borderRadius: '10px',
                background: item.completed ? 'rgba(16, 185, 129, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                border: item.completed ? '1px solid #10b981' : '1px solid var(--glass-border)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <input 
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleStep(index)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: item.completed ? '#34d399' : '#818cf8' }}>
                  STEP {item.step}
                </span>
                <p style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: item.completed ? 'var(--text-muted)' : '#f8fafc',
                  textDecoration: item.completed ? 'line-through' : 'none',
                  margin: '2px 0 0 0'
                }}>
                  {item.task}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
