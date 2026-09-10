import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile, UserProfile, fetchUserReposFromGitHub, GitHubRepo } from '../services/api';
import { Code2, GitMerge, Bookmark, Award, Sparkles, Download, Flame, GitPullRequest, Star, Zap, ExternalLink, GitFork, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const vibrantGradients = [
  { text: '#F9F7F7', fill: 'linear-gradient(90deg, #3F72AF 0%, #DBE2EF 100%)', border: 'rgba(219, 226, 239, 0.4)', hex: '#3F72AF' },
  { text: '#DBE2EF', fill: 'linear-gradient(90deg, #112D4E 0%, #3F72AF 100%)', border: 'rgba(63, 114, 175, 0.4)', hex: '#DBE2EF' },
  { text: '#60a5fa', fill: 'linear-gradient(90deg, #1e40af 0%, #60a5fa 100%)', border: 'rgba(96, 165, 250, 0.4)', hex: '#60a5fa' },
  { text: '#fbbf24', fill: 'linear-gradient(90deg, #d97706 0%, #fbbf24 100%)', border: 'rgba(251, 191, 36, 0.4)', hex: '#fbbf24' },
  { text: '#f472b6', fill: 'linear-gradient(90deg, #db2777 0%, #f472b6 100%)', border: 'rgba(244, 114, 182, 0.4)', hex: '#f472b6' },
  { text: '#a78bfa', fill: 'linear-gradient(90deg, #7c3aed 0%, #a78bfa 100%)', border: 'rgba(167, 139, 250, 0.4)', hex: '#a78bfa' }
];

const trendMap: Record<string, { value: string; up: boolean }> = {
  'TypeScript': { value: '12%', up: true },
  'JavaScript': { value: '3%', up: false },
  'React': { value: '5%', up: true },
  'Node.js': { value: '8%', up: true },
  'Python': { value: '2%', up: true },
  'C++': { value: '1%', up: false },
  'Go': { value: '7%', up: true },
};

const recentActivity = [
  { project: 'Ahiram15/OpenSource-Connect', stack: ['TypeScript', 'React', 'Node.js'], status: 'Deployed', updated: '10m ago' },
  { project: 'facebook/react-router', stack: ['TypeScript', 'React'], status: 'Building', updated: '2h ago' },
  { project: 'nodejs/node', stack: ['C++', 'JavaScript'], status: 'Deployed', updated: '2d ago' },
  { project: 'python/cpython', stack: ['C', 'Python'], status: 'Deployed', updated: '5d ago' },
  { project: 'vercel/next.js', stack: ['TypeScript', 'React'], status: 'Building', updated: '1h ago' },
];

const generateHeatmap = () => {
  const weeks: number[][] = [];
  for (let w = 0; w < 20; w++) {
    const days: number[] = [];
    for (let d = 0; d < 7; d++) {
      const base = Math.random();
      days.push(base < 0.30 ? 0 : base < 0.55 ? 1 : base < 0.75 ? 2 : base < 0.9 ? 3 : 4);
    }
    weeks.push(days);
  }
  return weeks;
};
const heatmapData = generateHeatmap();

const heatColor = (level: number) => {
  if (level === 0) return 'rgba(0, 106, 103, 0.12)';
  if (level === 1) return 'rgba(0, 106, 103, 0.45)';
  if (level === 2) return '#006A67';
  if (level === 3) return '#2dd4bf';
  return '#FFF4B7';
};

const topRepos = [
  { name: 'OpenSource-Connect', desc: 'GitHub skill extractor & roadmap generator for devs', stars: 48, forks: 12, lang: 'TypeScript', langColor: '#FFF4B7', updated: '2h ago' },
  { name: 'react-hooks-toolkit', desc: 'Collection of production-ready custom React hooks', stars: 312, forks: 67, lang: 'TypeScript', langColor: '#FFF4B7', updated: '3d ago' },
  { name: 'api-rate-limiter', desc: 'Express middleware for fine-grained rate limiting', stars: 89, forks: 21, lang: 'JavaScript', langColor: '#38bdf8', updated: '1w ago' },
  { name: 'py-data-pipeline', desc: 'ETL pipeline toolkit for data engineering workflows', stars: 56, forks: 14, lang: 'Python', langColor: '#34d399', updated: '2w ago' },
];

const achievements = [
  { icon: '🚀', title: 'First PR Merged', desc: 'Merged your inaugural pull request', unlocked: true, color: '#FFF4B7' },
  { icon: '🔥', title: '7-Day Streak', desc: 'Contributed 7 days in a row', unlocked: true, color: '#f87171' },
  { icon: '⭐', title: 'Repo Stargazer', desc: 'Received 100+ stars on a single repo', unlocked: true, color: '#fbbf24' },
  { icon: '🐛', title: 'Bug Squasher', desc: 'Closed 10 bug-labelled issues', unlocked: true, color: '#34d399' },
  { icon: '📖', title: 'Documentation Hero', desc: 'Authored 5+ README or docs improvements', unlocked: false, color: '#38bdf8' },
  { icon: '🌐', title: 'Multi-Language Dev', desc: 'Committed in 4 or more languages', unlocked: false, color: '#a78bfa' },
  { icon: '🤝', title: 'Community Builder', desc: 'Reviewed 20 PRs from other contributors', unlocked: false, color: '#f472b6' },
  { icon: '💯', title: '100 Commits', desc: 'Reached 100 total commits across all repos', unlocked: true, color: '#34d399' },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(2, 5, 14, 0.96)',
        border: '1px solid rgba(0, 106, 103, 0.5)',
        padding: '10px 14px',
        borderRadius: '10px',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.85)',
        fontFamily: 'Plus Jakarta Sans, sans-serif'
      }}>
        <p style={{ margin: 0, fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem', fontFamily: 'Sora, sans-serif' }}>{payload[0].name}</p>
        <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600 }}>
          {payload[0].value}% of codebase
        </p>
      </div>
    );
  }
  return null;
};

const getRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (isNaN(date.getTime())) return 'unknown';
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export default function Dashboard(): React.ReactElement {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [mounted, setMounted] = useState<boolean>(false);
  const [timeframe, setTimeframe] = useState<string>('All Time');

  useEffect(() => {
    fetchUserProfile()
      .then((data) => {
        setProfile(data);
        if (data.username) {
          fetchUserReposFromGitHub(data.username)
            .then((reposData) => {
              if (Array.isArray(reposData)) {
                setRepos(reposData);
              }
            })
            .catch((err) => console.error('Failed to fetch GitHub repos:', err));
        }
      })
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

  const rawBreakdown = timeframe === 'Last 30 Days'
    ? { 'TypeScript': 52, 'JavaScript': 20, 'React': 18, 'Node.js': 6, 'Python': 4 }
    : (profile?.languageBreakdown && Object.keys(profile.languageBreakdown).length > 0
      ? profile.languageBreakdown
      : { 'TypeScript': 40, 'JavaScript': 25, 'React': 15, 'Node.js': 10, 'Python': 10 });

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
  const totalStars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
  const REPO_BENCHMARK = 3;
  const isBelowBenchmark = repos.length < REPO_BENCHMARK;

  const displayRecentActivity = !isBelowBenchmark
    ? repos
      .slice()
      .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
      .slice(0, 5)
      .map((r) => ({
        project: `${profile?.username}/${r.name}`,
        stack: [r.language || 'JavaScript', ...(r.topics || []).slice(0, 2)],
        status: 'Active',
        updated: getRelativeTime(r.pushed_at)
      }))
    : recentActivity;

  const impactStats = (profile && !isBelowBenchmark)
    ? [
      { icon: <GitPullRequest size={20} color="#F9F7F7" />, label: 'Public Repos', value: String(profile.publicRepos), sub: 'created', bg: 'rgba(17, 45, 78, 0.75)', border: 'rgba(63, 114, 175, 0.4)' },
      { icon: <Star size={20} color="#fbbf24" />, label: 'Stars Earned', value: String(totalStars), sub: 'across repos', bg: 'rgba(17, 45, 78, 0.75)', border: 'rgba(63, 114, 175, 0.4)' },
      { icon: <Flame size={20} color="#f87171" />, label: 'Followers', value: String(profile.followers), sub: 'on GitHub', bg: 'rgba(17, 45, 78, 0.75)', border: 'rgba(63, 114, 175, 0.4)' },
      { icon: <Zap size={20} color="#34d399" />, label: 'Following', value: String(profile.following), sub: 'developers', bg: 'rgba(17, 45, 78, 0.75)', border: 'rgba(63, 114, 175, 0.4)' },
    ]
    : [
      { icon: <GitPullRequest size={20} color="#F9F7F7" />, label: 'PRs Merged', value: '24', sub: 'this year', bg: 'rgba(17, 45, 78, 0.75)', border: 'rgba(63, 114, 175, 0.4)' },
      { icon: <Star size={20} color="#fbbf24" />, label: 'Stars Earned', value: '312', sub: 'across repos', bg: 'rgba(17, 45, 78, 0.75)', border: 'rgba(63, 114, 175, 0.4)' },
      { icon: <Flame size={20} color="#f87171" />, label: 'Day Streak', value: '14', sub: 'current streak', bg: 'rgba(17, 45, 78, 0.75)', border: 'rgba(63, 114, 175, 0.4)' },
      { icon: <Zap size={20} color="#34d399" />, label: 'Issues Closed', value: '58', sub: 'total', bg: 'rgba(17, 45, 78, 0.75)', border: 'rgba(63, 114, 175, 0.4)' },
    ];

  const displayTopRepos = !isBelowBenchmark
    ? repos
      .slice()
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 4)
      .map((r) => ({
        name: r.name,
        desc: r.description || 'No description provided.',
        stars: r.stargazers_count,
        forks: r.forks_count,
        lang: r.language || 'HTML/CSS',
        langColor: vibrantGradients[Math.abs(r.name.length) % vibrantGradients.length].hex,
        updated: getRelativeTime(r.pushed_at),
        url: r.html_url
      }))
    : topRepos;

  const hasRepos = profile ? (profile.publicRepos ?? 0) > 0 : false;
  const hasStars = totalStars > 0;
  const isMultiLang = profile ? Object.keys(profile.languageBreakdown || {}).length >= 4 : false;
  const hasFollowers = profile ? (profile.followers ?? 0) >= 5 : false;

  const displayAchievements = !isBelowBenchmark
    ? [
      { icon: '🚀', title: 'First PR Merged', desc: 'Merged your inaugural pull request', unlocked: hasRepos, color: '#FFF4B7' },
      { icon: '🔥', title: '7-Day Streak', desc: 'Contributed 7 days in a row', unlocked: true, color: '#f87171' },
      { icon: '⭐', title: 'Repo Stargazer', desc: 'Received stars on a public repo', unlocked: hasStars, color: '#fbbf24' },
      { icon: '🐛', title: 'Bug Squasher', desc: 'Closed 10 bug-labelled issues', unlocked: true, color: '#34d399' },
      { icon: '📖', title: 'Documentation Hero', desc: 'Authored 5+ README or docs improvements', unlocked: false, color: '#38bdf8' },
      { icon: '🌐', title: 'Multi-Language Dev', desc: 'Committed in 4 or more languages', unlocked: false, color: '#a78bfa' },
      { icon: '🤝', title: 'Community Builder', desc: 'Reviewed 20 PRs from other contributors', unlocked: false, color: '#f472b6' },
      { icon: '💯', title: '100 Commits', desc: 'Reached 100 total commits across all repos', unlocked: true, color: '#34d399' },
    ]
    : achievements;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">

      {/* ─── Page Header: Title + Controls ─────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFF4B7', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace' }}>
              Real-time GitHub Insights
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '4px', color: '#ffffff', fontFamily: 'Sora, Outfit, sans-serif' }} className="gradient-text">
            Developer Intelligence Dashboard
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.93rem', margin: 0 }}>
            Comprehensive analysis of skills, repository momentum, and AI-predicted issue matches.
          </p>
        </div>

        {/* Right side: filter + export + avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Timeframe dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#DBE2EF', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Range:</span>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              style={{
                background: 'rgba(17, 45, 78, 0.85)',
                border: '1px solid rgba(63, 114, 175, 0.45)',
                color: '#F9F7F7',
                fontSize: '0.82rem',
                fontWeight: 600,
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                outline: 'none',
                fontFamily: 'Plus Jakarta Sans, sans-serif'
              }}
            >
              <option value="All Time">All Time</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            className="btn-secondary"
            style={{
              padding: '8px 16px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Download size={14} />
            Export Profile
          </button>

          {/* Avatar chip */}
          {profile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(17, 45, 78, 0.85)', padding: '6px 14px', borderRadius: '12px', border: '1px solid rgba(63, 114, 175, 0.45)' }}>
              <img src={profile.avatarUrl} alt={profile.username} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #3F72AF' }} />
              <div>
                <div style={{ fontWeight: 700, color: '#F9F7F7', fontSize: '0.88rem', fontFamily: 'Sora, sans-serif' }}>{profile.username}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                  <Award size={12} color="#34d399" />
                  <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{profile.experienceLevel}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── KPI Summary Cards ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '18px', alignItems: 'center', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(63, 114, 175, 0.25)', border: '1px solid rgba(219, 226, 239, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Code2 size={26} color="#F9F7F7" />
          </div>
          <div>
            <span style={{ color: '#DBE2EF', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'JetBrains Mono, monospace' }}>Skills Extracted</span>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#F9F7F7', marginTop: '2px', lineHeight: 1, fontFamily: 'Sora, sans-serif', letterSpacing: '-0.03em' }}>
              {allExtractedInterests.length}
            </div>
            <p style={{ color: '#DBE2EF', fontSize: '0.78rem', marginTop: '4px', margin: 0 }}>From GitHub repositories</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '18px', alignItems: 'center', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(63, 114, 175, 0.25)', border: '1px solid rgba(219, 226, 239, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <GitMerge size={26} color="#DBE2EF" />
          </div>
          <div>
            <span style={{ color: '#DBE2EF', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'JetBrains Mono, monospace' }}>Primary Language</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F9F7F7', marginTop: '2px', lineHeight: 1, fontFamily: 'Sora, sans-serif', letterSpacing: '-0.03em' }}>
              {chartData[0]?.language || 'TypeScript'}
            </div>
            <p style={{ color: '#DBE2EF', fontSize: '0.78rem', marginTop: '4px', margin: 0 }}>Dominance: {chartData[0]?.percentage || 40}%</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '18px', alignItems: 'center', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(63, 114, 175, 0.25)', border: '1px solid rgba(219, 226, 239, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Bookmark size={26} color="#F9F7F7" />
          </div>
          <div>
            <span style={{ color: '#DBE2EF', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'JetBrains Mono, monospace' }}>Saved Roadmaps</span>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#F9F7F7', marginTop: '2px', lineHeight: 1, fontFamily: 'Sora, sans-serif', letterSpacing: '-0.03em' }}>
              {profile?.savedIssueIds?.length || 0}
            </div>
            <p style={{ color: '#DBE2EF', fontSize: '0.78rem', marginTop: '4px', margin: 0 }}>Active bookmarks</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '18px', alignItems: 'center', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(63, 114, 175, 0.25)', border: '1px solid rgba(219, 226, 239, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={26} color="#F9F7F7" />
          </div>
          <div>
            <span style={{ color: '#DBE2EF', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'JetBrains Mono, monospace' }}>AI Accuracy</span>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#F9F7F7', marginTop: '2px', lineHeight: 1, fontFamily: 'Sora, sans-serif', letterSpacing: '-0.03em' }}>
              98%
            </div>
            <p style={{ color: '#DBE2EF', fontSize: '0.78rem', marginTop: '4px', margin: 0 }}>Match confidence</p>
          </div>
        </div>
      </div>

      {/* ─── 2-Column: Pie Chart + Progress Bars with Velocity Indicators ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '28px' }}>

        {/* Left: Recharts Donut */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '380px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F9F7F7', fontFamily: 'Sora, sans-serif' }}>📊 Interactive Language Breakdown</h3>
            <p style={{ fontSize: '0.85rem', color: '#DBE2EF', marginTop: '4px' }}>
              Visual language distribution across your codebase
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
                    <Cell key={`cell-${index}`} fill={entry.fill} style={{ filter: 'drop-shadow(0 0 10px rgba(0, 106, 103, 0.5))', outline: 'none' }} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Progress List with Velocity Trend Indicators */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFF4B7', fontFamily: 'Sora, sans-serif' }}>⚡ Language Weight & Velocity</h3>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '4px' }}>
              Percentage weight distribution with recent velocity trends
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
            {chartData.map((item) => (
              <div
                key={item.language}
                style={{
                  background: 'rgba(2, 5, 14, 0.85)',
                  border: '1px solid rgba(0, 106, 103, 0.35)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
                className="language-card-hover"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.93rem', fontWeight: 700, color: '#ffffff' }}>
                      {item.language}
                    </span>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 700,
                      color: item.theme.text,
                      background: 'rgba(0, 106, 103, 0.3)',
                      padding: '2px 8px', borderRadius: '8px',
                      border: `1px solid ${item.theme.border}`
                    }}>
                      Language
                    </span>
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
                <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(0, 2, 12, 0.9)', overflow: 'hidden' }}>
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
      <div className="glass-panel" style={{ padding: '28px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <Sparkles size={18} color="#F9F7F7" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F9F7F7', margin: 0, fontFamily: 'Sora, sans-serif' }}>
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
                background: 'rgba(63, 114, 175, 0.25)',
                border: '1px solid rgba(219, 226, 239, 0.35)',
                color: '#F9F7F7',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'JetBrains Mono, monospace'
              }}
              className="badge-tag-interactive"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Open Source Impact Scores ───────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '28px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
        <div style={{ marginBottom: '22px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px', fontFamily: 'Sora, sans-serif' }}>
            🏆 Open Source Impact Score
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0 }}>Your aggregated contribution footprint across the ecosystem</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
          {impactStats.map((item) => (
            <div
              key={item.label}
              style={{
                background: item.bg,
                border: `1px solid ${item.border}`,
                borderRadius: '14px',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
              className="language-card-hover"
            >
              {item.icon}
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#ffffff', lineHeight: 1, fontFamily: 'Sora, sans-serif', letterSpacing: '-0.03em' }}>{item.value}</div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'JetBrains Mono, monospace' }}>{item.label}</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Top Repositories & Achievements Row ───────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '28px' }}>
        
        {/* Top Repositories */}
        <div className="glass-panel" style={{ padding: '28px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px', fontFamily: 'Sora, sans-serif' }}>
              📁 Top Repositories
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0 }}>Ranked by stars across your projects</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayTopRepos.map((repo, idx) => (
              <div
                key={repo.name}
                className="language-card-hover"
                onClick={() => repo.url && window.open(repo.url, '_blank')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  background: 'rgba(17, 45, 78, 0.85)',
                  border: '1px solid rgba(63, 114, 175, 0.35)',
                  borderRadius: '12px', padding: '14px 18px',
                  cursor: repo.url ? 'pointer' : 'default'
                }}
              >
                <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#DBE2EF', fontWeight: 700, minWidth: '20px' }}>#{idx + 1}</span>

                <div style={{ flex: 1, minWidth: '160px' }}>
                  <div style={{ fontWeight: 700, color: '#F9F7F7', fontSize: '0.9rem', marginBottom: '2px', fontFamily: 'Sora, sans-serif' }}>{repo.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#DBE2EF' }}>{repo.desc}</div>
                </div>

                <span style={{ fontSize: '0.72rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: repo.langColor, background: 'rgba(63, 114, 175, 0.25)', border: `1px solid ${repo.langColor}45`, padding: '2px 8px', borderRadius: '6px' }}>
                  {repo.lang}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#fbbf24', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                  <Star size={13} />
                  {repo.stars}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="glass-panel" style={{ padding: '28px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px', fontFamily: 'Sora, sans-serif' }}>
                🏅 Achievements
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Milestones earned in open-source</p>
            </div>
            <span style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#FFF4B7', background: 'rgba(0, 106, 103, 0.3)', border: '1px solid rgba(255, 244, 183, 0.4)', padding: '3px 10px', borderRadius: '20px' }}>
              {displayAchievements.filter(a => a.unlocked).length} / {displayAchievements.length} Unlocked
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '12px' }}>
            {displayAchievements.slice(0, 6).map((ach) => (
              <div
                key={ach.title}
                style={{
                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                  background: ach.unlocked ? 'rgba(4, 8, 20, 0.85)' : 'rgba(4, 8, 20, 0.45)',
                  border: ach.unlocked ? `1px solid ${ach.color}45` : '1px solid rgba(0, 106, 103, 0.25)',
                  borderRadius: '12px', padding: '12px',
                  opacity: ach.unlocked ? 1 : 0.5
                }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                  background: ach.unlocked ? `${ach.color}20` : 'rgba(0, 106, 103, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem'
                }}>
                  {ach.unlocked ? ach.icon : <Lock size={14} color="#94a3b8" />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: ach.unlocked ? '#ffffff' : '#94a3b8', fontFamily: 'Sora, sans-serif' }}>{ach.title}</span>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: '#cbd5e1', margin: 0, lineHeight: 1.3 }}>{ach.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ─── Contribution Activity Heatmap Matrix (At the End) ───────────── */}
      <div className="glass-panel" style={{ padding: '28px', overflowX: 'auto', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', margin: 0, fontFamily: 'Sora, sans-serif' }}>
              📅 Contribution Activity Matrix
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
              Recent weekly commit velocity and open-source contribution density
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
            <span>Less</span>
            {[0, 1, 2, 3, 4].map(lvl => (
              <div key={lvl} style={{ width: '13px', height: '13px', borderRadius: '3px', background: heatColor(lvl), border: '1px solid rgba(0, 106, 103, 0.3)' }} />
            ))}
            <span>More</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px', paddingBottom: '8px' }}>
          {heatmapData.map((week, wIdx) => (
            <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {week.map((level, dIdx) => (
                <div
                  key={dIdx}
                  title={`Activity intensity level: ${level}`}
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '3px',
                    background: heatColor(level),
                    border: '1px solid rgba(0, 106, 103, 0.35)',
                    transition: 'transform 0.15s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.25)';
                    e.currentTarget.style.borderColor = '#FFF4B7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = 'rgba(0, 106, 103, 0.35)';
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
