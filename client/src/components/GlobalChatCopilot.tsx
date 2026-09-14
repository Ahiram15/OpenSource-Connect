import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, Send, X, Sparkles, Minimize2, Copy, Check } from 'lucide-react';
import { ChatMessage, sendIssueChatMessage } from '../services/api';

export default function GlobalChatCopilot(): React.ReactElement {
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [sendingChat, setSendingChat] = useState<boolean>(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Check if we are on an issue details page
  const isIssuePage = location.pathname.startsWith('/issues/') && location.pathname !== '/issues';
  const issueIdFromUrl = isIssuePage ? location.pathname.split('/issues/')[1] : 'general';

  // Initial welcome message on first open
  useEffect(() => {
    if (chatOpen && messages.length === 0) {
      if (isIssuePage) {
        setMessages([
          {
            role: 'model',
            text: '👋 Hi! I am your **AI Issue Copilot**. Ask me anything about locating the relevant files, debugging algorithms, setting up tests, or preparing your Pull Request.'
          }
        ]);
      } else {
        setMessages([
          {
            role: 'model',
            text: '👋 Hi! I am your **OpenSource Connect AI Copilot**. I can help you discover good first issues, navigate GitHub contribution workflows, or explain project architectures. What are you working on?'
          }
        ]);
      }
    }
  }, [chatOpen, isIssuePage, messages.length]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current && chatOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatOpen, sendingChat]);

  const getPredefinedClientResponse = (input: string, isIssue: boolean): string => {
    const q = input.trim().toLowerCase();

    // 1. Greetings (hi, hello, hey, hii, etc.)
    if (/^(hi+|hello|hey+|howdy|hola|greetings|yo|sup)(\s|$|[!?.])/i.test(q) || q === 'hi' || q === 'hii') {
      return `👋 **Hi there! How can I help you today?**

I am your **OpenSource Connect AI Copilot** (running in High-Availability Offline Mode). Here are some things you can ask me:

- 🔍 **"Find good first issues"**: Learn how to match beginner issues with your tech stack.
- 💻 **"Tech details"**: Learn about OpenSource Connect's tech stack, architecture, and APIs.
- 🌿 **"Git workflow"**: Get step-by-step commands to fork, clone, branch, commit, and push.
- 📝 **"PR description"**: Generate a maintainer-ready pull request template.
- 📊 **"Contribution tracker"**: Understand how PR status syncing and merge stats work.

What would you like assistance with?`;
    }

    // 2. Tech Details & Architecture
    if (
      q.includes('tech') ||
      q.includes('stack') ||
      q.includes('architecture') ||
      q.includes('technology') ||
      q.includes('technologies') ||
      q.includes('built with') ||
      q.includes('how it works') ||
      q.includes('details')
    ) {
      return `⚡ **OpenSource Connect — Technical Details & Architecture**

### 🖥️ Frontend Stack:
- **Core**: React 19 + TypeScript + Vite for ultra-fast performance.
- **Styling**: Vanilla CSS Design System with dark glassmorphic styling and Lucide icons.
- **Routing**: React Router DOM (v6/v7) with dedicated pages for Dashboard, Issue Discovery, Solution Lab, and Contribution Tracker.
- **Export & Storage**: Built-in PDF Portfolio exporter and local cache synchronization.

### ⚙️ Backend & AI Stack:
- **Server**: Node.js & Express.js with TypeScript.
- **AI Intelligence**: Google Gemini Generative AI with resilient multi-tier heuristic fallback.
- **GitHub Integration**: GitHub REST API v3 for real-time repository indexing, issue search, and PR state tracking.
- **Authentication**: JWT authentication with GitHub OAuth integration.

### 🎯 Core Features:
- **Intelligent Issue Matching**: Weighted 4-factor scoring algorithm.
- **Live Contribution Pipeline**: Real-time status sync (Saved ➔ Applied ➔ In Progress ➔ Merged).`;
    }

    // 3. Git and Pull Request Workflow
    if (q.includes('git') || q.includes('pr') || q.includes('pull request') || q.includes('workflow') || q.includes('fork') || q.includes('branch')) {
      return `🌿 **Standard Git Contribution Workflow:**

\`\`\`bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/repository-name.git
cd repository-name

# 2. Add upstream remote to stay updated
git remote add upstream https://github.com/ORIGINAL_OWNER/repository-name.git

# 3. Create a feature branch
git checkout -b fix/issue-name

# 4. Make changes, run tests
npm test

# 5. Commit with semantic message
git commit -m "fix: resolve bug description (#issueNumber)"

# 6. Push to your fork and create Pull Request on GitHub
git push origin fix/issue-name
\`\`\``;
    }

    // 4. PR Description & Review Template
    if (q.includes('template') || q.includes('description') || q.includes('draft')) {
      return `📝 **Maintainer-Approved PR Template:**

\`\`\`markdown
## 🎯 Description
Resolves #${isIssue ? 'issue' : '123'}. Briefly summarize the purpose of this PR and what bug or feature it addresses.

## 🛠️ Changes Made
- [x] Fixed root cause in target module
- [x] Added unit tests for edge cases
- [x] Verified full test suite passes

## 🧪 Testing Verification
- Ran \`npm test\` with 100% passing tests
- Manually tested UI / API behavior

## 📋 Checklist
- [x] Code follows repository coding style
- [x] Self-reviewed all diffs before submitting
\`\`\``;
    }

    // 5. How to find first issue / recommendations
    if (q.includes('first issue') || q.includes('beginner') || q.includes('find') || q.includes('recommend') || q.includes('start')) {
      return `🚀 **How to find your next open-source contribution:**

1. **Filter by Tech Stack**: Select languages you are already confident in (e.g., TypeScript, React, Python).
2. **Look for Labels**: Target \`good first issue\`, \`help wanted\`, or \`documentation\`.
3. **Check Activity**: Ensure the repo has commits or merged PRs in the last 14 days.
4. **Use OpenSource Connect Issue Feed**: Browse curated issues matched directly to your GitHub profile!`;
    }

    // 6. General Intelligent Fallback
    return `⚡ **Copilot Offline Assistant Response:**

I am currently running in offline fallback mode while the Gemini cloud endpoint is busy.

Here are quick recommendations for your query:
- **Tech Stack & Architecture**: OpenSource Connect is built with React 19, TypeScript, Vite, Node.js/Express, and Google Gemini.
- **Git & PR Workflows**: Use dedicated feature branches and semantic commits (\`fix: ...\`, \`feat: ...\`).
- **Issue Feed**: Head over to the **Issue Feed** in the navigation bar to find issues tailored to your skills.

Feel free to ask for specific Git commands, PR templates, or architecture details!`;
  };

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || chatInput;
    if (!textToSend.trim() || sendingChat) return;

    const userMsg: ChatMessage = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!customMessage) setChatInput('');
    setSendingChat(true);

    try {
      const response = await sendIssueChatMessage(
        issueIdFromUrl,
        isIssuePage ? `Issue Context (${issueIdFromUrl})` : 'General Open Source Assistance',
        isIssuePage ? 'Help the user with this issue' : 'General development assistance',
        messages,
        textToSend
      );

      const assistantMsg: ChatMessage = { role: 'model', text: response.reply };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.warn('Backend chat API unavailable, utilizing intelligent predefined response:', err);
      const fallbackText = getPredefinedClientResponse(textToSend, isIssuePage);
      const fallbackMsg: ChatMessage = {
        role: 'model',
        text: fallbackText
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setSendingChat(false);
    }
  };

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    let inCodeBlock = false;
    let codeContent: string[] = [];

    return lines.map((line, idx) => {
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          inCodeBlock = false;
          const code = codeContent.join('\n');
          codeContent = [];
          return (
            <div key={idx} style={{ position: 'relative', margin: '10px 0' }}>
              <button
                type="button"
                onClick={() => handleCopyCode(code, idx)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(255, 244, 183, 0.15)',
                  border: '1px solid rgba(255, 244, 183, 0.3)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  color: '#FFF4B7',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  zIndex: 2
                }}
              >
                {copiedIdx === idx ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                {copiedIdx === idx ? 'Copied' : 'Copy'}
              </button>
              <pre style={{
                background: '#010207',
                border: '1px solid rgba(0, 106, 103, 0.35)',
                borderRadius: '8px',
                padding: '12px 14px',
                fontSize: '0.78rem',
                fontFamily: 'JetBrains Mono, monospace',
                color: '#f8fafc',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                margin: 0
              }}>
                <code>{code}</code>
              </pre>
            </div>
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
          <li key={idx} style={{ marginLeft: '16px', fontSize: '0.84rem', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '3px' }}>
            {line.trim().substring(2)}
          </li>
        );
      }

      if (line.trim().startsWith('1. ') || line.trim().startsWith('2. ') || line.trim().startsWith('3. ')) {
        return (
          <div key={idx} style={{ fontSize: '0.84rem', color: '#f1f5f9', lineHeight: '1.5', marginBottom: '4px', fontWeight: 600 }}>
            {line.trim()}
          </div>
        );
      }

      return (
        <p key={idx} style={{ margin: '0 0 6px 0', fontSize: '0.84rem', lineHeight: '1.5', color: '#cbd5e1' }}>
          {line}
        </p>
      );
    });
  };

  const suggestionChips = isIssuePage
    ? [
        { text: '🧭 Where in codebase do I start?', message: 'Where should I look in the codebase to start fixing this issue, and what files are relevant?' },
        { text: '📝 Draft PR description for maintainers', message: 'Can you draft a clean, professional Pull Request title and description for this issue?' },
        { text: '📐 Explain architecture & design', message: 'Can you explain the high-level architecture and how this module works?' },
        { text: '🧪 How do I test & verify my fix?', message: 'What test commands or verification steps should I run to test this locally?' }
      ]
    : [
        { text: '🚀 Guide me through my first PR', message: 'Give me a step-by-step beginner guide to finding an issue, cloning a repo, creating a branch, and opening a PR.' },
        { text: '📝 How to write a great PR description?', message: 'What makes a maintainer-approved PR description and what checklist items should I always include?' },
        { text: '📊 How to use the Contribution Tracker?', message: 'How do I use OpenSource Connect to track my open source PR pipeline and build a proof-of-work portfolio?' },
        { text: '🌿 Git commands for fork & rebase', message: 'Show me the exact terminal commands to fork, clone, create a feature branch, and sync with upstream main.' }
      ];

  return (
    <>
      {/* ─── Circular Floating Chat Button (Right Down Corner) ───────────── */}
      {!chatOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <button
            onClick={() => setChatOpen(true)}
            aria-label="Open AI Copilot Chat"
            title="Open AI Copilot Chat (Ask anything)"
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #006A67 0%, #004d4a 100%)',
              boxShadow: '0 8px 32px rgba(0, 106, 103, 0.45), 0 0 20px rgba(255, 244, 183, 0.25)',
              border: '2px solid rgba(255, 244, 183, 0.7)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF4B7',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 106, 103, 0.65), 0 0 24px rgba(255, 244, 183, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 106, 103, 0.45), 0 0 20px rgba(255, 244, 183, 0.25)';
            }}
          >
            <MessageSquare size={26} color="#FFF4B7" />
            
            {/* Live pulsing online badge */}
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: '#34d399',
              border: '2.5px solid #004d4a',
              boxShadow: '0 0 8px #34d399'
            }} />
          </button>
        </div>
      )}

      {/* ─── Collapsible Chat Panel (Anchored in Right Down Corner) ───────── */}
      {chatOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          width: '390px',
          maxWidth: 'calc(100vw - 32px)',
          height: '540px',
          maxHeight: 'calc(100vh - 48px)',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '18px',
          border: '1px solid rgba(0, 106, 103, 0.45)',
          background: 'rgba(4, 8, 20, 0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.95), 0 0 25px rgba(0, 106, 103, 0.25)',
          overflow: 'hidden',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: 'rgba(2, 5, 14, 0.98)',
            borderBottom: '1px solid rgba(0, 106, 103, 0.35)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(0, 106, 103, 0.3)',
                border: '1px solid rgba(255, 244, 183, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={16} color="#FFF4B7" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'Sora, sans-serif' }}>
                  AI Issue Copilot
                </div>
                <div style={{ fontSize: '0.68rem', color: '#FFF4B7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                  {isIssuePage ? 'Issue Context Active' : 'Online Mentor'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setChatOpen(false)}
                title="Minimize Chat"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <Minimize2 size={15} />
              </button>
              <button
                onClick={() => setChatOpen(false)}
                title="Close Chat"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
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
                  maxWidth: '86%',
                  padding: '12px 16px',
                  borderRadius: '14px',
                  borderTopRightRadius: msg.role === 'user' ? '2px' : '14px',
                  borderTopLeftRadius: msg.role === 'user' ? '14px' : '2px',
                  background: msg.role === 'user'
                    ? '#FFF4B7'
                    : 'rgba(4, 8, 20, 0.92)',
                  border: msg.role === 'user'
                    ? '1px solid #FFF4B7'
                    : '1px solid rgba(0, 106, 103, 0.35)',
                  color: msg.role === 'user' ? '#02040a' : '#f8fafc',
                  wordBreak: 'break-word',
                  textAlign: 'left',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5)'
                }}>
                  {msg.role === 'user' ? (
                    <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.45', color: '#02040a', fontWeight: 600 }}>{msg.text}</p>
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
                  borderRadius: '14px',
                  background: 'rgba(4, 8, 20, 0.92)',
                  border: '1px solid rgba(0, 106, 103, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FFF4B7', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out' }} />
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FFF4B7', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out 0.2s' }} />
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FFF4B7', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out 0.4s' }} />
                </div>
              </div>
            )}

            {/* Quick Suggestion Chips */}
            {messages.length <= 1 && !sendingChat && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', textAlign: 'left' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#FFF4B7', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace' }}>
                  Suggested questions
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {suggestionChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip.message)}
                      style={{
                        padding: '9px 12px',
                        background: 'rgba(0, 106, 103, 0.2)',
                        border: '1px solid rgba(0, 106, 103, 0.45)',
                        borderRadius: '8px',
                        color: '#FFF4B7',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontFamily: 'Plus Jakarta Sans, sans-serif'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 106, 103, 0.4)';
                        e.currentTarget.style.borderColor = '#FFF4B7';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 106, 103, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(0, 106, 103, 0.45)';
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
              padding: '14px 16px',
              borderTop: '1px solid rgba(0, 106, 103, 0.35)',
              background: 'rgba(2, 5, 14, 0.98)',
              display: 'flex',
              gap: '8px'
            }}
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask Copilot anything..."
              style={{
                flex: 1,
                background: 'rgba(2, 5, 14, 0.9)',
                border: '1px solid rgba(0, 106, 103, 0.45)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.82rem',
                color: '#f8fafc',
                outline: 'none',
                transition: 'border-color 0.2s',
                fontFamily: 'Plus Jakarta Sans, sans-serif'
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#FFF4B7')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(0, 106, 103, 0.45)')}
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || sendingChat}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: chatInput.trim() && !sendingChat
                  ? '#FFF4B7'
                  : 'rgba(255, 255, 255, 0.04)',
                border: chatInput.trim() && !sendingChat
                  ? '1px solid #FFF4B7'
                  : '1px solid rgba(0, 106, 103, 0.25)',
                color: chatInput.trim() && !sendingChat ? '#02040a' : 'var(--text-dim)',
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
    </>
  );
}
