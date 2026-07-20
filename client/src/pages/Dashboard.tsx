import React, { useState, useEffect } from 'react';
import { fetchUserProfile, UserProfile } from '../services/api';
import { Code2, GitMerge, Bookmark, Award, Sparkles, Download, Flame, GitPullRequest, Star, Zap, ExternalLink, GitFork, Lock, CheckCircle2, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';

const vibrantGradients = [
  { text: '#818cf8', fill: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)', border: 'rgba(99, 102, 241, 0.4)', hex: '#6366f1' },
  { text: '#38bdf8', fill: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)', border: 'rgba(56, 189, 248, 0.4)', hex: '#38bdf8' },
  { text: '#34d399', fill: 'linear-gradient(90deg, #059669 0%, #34d399 100%)', border: 'rgba(52, 211, 153, 0.4)', hex: '#34d399' },
  { text: '#fbbf24', fill: 'linear-gradient(90deg, #d97706 0%, #fbbf24 100%)', border: 'rgba(251, 191, 36, 0.4)', hex: '#fbbf24' },
  { text: '#f472b6', fill: 'linear-gradient(90deg, #db2777 0%, #f472b6 100%)', border: 'rgba(244, 114, 182, 0.4)', hex: '#f472b6' },
  { text: '#a78bfa', fill: 'linear-gradient(90deg, #7c3aed 0%, #a78bfa 100%)', border: 'rgba(167, 139, 250, 0.4)', hex: '#a78bfa' }
];

const trendMap: Record<string, { value: string; up: boolean }> = {
  'TypeScript':  { value: '12%', up: true },
  'JavaScript':  { value: '3%',  up: false },
  'React':       { value: '5%',  up: true },
  'Node.js':     { value: '8%',  up: true },
  'Python':      { value: '2%',  up: true },
  'C++':         { value: '1%',  up: false },
  'Go':          { value: '7%',  up: true },
};

const recentActivity = [
  { project: 'Ahiram15/OpenSource-Connect', stack: ['TypeScript', 'React', 'Node.js'], status: 'Deployed',  updated: '10m ago'  },
  { project: 'facebook/react-router',       stack: ['TypeScript', 'React'],            status: 'Building',  updated: '2h ago'   },
  { project: 'nodejs/node',                 stack: ['C++', 'JavaScript'],              status: 'Deployed',  updated: '2d ago'   },
  { project: 'python/cpython',              stack: ['C', 'Python'],                    status: 'Deployed',  updated: '5d ago'   },
  { project: 'vercel/next.js',              stack: ['TypeScript', 'React'],            status: 'Building',  updated: '1h ago'   },
];

// ── Heatmap: 16 weeks × 7 days of simulated contribution intensity ──────────
const generateHeatmap = () => {
  const weeks: number[][] = [];
  for (let w = 0; w < 16; w++) {
    const days: number[] = [];
    for (let d = 0; d < 7; d++) {
      // Simulate realistic contribution density
      const base = Math.random();
      days.push(base < 0.35 ? 0 : base < 0.55 ? 1 : base < 0.75 ? 2 : base < 0.9 ? 3 : 4);
    }
    weeks.push(days);
  }
  return weeks;
};
const heatmapData = generateHeatmap();
const heatColor = (level: number) => {
  if (level === 0) return 'rgba(255,255,255,0.04)';
  if (level === 1) return 'rgba(99,102,241,0.25)';
  if (level === 2) return 'rgba(99,102,241,0.50)';
  if (level === 3) return 'rgba(99,102,241,0.75)';
  return '#818cf8';
};

// ── Radar chart data (skill domain scores) ───────────────────────────────────
const radarData = [
  { domain: 'Frontend',  score: 88 },
  { domain: 'Backend',   score: 72 },
  { domain: 'DevOps',    score: 45 },
  { domain: 'Testing',   score: 60 },
  { domain: 'Databases', score: 78 },
  { domain: 'Systems',   score: 38 },
];

// ── Recommended issues ───────────────────────────────────────────────────────
const recommendedIssues = [
  { repo: 'microsoft/TypeScript', title: 'Improve error messages for type mismatches in generics', labels: ['good first issue', 'help wanted'], difficulty: 'Intermediate', stars: '102k', match: 96 },
  { repo: 'vercel/swr',           title: 'Add support for conditional fetching with null key',       labels: ['enhancement'],                  difficulty: 'Beginner',     stars: '30k',  match: 91 },
  { repo: 'prisma/prisma',        title: 'Fix: nested relations not resolved in edge runtime',      labels: ['bug', 'good first issue'],        difficulty: 'Intermediate', stars: '41k',  match: 87 },
  { repo: 'trpc/trpc',            title: 'Document subscriptions with WebSocket adapter example',   labels: ['documentation'],                 difficulty: 'Beginner',     stars: '36k',  match: 83 },
];

// ── Top Repositories ─────────────────────────────────────────────────────────
const topRepos = [
  { name: 'OpenSource-Connect', desc: 'GitHub skill extractor & roadmap generator for devs', stars: 48,  forks: 12, lang: 'TypeScript', langColor: '#6366f1', updated: '2h ago'  },
  { name: 'react-hooks-toolkit', desc: 'Collection of production-ready custom React hooks',   stars: 312, forks: 67, lang: 'TypeScript', langColor: '#6366f1', updated: '3d ago'  },
  { name: 'api-rate-limiter',    desc: 'Express middleware for fine-grained rate limiting',    stars: 89,  forks: 21, lang: 'JavaScript', langColor: '#38bdf8', updated: '1w ago'  },
  { name: 'py-data-pipeline',   desc: 'ETL pipeline toolkit for data engineering workflows',  stars: 56,  forks: 14, lang: 'Python',     langColor: '#34d399', updated: '2w ago'  },
];

// ── Weekly commit frequency (Mon–Sun) ─────────────────────────────────────────
const commitFrequency = [
  { day: 'Mon', commits: 8  },
  { day: 'Tue', commits: 14 },
  { day: 'Wed', commits: 19 },
  { day: 'Thu', commits: 11 },
  { day: 'Fri', commits: 22 },
  { day: 'Sat', commits: 5  },
  { day: 'Sun', commits: 3  },
];

// ── Monthly language evolution (AreaChart) ───────────────────────────────────
const langEvolution = [
  { month: 'Feb', TypeScript: 30, JavaScript: 35, Python: 20, React: 15 },
  { month: 'Mar', TypeScript: 34, JavaScript: 32, Python: 18, React: 16 },
  { month: 'Apr', TypeScript: 37, JavaScript: 30, Python: 16, React: 17 },
  { month: 'May', TypeScript: 40, JavaScript: 27, Python: 14, React: 19 },
  { month: 'Jun', TypeScript: 44, JavaScript: 25, Python: 13, React: 18 },
  { month: 'Jul', TypeScript: 48, JavaScript: 22, Python: 12, React: 18 },
];

// ── Achievements ─────────────────────────────────────────────────────────────
const achievements = [
  { icon: '🚀', title: 'First PR Merged',     desc: 'Merged your inaugural pull request',          unlocked: true,  color: '#818cf8' },
  { icon: '🔥', title: '7-Day Streak',         desc: 'Contributed 7 days in a row',                 unlocked: true,  color: '#f87171' },
  { icon: '⭐', title: 'Repo Stargazer',       desc: 'Received 100+ stars on a single repo',        unlocked: true,  color: '#fbbf24' },
  { icon: '🐛', title: 'Bug Squasher',         desc: 'Closed 10 bug-labelled issues',               unlocked: true,  color: '#34d399' },
  { icon: '📖', title: 'Documentation Hero',   desc: 'Authored 5+ README or docs improvements',     unlocked: false, color: '#38bdf8' },
  { icon: '🌐', title: 'Multi-Language Dev',   desc: 'Committed in 4 or more languages',            unlocked: false, color: '#a78bfa' },
  { icon: '🤝', title: 'Community Builder',    desc: 'Reviewed 20 PRs from other contributors',     unlocked: false, color: '#f472b6' },
  { icon: '💯', title: '100 Commits',          desc: 'Reached 100 total commits across all repos',  unlocked: true,  color: '#34d399' },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(7, 9, 14, 0.95)',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        padding: '12px 16px',
        borderRadius: '10px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(12px)'
      }}>
        <p style={{ margin: 0, fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>{payload[0].name}</p>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#818cf8', fontWeight: 600 }}>
          {payload[0].value}% of codebase
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard(): React.ReactElement {
  const [profile, setProfile]       = useState<UserProfile | null>(null);
  const [mounted, setMounted]       = useState<boolean>(false);
  const [timeframe, setTimeframe]   = useState<string>('All Time');

  useEffect(() => {
    fetchUserProfile()
      .then((data) => setProfile(data))
      .catch((err) => console.error('Failed to load dashboard profile:', err));
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile || {}, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `profile_${profile?.username || 'dev'}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Simulated timeframe-based data adjustments
  const rawBreakdown = timeframe === 'Last 30 Days'
    ? { 'TypeScript': 52, 'JavaScript': 20, 'React': 18, 'Node.js': 6, 'Python': 4 }
    : (profile?.languageBreakdown || { 'TypeScript': 40, 'JavaScript': 25, 'React': 15, 'Node.js': 10, 'Python': 10 });

  const chartData = Object.keys(rawBreakdown).map((lang, idx) => ({
    language: lang,
    percentage: rawBreakdown[lang as keyof typeof rawBreakdown],
    theme: vibrantGradients[idx % vibrantGradients.length],
    trend: trendMap[lang] || { value: '0%', up: true }
  }));

  const pieData = chartData.map(item => ({
    name: item.language,
    value: item.percentage,
    fill: item.theme.hex
  }));

  const allExtractedInterests = profile?.technicalInterests || ['TypeScript', 'React', 'Node.js', 'Python', 'MongoDB', 'Express'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">

      {/* ─── Page Header: Title + Controls ─────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '4px' }} className="gradient-text">
            Developer Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.93rem', margin: 0 }}>
            Comprehensive analysis of skills and repository weights fetched from GitHub.
          </p>
        </div>

        {/* Right side: filter + export + avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Timeframe dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Range:</span>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f4f4f5',
                fontSize: '0.82rem',
                fontWeight: 600,
                padding: '7px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            >
              <option value="All Time">All Time</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            style={{
              background: '#ffffff',
              color: '#09090b',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 18px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.2s'
            }}
          >
            <Download size={14} />
            Export Profile
          </button>

          {/* Avatar chip */}
          {profile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <img src={profile.avatarUrl} alt={profile.username} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--primary)' }} />
              <div>
                <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.88rem' }}>{profile.username}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                  <Award size={12} color="#10b981" />
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>{profile.experienceLevel}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── KPI Summary Cards ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>

        <div className="glass-panel animate-fade-in delay-75" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Code2 size={24} color="#38bdf8" />
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Skills Extracted</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px', lineHeight: 1 }}>
              {allExtractedInterests.length}
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: '4px' }}>From GitHub repositories</p>
          </div>
        </div>

        <div className="glass-panel animate-fade-in delay-150" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <GitMerge size={24} color="#34d399" />
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Primary Language</span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px', lineHeight: 1 }}>
              {chartData[0]?.language || 'TypeScript'}
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: '4px' }}>Dominance: {chartData[0]?.percentage || 40}%</p>
          </div>
        </div>

        <div className="glass-panel animate-fade-in delay-225" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Bookmark size={24} color="#818cf8" />
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Saved Roadmaps</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px', lineHeight: 1 }}>
              {profile?.savedIssueIds.length || 0}
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: '4px' }}>Active bookmarks</p>
          </div>
        </div>
      </div>

      {/* ─── 2-Column: Pie Chart + Progress Bars with Velocity Indicators ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '28px' }}>

        {/* Left: Recharts Donut */}
        <div className="glass-panel animate-fade-in delay-300" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '380px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>📊 Interactive Distribution</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Visual language breakdown across your codebase
            </p>
          </div>
          <div style={{ flex: 1, minHeight: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={65} outerRadius={95}
                  paddingAngle={5} dataKey="value"
                  animationDuration={800} animationBegin={100}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.15))', outline: 'none' }} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Progress List with Velocity Trend Indicators */}
        <div className="glass-panel animate-fade-in delay-300" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>⚡ Language Proficiency</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Percentage weight distribution with recent velocity
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
            {chartData.map((item) => (
              <div
                key={item.language}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'border-color 0.2s ease, transform 0.2s ease'
                }}
                className="language-card-hover"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.93rem', fontWeight: 700, color: '#f8fafc' }}>
                      {item.language}
                    </span>
                    {/* Language type badge */}
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 700,
                      color: item.theme.text,
                      background: 'rgba(255,255,255,0.04)',
                      padding: '2px 8px', borderRadius: '8px',
                      border: `1px solid ${item.theme.border}`
                    }}>
                      Language
                    </span>
                    {/* Velocity trend indicator */}
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700,
                      fontFamily: 'monospace',
                      color: item.trend.up ? '#34d399' : '#f87171',
                      letterSpacing: '0.02em'
                    }}>
                      {item.trend.up ? '▲' : '▼'} {item.trend.value}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.93rem', fontWeight: 800, color: item.theme.text }}>
                    {item.percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <div style={{
                    width: mounted ? `${item.percentage}%` : '0%',
                    height: '100%',
                    background: item.theme.fill,
                    borderRadius: '4px',
                    transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Extracted Skills Badges ─────────────────────────────────────── */}
      <div className="glass-panel animate-fade-in delay-300" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <Sparkles size={18} color="#818cf8" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            🏷️ All Extracted Technical Skills & Repository Topics ({allExtractedInterests.length})
          </h3>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {allExtractedInterests.map((skill) => (
            <span
              key={skill}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.2)',
                color: '#a5b4fc',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              className="badge-tag-interactive"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Recent Activity Deployments (scroll-accessible, below fold) ─── */}
      <div className="glass-panel animate-fade-in delay-300" style={{ padding: '28px', overflowX: 'auto' }}>
        <div style={{ marginBottom: '22px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
            🚀 Recent Repository Activity
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Latest deployment status across tracked repositories
          </p>
        </div>

        <table style={{ width: '100%', minWidth: '560px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Project Name', 'Tech Stack', 'Status', 'Last Updated'].map((col, i) => (
                <th
                  key={col}
                  style={{
                    textAlign: i === 3 ? 'right' : 'left',
                    padding: '0 12px 12px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--text-dim)',
                    fontFamily: 'monospace'
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentActivity.map((row, rowIdx) => (
              <tr
                key={row.project}
                className="table-row-hover"
                style={{
                  borderBottom: rowIdx < recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.035)' : 'none',
                  transition: 'background 0.18s ease, transform 0.18s ease'
                }}
              >
                {/* Project name */}
                <td style={{ padding: '14px 12px', fontSize: '0.88rem', fontWeight: 600, color: '#f4f4f5' }}>
                  {row.project}
                </td>

                {/* Stack badges */}
                <td style={{ padding: '14px 12px' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {row.stack.map((tech) => (
                      <span
                        key={tech}
                        style={{
                          fontSize: '0.7rem',
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: 'var(--text-muted)',
                          transition: 'background 0.15s'
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Status pill */}
                <td style={{ padding: '14px 12px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.78rem',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: row.status === 'Deployed' ? '#34d399' : '#fbbf24'
                  }}>
                    <span
                      style={{
                        width: '7px', height: '7px',
                        borderRadius: '50%',
                        background: row.status === 'Deployed' ? '#34d399' : '#fbbf24',
                        display: 'inline-block',
                        animation: 'pulse-subtle 2s infinite ease-in-out'
                      }}
                    />
                    {row.status}
                  </span>
                </td>

                {/* Last updated */}
                <td style={{ padding: '14px 12px', textAlign: 'right', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-dim)' }}>
                   {row.updated}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── Open Source Impact Scores ───────────────────────────────── */}
      <div className="glass-panel animate-fade-in delay-300" style={{ padding: '28px' }}>
        <div style={{ marginBottom: '22px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
            🏆 Open Source Impact Score
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Your aggregated contribution footprint across the ecosystem</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
          {[
            { icon: <GitPullRequest size={20} color="#818cf8" />, label: 'PRs Merged',      value: '24',  sub: 'this year',      bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.25)' },
            { icon: <Star size={20} color="#fbbf24" />,          label: 'Stars Earned',    value: '312', sub: 'across repos',   bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)' },
            { icon: <Flame size={20} color="#f87171" />,          label: 'Day Streak',     value: '14',  sub: 'current streak', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
            { icon: <Zap size={20} color="#34d399" />,             label: 'Issues Closed',  value: '58',  sub: 'total',          bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: item.bg,
                border: `1px solid ${item.border}`,
                borderRadius: '12px',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              className="language-card-hover"
            >
              {item.icon}
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>{item.value}</div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Contribution Heatmap + Skill Radar (side-by-side) ────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>

        {/* Contribution Heatmap */}
        <div className="glass-panel animate-fade-in delay-300" style={{ padding: '28px' }}>
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
              🟪 Contribution Heatmap
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Last 16 weeks of activity</p>
          </div>

          {/* Grid of week columns */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
            {heatmapData.map((week, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {week.map((level, di) => (
                  <div
                    key={di}
                    title={`${level} contribution${level !== 1 ? 's' : ''}`}
                    style={{
                      width: '14px', height: '14px',
                      borderRadius: '3px',
                      background: heatColor(level),
                      border: '1px solid rgba(255,255,255,0.04)',
                      transition: 'transform 0.15s',
                      cursor: 'default'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.4)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>Less</span>
            {[0,1,2,3,4].map((l) => (
              <div key={l} style={{ width: '12px', height: '12px', borderRadius: '2px', background: heatColor(l), border: '1px solid rgba(255,255,255,0.04)' }} />
            ))}
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>More</span>
          </div>
        </div>

        {/* Skill Domain Radar Chart */}
        <div className="glass-panel animate-fade-in delay-300" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>🕸️ Skill Domain Radar</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Proficiency across technical domains</p>
          </div>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={90}>
                <PolarGrid stroke="rgba(255,255,255,0.07)" />
                <PolarAngleAxis
                  dataKey="domain"
                  tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'monospace', fontWeight: 600 }}
                />
                <Radar
                  name="Skill"
                  dataKey="score"
                  stroke="#6366f1"
                  fill="rgba(99,102,241,0.25)"
                  fillOpacity={1}
                  dot={{ r: 4, fill: '#818cf8', strokeWidth: 0 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── Personalised Recommended Issues ────────────────────────────── */}
      <div className="glass-panel animate-fade-in delay-300" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
              🎯 Recommended Issues for You
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Curated based on your skill profile — sorted by match score</p>
          </div>
          <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 600, color: '#818cf8', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', padding: '4px 12px', borderRadius: '20px' }}>
            AI-matched
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {recommendedIssues.map((issue) => (
            <div
              key={issue.title}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '18px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '16px',
                transition: 'border-color 0.2s ease, transform 0.2s ease',
                flexWrap: 'wrap'
              }}
              className="language-card-hover"
            >
              <div style={{ flex: 1, minWidth: '220px' }}>
                {/* Repo + external link */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-dim)', fontWeight: 600 }}>
                    {issue.repo}
                  </span>
                  <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-dim)' }}>⭐ {issue.stars}</span>
                </div>

                {/* Issue title */}
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f4f4f5', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                  {issue.title}
                </p>

                {/* Labels + difficulty */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {issue.labels.map((lbl) => (
                    <span key={lbl} style={{
                      fontSize: '0.68rem', fontWeight: 700, fontFamily: 'monospace',
                      padding: '2px 9px', borderRadius: '20px',
                      background: lbl === 'bug' ? 'rgba(248,113,113,0.12)' : 'rgba(52,211,153,0.1)',
                      border: lbl === 'bug' ? '1px solid rgba(248,113,113,0.3)' : '1px solid rgba(52,211,153,0.25)',
                      color: lbl === 'bug' ? '#f87171' : '#34d399'
                    }}>{lbl}</span>
                  ))}
                  <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-dim)', marginLeft: '2px' }}>
                    · {issue.difficulty}
                  </span>
                </div>
              </div>

              {/* Match score + CTA */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', flexShrink: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#818cf8', lineHeight: 1 }}>{issue.match}%</span>
                  <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--text-dim)', marginTop: '2px' }}>match</span>
                </div>
                <button style={{
                  background: 'rgba(99,102,241,0.12)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  color: '#818cf8',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.2s'
                }}>
                  View Issue
                  <ExternalLink size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Top Repositories ──────────────────────────────────────────── */}
      <div className="glass-panel animate-fade-in delay-300" style={{ padding: '28px' }}>
        <div style={{ marginBottom: '22px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
            📁 Your Top Repositories
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Ranked by stars — your most impactful public projects</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {topRepos.map((repo, idx) => (
            <div
              key={repo.name}
              className="language-card-hover"
              style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px', padding: '16px 20px',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                flexWrap: 'wrap'
              }}
            >
              {/* Rank */}
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-dim)', fontWeight: 700, minWidth: '20px' }}>#{idx + 1}</span>

              {/* Info */}
              <div style={{ flex: 1, minWidth: '180px' }}>
                <div style={{ fontWeight: 700, color: '#f4f4f5', fontSize: '0.93rem', marginBottom: '3px' }}>{repo.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{repo.desc}</div>
              </div>

              {/* Language badge */}
              <span style={{ fontSize: '0.72rem', fontWeight: 700, fontFamily: 'monospace', color: repo.langColor, background: 'rgba(255,255,255,0.04)', border: `1px solid ${repo.langColor}44`, padding: '3px 10px', borderRadius: '8px' }}>
                {repo.lang}
              </span>

              {/* Stars */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', color: '#fbbf24', fontWeight: 700 }}>
                <Star size={13} />
                {repo.stars}
              </div>

              {/* Forks */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                <GitFork size={13} />
                {repo.forks}
              </div>

              {/* Last updated */}
              <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-dim)' }}>{repo.updated}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Commit Frequency + Language Evolution (side-by-side charts) ─ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>

        {/* Bar: commits per weekday */}
        <div className="glass-panel animate-fade-in delay-300" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>📅 Weekly Commit Rhythm</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Which days you ship the most code</p>
          </div>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={commitFrequency} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  cursor={{ fill: 'rgba(99,102,241,0.06)' }}
                  contentStyle={{ background: 'rgba(7,9,14,0.95)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', fontSize: '0.82rem', color: '#f8fafc' }}
                  formatter={(val: any) => [`${val} commits`, '']}
                />
                <Bar dataKey="commits" radius={[4, 4, 0, 0]} fill="url(#barGrad)" />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area: language share over 6 months */}
        <div className="glass-panel animate-fade-in delay-300" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
              <TrendingUp size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', color: '#34d399' }} />
              Language Evolution
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>How your stack share shifted over 6 months</p>
          </div>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={langEvolution}>
                <defs>
                  <linearGradient id="tsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="jsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={{ background: 'rgba(7,9,14,0.95)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', fontSize: '0.8rem', color: '#f8fafc' }} />
                <Area type="monotone" dataKey="TypeScript" stroke="#6366f1" strokeWidth={2} fill="url(#tsGrad)" dot={false} />
                <Area type="monotone" dataKey="JavaScript" stroke="#38bdf8" strokeWidth={2} fill="url(#jsGrad)" dot={false} />
                <Area type="monotone" dataKey="Python"     stroke="#34d399" strokeWidth={2} fill="url(#pyGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {[['TypeScript','#6366f1'],['JavaScript','#38bdf8'],['Python','#34d399']].map(([lang,col]) => (
              <div key={lang} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: col }} />
                <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-dim)', fontWeight: 600 }}>{lang}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Achievement Badges ─────────────────────────────────────────── */}
      <div className="glass-panel animate-fade-in delay-300" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
              🏅 Achievements
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Milestones earned from your open-source journey</p>
          </div>
          <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 600, color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', padding: '4px 12px', borderRadius: '20px' }}>
            {achievements.filter(a => a.unlocked).length} / {achievements.length} Unlocked
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
          {achievements.map((ach) => (
            <div
              key={ach.title}
              className="language-card-hover"
              style={{
                display: 'flex', gap: '14px', alignItems: 'flex-start',
                background: ach.unlocked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.015)',
                border: ach.unlocked ? `1px solid ${ach.color}33` : '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px', padding: '16px',
                opacity: ach.unlocked ? 1 : 0.5,
                transition: 'transform 0.2s ease, border-color 0.2s ease'
              }}
            >
              {/* Icon in circle */}
              <div style={{
                width: '42px', height: '42px', borderRadius: '10px', flexShrink: 0,
                background: ach.unlocked ? `${ach.color}18` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${ach.unlocked ? ach.color + '44' : 'rgba(255,255,255,0.06)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem',
                filter: ach.unlocked ? 'none' : 'grayscale(1)'
              }}>
                {ach.unlocked ? ach.icon : <Lock size={15} color="#52525b" />}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: ach.unlocked ? '#f4f4f5' : '#52525b' }}>{ach.title}</span>
                  {ach.unlocked && <CheckCircle2 size={13} color="#34d399" />}
                </div>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', margin: 0, lineHeight: 1.4 }}>{ach.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
