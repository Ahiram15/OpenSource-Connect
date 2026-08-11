import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { IssueItem, fetchPRStarter, AIPRStarter, ChatMessage, sendIssueChatMessage } from '../services/api';
import { Sparkles, Copy, Check, Code2, GitPullRequest, Terminal, CheckSquare, MessageSquare, Send, X } from 'lucide-react';

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

  // AI Issue Copilot Chat States
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [sendingChat, setSendingChat] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatOpen]);

  // Send message
  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || chatInput;
    if (!textToSend.trim() || sendingChat) return;

    const userMsg: ChatMessage = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!customMessage) setChatInput('');
    setSendingChat(true);

    try {
      const response = await sendIssueChatMessage(
        currentIssue.id,
        currentIssue.title,
        currentIssue.explanation || '',
        messages,
        textToSend
      );
      const assistantMsg: ChatMessage = { role: 'model', text: response.reply };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        role: 'model',
        text: 'Sorry, I encountered an issue connecting to the Gemini server. Please check that the server is running and try again.'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSendingChat(false);
    }
  };

  const suggestionChips = [
    { text: '🛠️ Setup Guide', message: 'How do I run and test this repository locally?' },
    { text: '🔍 File Locations', message: 'Which files should I edit to solve this issue?' },
    { text: '✏️ Code Fix Draft', message: 'Can you show me a typescript code snippet for the fix?' },
  ];

  const renderMessageContent = (text: string) => {
    const lines = text.split('\n');
    let inCodeBlock = false;
    let codeContent: string[] = [];

    return lines.map((line, idx) => {
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          inCodeBlock = false;
          const code = codeContent.join('\n');
          codeContent = [];
          return (
            <pre key={idx} style={{
              background: '#07090e',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px',
              padding: '12px',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              color: '#a5b4fc',
              overflowX: 'auto',
              margin: '8px 0',
              whiteSpace: 'pre-wrap'
            }}>
              <code>{code}</code>
            </pre>
          );
        } else {
          inCodeBlock = true;
          return null;
        }
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return null;
      }

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={idx} style={{ marginLeft: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '4px' }}>
            {line.trim().substring(2)}
          </li>
        );
      }

      const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <li key={idx} style={{ marginLeft: '16px', listStyleType: 'decimal', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '4px' }}>
            {numMatch[2]}
          </li>
        );
      }

      const parts = line.split(/(`[^`]+`)/g);
      const lineContent = parts.map((part, pIdx) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={pIdx} style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '0.78rem',
              fontFamily: 'monospace',
              color: '#f43f5e'
            }}>
              {part.substring(1, part.length - 1)}
            </code>
          );
        }
        return part;
      });

      return (
        <p key={idx} style={{ margin: '4px 0', fontSize: '0.85rem', lineHeight: '1.4', color: 'var(--text-muted)' }}>
          {lineContent}
        </p>
      );
    }).filter(Boolean);
  };

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

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
      `}</style>

      {/* Floating Chat Button */}
      {!chatOpen && (
        <button
          onClick={() => {
            setChatOpen(true);
            if (messages.length === 0) {
              setMessages([
                { role: 'model', text: `Hi! I am your AI Copilot for "${currentIssue.title}". How can I help you implement or debug this issue?` }
              ]);
            }
          }}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            transition: 'transform 0.2s',
            WebkitTransition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Collapsible Chat Panel */}
      {chatOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          width: '380px',
          height: '520px',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(90deg, rgba(99,102,241,0.15) 0%, rgba(79,70,229,0.15) 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#818cf8" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>AI Issue Copilot</div>
                <div style={{ fontSize: '0.65rem', color: '#10b981' }}>Active mentor</div>
              </div>
            </div>
            <button 
              onClick={() => setChatOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  borderTopRightRadius: msg.role === 'user' ? '2px' : '12px',
                  borderTopLeftRadius: msg.role === 'user' ? '12px' : '2px',
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'rgba(255,255,255,0.03)',
                  border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.06)',
                  color: '#f8fafc',
                  wordBreak: 'break-word',
                  textAlign: 'left'
                }}>
                  {msg.role === 'user' ? (
                    <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.4' }}>{msg.text}</p>
                  ) : (
                    renderMessageContent(msg.text)
                  )}
                </div>
              </div>
            ))}
            
            {sendingChat && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span className="typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-muted)', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out' }} />
                  <span className="typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-muted)', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out 0.2s' }} />
                  <span className="typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-muted)', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out 0.4s' }} />
                </div>
              </div>
            )}
            
            {/* Suggestion Chips */}
            {messages.length === 1 && !sendingChat && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', textAlign: 'left' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suggested questions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {suggestionChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip.message)}
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(99,102,241,0.05)',
                        border: '1px solid rgba(99,102,241,0.15)',
                        borderRadius: '8px',
                        color: '#818cf8',
                        fontSize: '0.75rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(99,102,241,0.1)';
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(99,102,241,0.05)';
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)';
                      }}
                    >
                      {chip.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(7, 9, 14, 0.6)',
              display: 'flex',
              gap: '8px'
            }}
          >
            <input 
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask Copilot..."
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.8rem',
                color: '#ffffff',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || sendingChat}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: chatInput.trim() && !sendingChat ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                color: chatInput.trim() && !sendingChat ? '#ffffff' : 'var(--text-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: chatInput.trim() && !sendingChat ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
