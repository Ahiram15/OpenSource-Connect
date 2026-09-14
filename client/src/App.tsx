import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, LayoutDashboard, Compass, User, LogOut, LogIn, GitPullRequest, Film, Mail, Send, X, Check, MessageSquare } from 'lucide-react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import IssueList from './pages/IssueList';
import IssueDetail from './pages/IssueDetail';
import Profile from './pages/Profile';
import ContributionTracker from './pages/ContributionTracker';
import GitCinema from './pages/GitCinema';
import GlobalChatCopilot from './components/GlobalChatCopilot';
import { getAuthToken, setAuthToken, logout, isAuthenticated, getAuthUrl, sendFeedbackApi } from './services/api';

const GithubIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

function HeaderContent({ loggedIn, setLoggedIn }: { loggedIn: boolean; setLoggedIn: (val: boolean) => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check URL parameters for OAuth token return
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      setAuthToken(token);
      setLoggedIn(true);
      // Clean query string from browser URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } else {
      setLoggedIn(isAuthenticated());
    }
  }, [location, setLoggedIn]);

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    navigate('/');
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(2, 5, 14, 0.88)',
      backdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: '1px solid rgba(0, 106, 103, 0.28)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.7)',
      padding: '0 32px',
      height: '72px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Logo */}
      <NavLink to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'rgba(0, 106, 103, 0.25)',
          border: '1px solid rgba(255, 244, 183, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(0, 106, 103, 0.35)'
        }}>
          <Sparkles size={20} color="#FFF4B7" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '1.28rem', fontWeight: 800, letterSpacing: '-0.04em', fontFamily: 'Sora, Outfit, sans-serif' }} className="gradient-text">
            OpenSource Connect
          </span>
          <span style={{ fontSize: '0.64rem', color: '#FFF4B7', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginTop: '-2px', fontFamily: 'JetBrains Mono, monospace' }}>
            AI Dev Intelligence
          </span>
        </div>
      </NavLink>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <NavLink
          to="/dashboard"
          className={({ isActive }: { isActive: boolean }) => isActive ? "nav-link active" : "nav-link"}
        >
          <LayoutDashboard size={17} />
          Dashboard
        </NavLink>

        <NavLink
          to="/issues"
          className={({ isActive }: { isActive: boolean }) => isActive ? "nav-link active" : "nav-link"}
        >
          <Compass size={17} />
          Issue Feed
        </NavLink>

        <NavLink
          to="/tracker"
          className={({ isActive }: { isActive: boolean }) => isActive ? "nav-link active" : "nav-link"}
        >
          <GitPullRequest size={17} />
          Tracker
        </NavLink>

        <NavLink
          to="/cinema"
          className={({ isActive }: { isActive: boolean }) => isActive ? "nav-link active" : "nav-link"}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Film size={17} color="#FFF4B7" />
          Git Cinema
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }: { isActive: boolean }) => isActive ? "nav-link active" : "nav-link"}
        >
          <User size={17} />
          Profile
        </NavLink>
      </nav>

      {/* User Auth CTA / Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {loggedIn ? (
          <>
            <NavLink to="/profile" className="btn-secondary" style={{ textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              <GithubIcon size={16} />
              Connected
            </NavLink>

            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.83rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              title="Log out of OpenSource Connect"
            >
              <LogOut size={15} />
              Log Out
            </button>
          </>
        ) : (
          <a
            href={getAuthUrl()}
            className="btn-primary"
            style={{ textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
          >
            <GithubIcon size={16} />
            Log In with GitHub
          </a>
        )}
      </div>
    </header>
  );
}

function AppBody({ loggedIn, setLoggedIn }: { loggedIn: boolean; setLoggedIn: (val: boolean) => void }) {
  const location = useLocation();
  const isCinema = location.pathname === '/cinema';

  // Contact & Feedback Modal State
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [feedbackName, setFeedbackName] = useState<string>('');
  const [feedbackEmail, setFeedbackEmail] = useState<string>('');
  const [feedbackSubject, setFeedbackSubject] = useState<string>('Feedback / Feature Request');
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');
  const [sendingFeedback, setSendingFeedback] = useState<boolean>(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackEmail || !feedbackMsg) {
      setFeedbackError('Please provide your email and message.');
      return;
    }
    setSendingFeedback(true);
    setFeedbackError(null);
    try {
      await sendFeedbackApi({
        name: feedbackName || 'Anonymous Dev',
        email: feedbackEmail,
        subject: feedbackSubject,
        message: feedbackMsg
      });
      setFeedbackSuccess(true);
      setTimeout(() => {
        setFeedbackSuccess(false);
        setShowFeedbackModal(false);
        setFeedbackMsg('');
      }, 2500);
    } catch (err: any) {
      setFeedbackError(err.response?.data?.error || err.message || 'Failed to send feedback.');
    } finally {
      setSendingFeedback(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: isCinema ? 'hidden' : 'visible' }}>
      <HeaderContent loggedIn={loggedIn} setLoggedIn={setLoggedIn} />

      {/* Page Content */}
      <main style={{
        flex: 1,
        padding: isCinema ? 0 : '32px 32px 48px 32px',
        maxWidth: isCinema ? '100%' : '1280px',
        margin: '0 auto',
        width: '100%',
        height: isCinema ? 'calc(100vh - 72px)' : 'auto',
        overflow: isCinema ? 'hidden' : 'visible',
        position: 'relative'
      }}>
        <Routes>
          <Route path="/" element={<Login loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
          <Route path="/login" element={<Login loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/issues" element={<IssueList />} />
          <Route path="/issues/:id" element={<IssueDetail />} />
          <Route path="/tracker" element={<ContributionTracker />} />
          <Route path="/status" element={<ContributionTracker />} />
          <Route path="/cinema" element={<GitCinema />} />
          <Route path="/profile" element={<Profile setLoggedIn={setLoggedIn} />} />
        </Routes>
      </main>

      {/* Global Footer (hidden on cinema for full-screen immersive view) */}
      {!isCinema && (
        <footer style={{
          borderTop: '1px solid rgba(0, 106, 103, 0.28)',
          background: 'rgba(2, 5, 14, 0.95)',
          backdropFilter: 'blur(16px)',
          padding: '24px 32px',
          marginTop: 'auto'
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'rgba(0, 106, 103, 0.3)', border: '1px solid rgba(255, 244, 183, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={14} color="#FFF4B7" />
              </div>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'Sora, sans-serif' }}>OpenSource Connect</span>
              <span style={{ fontSize: '0.72rem', color: '#FFF4B7', fontFamily: 'JetBrains Mono, monospace', background: 'rgba(0, 106, 103, 0.25)', border: '1px solid rgba(0, 106, 103, 0.4)', padding: '2px 8px', borderRadius: '12px' }}>v2.0</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.8rem', color: 'var(--text-dim)', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowFeedbackModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFF4B7',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  transition: 'background 0.2s'
                }}
              >
                <Mail size={14} color="#FFF4B7" />
                Contact &amp; Support
              </button>

              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', display: 'inline-block' }} />
                GitHub API Status: Operational
              </span>
            </div>
          </div>
        </footer>
      )}

      {/* Contact & Feedback Modal */}
      {showFeedbackModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowFeedbackModal(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #0b1528 0%, #020617 100%)',
            border: '1px solid rgba(0, 106, 103, 0.5)',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowFeedbackModal(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                color: '#cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0, 106, 103, 0.3)', border: '1px solid rgba(255, 244, 183, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={18} color="#FFF4B7" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>Contact &amp; Support</h3>
                <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '2px 0 0 0' }}>Send feedback, feature requests, or report an issue</p>
              </div>
            </div>

            {feedbackSuccess ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(52, 211, 153, 0.35)',
                color: '#34d399',
                padding: '20px',
                borderRadius: '10px',
                textAlign: 'center',
                fontSize: '0.9rem',
                fontWeight: 600
              }}>
                <Check size={24} style={{ margin: '0 auto 8px auto', display: 'block' }} />
                Your message has been sent to OpenSource Connect! Thank you for your feedback.
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Your Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Rivera"
                    value={feedbackName}
                    onChange={(e) => setFeedbackName(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.35)', color: '#ffffff', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Your Email (required)</label>
                  <input
                    type="email"
                    required
                    placeholder="developer@gmail.com"
                    value={feedbackEmail}
                    onChange={(e) => setFeedbackEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.35)', color: '#ffffff', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Subject</label>
                  <input
                    type="text"
                    value={feedbackSubject}
                    onChange={(e) => setFeedbackSubject(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.35)', color: '#ffffff', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Message (required)</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your suggestion, feedback, or issue..."
                    value={feedbackMsg}
                    onChange={(e) => setFeedbackMsg(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.35)', color: '#ffffff', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                  />
                </div>

                {feedbackError && (
                  <div style={{ color: '#f87171', fontSize: '0.78rem' }}>{feedbackError}</div>
                )}

                <button
                  type="submit"
                  disabled={sendingFeedback}
                  className="btn-primary"
                  style={{
                    padding: '12px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    cursor: sendingFeedback ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '6px'
                  }}
                >
                  <Send size={15} />
                  {sendingFeedback ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Global AI Copilot Chat */}
      <GlobalChatCopilot />
    </div>
  );
}

export default function App(): React.ReactElement {
  const [loggedIn, setLoggedIn] = useState<boolean>(isAuthenticated());

  return (
    <Router>
      <AppBody loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
    </Router>
  );
}
