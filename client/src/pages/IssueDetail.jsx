import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const mockIssueDetail = {
  id: "issue-101",
  title: "Fix React routing leak on component unmount",
  repository: "facebook/react-router",
  stars: 49200,
  labels: ["bug", "good first issue"],
  matchScore: 92,
  explanation: "Matches your profile history because you have React experience.",
  difficulty: "Intermediate",
  estimatedTime: "2-3 hours",
  fullExplanation: "When unmounting a routed view inside React Router v6, event listeners registered during transition transitions are not cleaned up properly, causing a slight memory leak in long-running SPAs.",
  knowledgeGaps: [
    "React Router transitions",
    "Effect unmount cleanup hooks"
  ],
  initialRoadmap: [
    { step: 1, task: "Read React Router documentation on route transitions", completed: false },
    { step: 2, task: "Locate the memory leak event listener inside code", completed: false },
    { step: 3, task: "Add a return function inside useEffect to remove listener", completed: false }
  ]
};

export default function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(mockIssueDetail.initialRoadmap);

  const toggleStep = (index) => {
    const updated = [...roadmap];
    updated[index].completed = !updated[index].completed;
    setRoadmap(updated);
  };

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
            <span className="badge-tag" style={{ marginBottom: '8px', display: 'inline-block' }}>
              {mockIssueDetail.repository}
            </span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              {mockIssueDetail.title}
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
            {mockIssueDetail.matchScore}%
          </div>
        </div>

        {/* Full Explanation */}
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginTop: '12px' }}>
          {mockIssueDetail.fullExplanation}
        </p>
      </div>

      {/* AI Match Rationale & Knowledge Gaps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
            🤖 AI Match Rationale
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            {mockIssueDetail.explanation}
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
            ⚠️ Knowledge Gaps
          </h3>
          <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            {mockIssueDetail.knowledgeGaps.map((gap) => (
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
          {roadmap.map((item, index) => (
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
