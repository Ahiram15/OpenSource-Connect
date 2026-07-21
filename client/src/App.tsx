import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, LayoutDashboard, Compass, User, LogOut, LogIn } from 'lucide-react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import IssueList from './pages/IssueList';
import IssueDetail from './pages/IssueDetail';
import Profile from './pages/Profile';
import { getAuthToken, setAuthToken, logout, isAuthenticated } from './services/api';

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
      background: 'rgba(7, 9, 14, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--glass-border)',
      padding: '0 32px',
      height: '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Logo */}
      <NavLink to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px var(--primary-glow)'
        }}>
          <Sparkles size={20} color="#ffffff" />
        </div>
        <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }} className="gradient-text">
          OpenSource Connect
        </span>
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
            href="http://localhost:5000/api/auth/github"
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

export default function App(): React.ReactElement {
  const [loggedIn, setLoggedIn] = useState<boolean>(isAuthenticated());

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <HeaderContent loggedIn={loggedIn} setLoggedIn={setLoggedIn} />

        {/* Page Content */}
        <main style={{ flex: 1, padding: '32px 32px 48px 32px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
          <Routes>
            <Route path="/" element={<Login loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/issues" element={<IssueList />} />
            <Route path="/issues/:id" element={<IssueDetail />} />
            <Route path="/profile" element={<Profile setLoggedIn={setLoggedIn} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
