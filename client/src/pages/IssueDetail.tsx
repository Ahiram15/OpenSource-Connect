import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { IssueItem, fetchPRStarter, AIPRStarter } from '../services/api';
import { Sparkles, Copy, Check, Code2, GitPullRequest, Terminal, CheckSquare, MessageSquare, Send, X, Lightbulb, Eye, Unlock, ArrowRight, Zap, ChevronRight } from 'lucide-react';

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
  const [hintLevel, setHintLevel] = useState<number>(0); // 0 = none, 1 = hint 1, 2 = hint 2, 3 = full code
  const [loadingPr, setLoadingPr] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedPrBody, setCopiedPrBody] = useState<boolean>(false);
  const [copiedCmdIdx, setCopiedCmdIdx] = useState<number | null>(null);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleStep = (index: number): void => {
    const updated = [...roadmap];
    updated[index].completed = !updated[index].completed;
    setRoadmap(updated);
  };

  const handleGeneratePRStarter = async (targetLevel: number = 1): Promise<void> => {
    if (prStarter) {
      setHintLevel(targetLevel);
      return;
    }
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
      setHintLevel(targetLevel);
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
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            border: '2px solid #FFF4B7',
            background: 'rgba(0, 106, 103, 0.35)',
            color: '#FFF4B7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.88rem',
            boxShadow: '0 0 14px rgba(255, 244, 183, 0.3)'
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

      {/* ─── Guided Solution Lab: Hints First ➔ Full Code ──────────────── */}
      <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #006A67 0%, #FFF4B7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(0, 106, 103, 0.5)'
            }}>
              <Lightbulb size={20} color="#020B34" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Guided Solution Lab
                </h3>
                <span style={{ fontSize: '0.68rem', background: 'rgba(0, 106, 103, 0.35)', color: '#FFF4B7', border: '1px solid rgba(255, 244, 183, 0.4)', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                  AI MENTOR
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '3px 0 0 0' }}>
                Get progressive clues to solve the issue yourself, or reveal the complete working code
              </p>
            </div>
          </div>

          {/* Action Choice Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleGeneratePRStarter(1)}
              disabled={loadingPr}
              className="btn-primary"
              style={{
                padding: '10px 18px',
                fontSize: '0.83rem',
                borderRadius: '8px',
                cursor: loadingPr ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: loadingPr ? 0.7 : 1
              }}
            >
              {loadingPr && hintLevel !== 3 ? (
                <>
                  <span className="spinner" style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  Analyzing Clues...
                </>
              ) : (
                <>
                  <Lightbulb size={16} />
                  {hintLevel > 0 && hintLevel < 3 ? 'Review Hints' : '💡 Give Hints First'}
                </>
              )}
            </button>

            <button
              onClick={() => handleGeneratePRStarter(3)}
              disabled={loadingPr}
              className="btn-secondary"
              style={{
                padding: '10px 18px',
                fontSize: '0.83rem',
                borderRadius: '8px',
                cursor: loadingPr ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderColor: hintLevel === 3 ? 'var(--primary)' : 'rgba(255,255,255,0.12)'
              }}
            >
              {loadingPr && hintLevel === 3 ? (
                <>
                  <span className="spinner" style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  Generating Code...
                </>
              ) : (
                <>
                  <Code2 size={16} color="#38bdf8" />
                  ⚡ Reveal Whole Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* PROGRESS STEPPER (Level 1 ➔ Level 2 ➔ Level 3) */}
        {hintLevel > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            padding: '12px 18px',
            marginTop: '6px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div
              onClick={() => setHintLevel(1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: hintLevel >= 1 ? '#818cf8' : 'var(--text-dim)',
                fontWeight: hintLevel === 1 ? 700 : 500,
                fontSize: '0.83rem'
              }}
            >
              <span style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: hintLevel >= 1 ? '#6366f1' : 'rgba(255,255,255,0.06)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                1
              </span>
              Hint 1: Where to Look
            </div>

            <ChevronRight size={16} color="rgba(255,255,255,0.2)" />

            <div
              onClick={() => setHintLevel(2)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: hintLevel >= 2 ? '#38bdf8' : 'var(--text-dim)',
                fontWeight: hintLevel === 2 ? 700 : 500,
                fontSize: '0.83rem'
              }}
            >
              <span style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: hintLevel >= 2 ? '#0284c7' : 'rgba(255,255,255,0.06)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                2
              </span>
              Hint 2: Logic & Algorithm
            </div>

            <ChevronRight size={16} color="rgba(255,255,255,0.2)" />

            <div
              onClick={() => setHintLevel(3)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: hintLevel === 3 ? '#34d399' : 'var(--text-dim)',
                fontWeight: hintLevel === 3 ? 700 : 500,
                fontSize: '0.83rem'
              }}
            >
              <span style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: hintLevel === 3 ? '#059669' : 'rgba(255,255,255,0.06)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                3
              </span>
              Complete Code Solution
            </div>
          </div>
        )}

        {/* ─── STAGE 1: HINT 1 (WHERE TO LOOK) ─────────────────────────── */}
        {hintLevel === 1 && prStarter && (
          <div className="animate-fade-in" style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(56,189,248,0.04) 100%)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.3rem' }}>💡</span>
              <div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                  Hint 1: Architectural Location & Clues
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: '2px 0 0 0' }}>
                  Read this clue to locate the bug in the repository before looking at the code
                </p>
              </div>
            </div>

            <div style={{
              background: 'rgba(7, 9, 14, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '16px 20px',
              fontSize: '0.88rem',
              lineHeight: 1.6,
              color: '#e2e8f0'
            }}>
              {prStarter.hint1 || `Look at the repository's core logic handling ${currentIssue.knowledgeGaps[0] || 'lifecycle events'}. Notice where events or state updates are triggered without a corresponding cleanup.`}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '8px' }}>
              <button
                onClick={() => setHintLevel(3)}
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Zap size={14} color="#fbbf24" />
                Skip to Full Code
              </button>

              <button
                onClick={() => setHintLevel(2)}
                className="btn-primary"
                style={{ fontSize: '0.82rem', padding: '9px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                Next: Reveal Logic Hint
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ─── STAGE 2: HINT 2 (LOGIC & ALGORITHM) ─────────────────────── */}
        {hintLevel === 2 && prStarter && (
          <div className="animate-fade-in" style={{
            background: 'linear-gradient(135deg, rgba(2,132,199,0.08) 0%, rgba(99,102,241,0.04) 100%)',
            border: '1px solid rgba(56,189,248,0.3)',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.3rem' }}>🔍</span>
              <div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                  Hint 2: Algorithm & Logic Steps
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: '2px 0 0 0' }}>
                  The step-by-step logic required to solve the issue
                </p>
              </div>
            </div>

            <div style={{
              background: 'rgba(7, 9, 14, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '16px 20px',
              fontSize: '0.88rem',
              lineHeight: 1.6,
              color: '#e2e8f0'
            }}>
              {prStarter.hint2 || 'Ensure that any async listeners or memory hooks check for component unmount state and gracefully dispose of active references.'}
            </div>

            {/* Implementation Outline */}
            <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Terminal size={15} color="#38bdf8" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>Execution Outline</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {prStarter.implementationOutline.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <span style={{ color: '#38bdf8', fontWeight: 700, fontFamily: 'monospace' }}>{idx + 1}.</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '8px' }}>
              <button
                onClick={() => setHintLevel(1)}
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '8px 14px' }}
              >
                ← Back to Hint 1
              </button>

              <button
                onClick={() => setHintLevel(3)}
                className="btn-primary"
                style={{ fontSize: '0.82rem', padding: '9px 20px', display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}
              >
                <Unlock size={15} />
                🔓 Reveal Full Code Solution
              </button>
            </div>
          </div>
        )}

        {/* ─── STAGE 3: FULL CODE SOLUTION (WHOLE CODE) ───────────────── */}
        {hintLevel === 3 && prStarter && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '6px' }}>

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

            {/* Code Draft Block */}
            <div style={{ background: 'rgba(7, 9, 14, 0.95)', border: '1px solid rgba(52, 211, 153, 0.25)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#34d399', fontWeight: 700, fontFamily: 'monospace' }}>
                  <Code2 size={16} color="#34d399" />
                  Full Working Code Solution
                </div>
                <button
                  onClick={copyCodeDraft}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {copiedCode ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                  {copiedCode ? 'Copied Code!' : 'Copy Full Code'}
                </button>
              </div>
              <pre style={{ margin: 0, padding: '20px', fontSize: '0.84rem', fontFamily: 'monospace', color: '#a5b4fc', overflowX: 'auto', lineHeight: 1.6 }}>
                <code>{prStarter.codeDraft}</code>
              </pre>
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

            {/* Restart Stepper Link */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setHintLevel(1)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                ↺ Review Step-by-Step Hints Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── 1-Click Git Contribution Terminal Workflow ────────────────── */}
      <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(56,189,248,0.12)',
              border: '1px solid rgba(56,189,248,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}>
              <Terminal size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Git & Terminal Contribution Workflow
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '2px 0 0 0' }}>
                Copy-pasteable terminal commands to clone, branch, test, and commit your fix
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={openCodespaces}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              🚀 Open in Codespaces
            </button>
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '8px 14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              🔗 View on GitHub
            </a>
          </div>
        </div>

        {/* Terminal Command Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            {
              step: '1. Clone & Enter Repository',
              cmd: `git clone https://github.com/${currentIssue.repository}.git && cd ${currentIssue.repository.split('/')[1] || 'repo'}`,
              desc: 'Clone the target project to your local workstation'
            },
            {
              step: '2. Create Isolated Feature Branch',
              cmd: `git checkout -b fix/${currentIssue.id.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
              desc: 'Never commit directly to main; create a dedicated branch'
            },
            {
              step: '3. Install Dependencies & Run Tests',
              cmd: 'npm install && npm test',
              desc: 'Verify the test suite passes before making your changes'
            },
            {
              step: '4. Stage, Commit & Push Upstream',
              cmd: `git add . && git commit -m "${prStarter?.prTitle || 'fix: resolve ' + currentIssue.title.toLowerCase()}" && git push origin fix/${currentIssue.id.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
              desc: 'Commit with Conventional Commit format and push to your remote'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(7, 9, 14, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                padding: '14px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#818cf8', fontFamily: 'monospace' }}>
                  {item.step}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  {item.desc}
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                gap: '12px'
              }}>
                <code style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#a5b4fc', wordBreak: 'break-all' }}>
                  $ {item.cmd}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(item.cmd);
                    setCopiedCmdIdx(idx);
                    setTimeout(() => setCopiedCmdIdx(null), 2000);
                  }}
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.72rem', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {copiedCmdIdx === idx ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                  {copiedCmdIdx === idx ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
