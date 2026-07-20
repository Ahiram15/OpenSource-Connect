import React from 'react';

const GithubIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function Login() {
  const handleGithubLogin = () => {
    // Redirect or trigger GitHub OAuth
    window.location.href = '/dashboard';
  };

  return (
    <div style={{ maxWidth: '800px', margin: '80px auto 0 auto', textAlign: 'center' }}>
      <div className="glass-panel" style={{ padding: '48px 32px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '16px' }} className="gradient-text">
          OpenSource Connect
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 36px auto' }}>
          Connect your GitHub account to get personalized open-source issue recommendations and step-by-step learning roadmaps.
        </p>

        <button 
          onClick={handleGithubLogin} 
          className="btn-primary" 
          style={{ padding: '14px 32px', fontSize: '1.05rem', borderRadius: '10px' }}
        >
          <GithubIcon size={22} />
          Log in with GitHub
        </button>
      </div>
    </div>
  );
}
