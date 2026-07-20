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
  const [mounted, setMounted] = useState<boolean>(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleStep = (index: number): void => {
    const updated = [...roadmap];
    updated[index].completed = !updated[index].completed;
    setRoadmap(updated);
  };

  const openCodespaces = (): void => {
    window.open(`https://codespaces.new/${currentIssue.repository}`, '_blank', 'noopener,noreferrer');
  };

  const githubUrl = currentIssue.url || `https://github.com/${currentIssue.repository}`;

  const completedSteps = roadmap.filter(r => r.completed).length;
  const totalSteps = roadmap.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '36px', padding: '16px 8px' }}>
      
      {/* Back Link */}
      <button 
        onClick={() => navigate('/issues')}
        className="btn-secondary"
        style={{ width: 'fit-content', padding: '8px 16px', fontSize: '0.8rem', borderRadius: '6px' }}
      >
        ← Back to Issue Feed
      </button>

      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <a 
              href={`https://github.com/${currentIssue.repository}`}
              target="_blank"
              rel="noopener noreferrer"
              className="badge-tag"
              style={{ display: 'inline-block', textDecoration: 'none', width: 'fit-content' }}
            >
              {currentIssue.repository} ↗
            </a>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 650, margin: '8px 0 0 0', color: '#ffffff', letterSpacing: '-0.015em' }}>
              <a 
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#ffffff', textDecoration: 'none' }}
              >
                {currentIssue.title}
              </a>
            </h1>
          </div>

          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            background: 'rgba(16, 185, 129, 0.05)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.82rem'
          }}>
            {currentIssue.matchScore}%
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
          <a 
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ padding: '10px 18px', fontSize: '0.8rem', borderRadius: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', border: 'none', boxShadow: 'none' }}
          >
            Open Original Issue ↗
          </a>

          <button 
            onClick={openCodespaces}
            className="btn-secondary"
            style={{ padding: '10px 18px', fontSize: '0.8rem', borderRadius: '6px' }}
          >
            Open in Codespace
          </button>
        </div>
      </div>

      {/* AI Match Rationale & Knowledge Gaps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
        
        {/* Rationale */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1rem' }}>🧠</span>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 650, color: '#ffffff', margin: 0 }}>
              AI Match Rationale
            </h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
            {currentIssue.explanation}
          </p>
        </div>

        {/* Knowledge Gaps */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1rem' }}>⚠️</span>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 650, color: '#ffffff', margin: 0 }}>
              Knowledge Gaps
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentIssue.knowledgeGaps && currentIssue.knowledgeGaps.length > 0 ? (
              currentIssue.knowledgeGaps.map((gap: string) => (
                <div key={gap} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                  {gap}
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', margin: 0 }}>
                No gaps identified! You are fully prepared to contribute.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Step-by-Step Learning Roadmap Checklist */}
      <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Progress Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 650, color: '#ffffff', margin: 0 }}>
              Interactive Learning Roadmap
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '4px 0 0 0' }}>
              Bridge your knowledge gaps by completing steps sequentially
            </p>
          </div>
          <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--text-muted)', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)', padding: '6px 12px', borderRadius: '6px' }}>
            {completedSteps} / {totalSteps} Steps • {progressPercent}%
          </span>
        </div>

        {/* Slim progress bar track */}
        <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
          <div 
            style={{ 
              height: '100%', 
              width: mounted ? `${progressPercent}%` : '0%', 
              background: 'linear-gradient(90deg, #6366f1 0%, #10b981 100%)',
              borderRadius: '3px',
              transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)'
            }} 
          />
        </div>

        {/* Checklist Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {roadmap.map((item, index: number) => (
            <label 
              key={item.step}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '18px 24px',
                borderRadius: '8px',
                border: item.completed ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid rgba(255,255,255,0.03)',
                backgroundColor: item.completed ? 'rgba(16, 185, 129, 0.02)' : 'rgba(255,255,255,0.01)',
                cursor: 'pointer',
                transition: 'all 0.25s'
              }}
            >
              <input 
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleStep(index)}
                style={{ display: 'none' }}
              />
              
              {/* Custom Checkbox indicator */}
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: item.completed ? '1.5px solid #10b981' : '1.5px solid rgba(255,255,255,0.2)',
                backgroundColor: item.completed ? '#10b981' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                flexShrink: 0
              }}>
                {item.completed && (
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', fontWeight: 600, color: item.completed ? '#10b981' : '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Step {item.step}
                </span>
                <p style={{ 
                  fontSize: '0.88rem', 
                  fontWeight: 600,
                  margin: 0, 
                  textDecoration: item.completed ? 'line-through' : 'none',
                  color: item.completed ? 'var(--text-dim)' : 'var(--text-main)',
                  lineHeight: '1.4'
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
