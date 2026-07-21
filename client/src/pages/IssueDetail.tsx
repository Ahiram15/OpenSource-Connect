import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { IssueItem, fetchPRStarter, AIPRStarter } from '../services/api';
import { Sparkles, Copy, Check, Code2, GitPullRequest, Terminal, CheckSquare } from 'lucide-react';

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
  const [prStarter, setPrStarter] = useState<AIPRStarter | null>(null);
  const [loadingPr, setLoadingPr] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedPrBody, setCopiedPrBody] = useState<boolean>(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleStep = (index: number): void => {
    const updated = [...roadmap];
    updated[index].completed = !updated[index].completed;
    setRoadmap(updated);
  };

  const handleGeneratePRStarter = async (): Promise<void> => {
    setLoadingPr(true);
    try {
      const techStack = [
        currentIssue.repository.split('/')[0],
        currentIssue.repository.split('/')[1],
        ...(currentIssue.labels || []),
        ...(currentIssue.knowledgeGaps || [])
      ].filter(Boolean);

      const issueDetails = `${currentIssue.explanation} - ${currentIssue.knowledgeGaps.join(', ')}`;
      const data = await fetchPRStarter(currentIssue.title, issueDetails, techStack);
      setPrStarter(data);
    } catch (err) {
      console.error('Failed to generate PR starter:', err);
    } finally {
      setLoadingPr(false);
    }
  };

  const copyCodeDraft = (): void => {
    if (prStarter?.codeDraft) {
      navigator.clipboard.writeText(prStarter.codeDraft);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const copyPrBody = (): void => {
    if (prStarter) {
      const bodyMarkdown = `## ${prStarter.prTitle}

### Summary & Implementation Outline
${prStarter.implementationOutline.map(step => `- ${step}`).join('\n')}

### Pre-Flight Checklist
${prStarter.prChecklist.map(item => `- [x] ${item}`).join('\n')}

---
*Generated with [OpenSource Connect](https://github.com/Ahiram15/OpenSource-Connect)*`;

      navigator.clipboard.writeText(bodyMarkdown);
      setCopiedPrBody(true);
      setTimeout(() => setCopiedPrBody(false), 2000);
    }
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

      {/* ─── AI PR Starter & Code Assistant Card ──────────────────────── */}
      <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                AI PR Starter & Code Assistant
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '2px 0 0 0' }}>
                Generate starter code, solution outline, and copyable PR description
              </p>
            </div>
          </div>

          <button
            onClick={handleGeneratePRStarter}
            disabled={loadingPr}
            className="btn-primary"
            style={{
              padding: '10px 18px',
              fontSize: '0.82rem',
              borderRadius: '8px',
              cursor: loadingPr ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: loadingPr ? 0.7 : 1
            }}
          >
            {loadingPr ? (
              <>
                <span className="spinner" style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                Generating PR Blueprint...
              </>
            ) : (
              <>
                <GitPullRequest size={16} />
                {prStarter ? 'Regenerate PR Blueprint' : 'Generate AI PR Blueprint'}
              </>
            )}
          </button>
        </div>

        {prStarter && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
            {/* PR Title Banner */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recommended PR Title</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px', fontFamily: 'monospace' }}>
                  {prStarter.prTitle}
                </div>
              </div>

              <button
                onClick={copyPrBody}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.78rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {copiedPrBody ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                {copiedPrBody ? 'PR Description Copied!' : 'Copy PR Description'}
              </button>
            </div>

            {/* Implementation Outline */}
            <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Terminal size={16} color="#38bdf8" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Implementation Outline</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {prStarter.implementationOutline.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                    <span style={{ color: '#38bdf8', fontWeight: 700, fontFamily: 'monospace' }}>{idx + 1}.</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Draft Block */}
            <div style={{ background: 'rgba(7, 9, 14, 0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  <Code2 size={15} color="#34d399" />
                  Starter Code Snippet
                </div>
                <button
                  onClick={copyCodeDraft}
                  style={{ background: 'transparent', border: 'none', color: copiedCode ? '#34d399' : 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'monospace' }}
                >
                  {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                  {copiedCode ? 'Copied Code!' : 'Copy Code'}
                </button>
              </div>
              <pre style={{ margin: 0, padding: '18px 20px', fontSize: '0.82rem', fontFamily: 'monospace', color: '#a5b4fc', overflowX: 'auto', lineHeight: 1.5 }}>
                <code>{prStarter.codeDraft}</code>
              </pre>
            </div>

            {/* Pre-flight PR Checklist */}
            <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <CheckSquare size={16} color="#fbbf24" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>PR Submission Checklist</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {prStarter.prChecklist.map((checkItem, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <span style={{ color: '#34d399', fontSize: '0.9rem' }}>✓</span>
                    <span>{checkItem}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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
