import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  GitPullRequest,
  CheckCircle2,
  Clock,
  Bookmark,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  GitMerge,
  AlertCircle,
  Plus,
  Terminal,
  Sparkles,
  TrendingUp,
  FolderGit2,
  Trash2,
  ChevronDown
} from 'lucide-react';
import {
  ContributionItem,
  ContributionStatus,
  fetchLiveContributions,
  saveContributions,
  getCachedContributions,
  getLastSyncTime,
  fetchUserProfile,
  UserProfile
} from '../services/api';

const statusConfig: Record<ContributionStatus, { label: string; color: string; bg: string; border: string; icon: any }> = {
  saved: {
    label: 'Saved',
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.1)',
    border: 'rgba(251, 191, 36, 0.3)',
    icon: Bookmark
  },
  applied: {
    label: 'Applied',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.1)',
    border: 'rgba(56, 189, 248, 0.3)',
    icon: Clock
  },
  in_progress: {
    label: 'In Progress',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.4)',
    icon: GitPullRequest
  },
  merged: {
    label: 'Merged',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.4)',
    icon: CheckCircle2
  },
  closed: {
    label: 'Closed',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.1)',
    border: 'rgba(148, 163, 184, 0.25)',
    icon: AlertCircle
  }
};

export default function ContributionTracker(): React.ReactElement {
  const [contributions, setContributions] = useState<ContributionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [lastSyncText, setLastSyncText] = useState<string>('Never');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newRepo, setNewRepo] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newUrl, setNewUrl] = useState<string>('');
  const [newStatus, setNewStatus] = useState<ContributionStatus>('in_progress');

  // Format last sync time string
  const updateSyncString = () => {
    const last = getLastSyncTime();
    if (!last) {
      setLastSyncText('Just now');
      return;
    }
    const diffSec = Math.floor((Date.now() - last) / 1000);
    if (diffSec < 60) setLastSyncText('Just now');
    else if (diffSec < 3600) setLastSyncText(`${Math.floor(diffSec / 60)}m ago`);
    else setLastSyncText(`${Math.floor(diffSec / 3600)}h ago`);
  };

  useEffect(() => {
    // Initial load
    const cached = getCachedContributions();
    setContributions(cached);
    setLoading(false);
    updateSyncString();

    fetchUserProfile()
      .then((profile) => {
        setUserProfile(profile);
        // If last sync > 5 minutes ago, auto-sync
        const last = getLastSyncTime();
        if (!last || Date.now() - last > 5 * 60 * 1000) {
          triggerSync(profile.username);
        }
      })
      .catch(() => {
        // demo profile fallback
      });
  }, []);

  const triggerSync = async (usernameOverride?: string) => {
    setSyncing(true);
    const targetUser = usernameOverride || userProfile?.username;
    try {
      const updated = await fetchLiveContributions(targetUser);
      setContributions(updated);
      updateSyncString();
    } catch (err) {
      console.error('Failed to sync contributions:', err);
    } finally {
      setTimeout(() => setSyncing(false), 600);
    }
  };

  const handleStatusChange = (id: string, newStat: ContributionStatus) => {
    const updated = contributions.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: newStat,
          mergedAt: newStat === 'merged' ? 'Just now' : item.mergedAt
        };
      }
      return item;
    });
    setContributions(updated);
    saveContributions(updated);
  };

  const handleDelete = (id: string) => {
    const updated = contributions.filter(i => i.id !== id);
    setContributions(updated);
    saveContributions(updated);
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepo.trim() || !newTitle.trim()) return;

    const parts = newRepo.split('/');
    const repoOwner = parts[0] || 'community';
    const repoName = parts[1] || newRepo;

    const newItem: ContributionItem = {
      id: `manual-${Date.now()}`,
      repoOwner,
      repoName,
      repository: newRepo.trim(),
      issueTitle: newTitle.trim(),
      issueUrl: newUrl.trim() || `https://github.com/${newRepo.trim()}`,
      status: newStatus,
      isAssigned: true,
      labels: ['open-source', newStatus],
      updatedAt: 'Just now'
    };

    const updated = [newItem, ...contributions];
    setContributions(updated);
    saveContributions(updated);
    setShowAddModal(false);
    setNewRepo('');
    setNewTitle('');
    setNewUrl('');
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = contributions.length;
    const merged = contributions.filter(c => c.status === 'merged').length;
    const inProgress = contributions.filter(c => c.status === 'in_progress').length;
    const applied = contributions.filter(c => c.status === 'applied').length;
    const saved = contributions.filter(c => c.status === 'saved').length;
    const closed = contributions.filter(c => c.status === 'closed').length;

    // Success Rate = Merged / (Merged + Closed + In Progress) * 100
    const finishedOrActive = merged + closed + inProgress;
    const successRate = finishedOrActive > 0 ? Math.round((merged / finishedOrActive) * 100) : 100;

    return { total, merged, inProgress, applied, saved, closed, successRate };
  }, [contributions]);

  // Filter and search
  const filteredContributions = useMemo(() => {
    return contributions.filter(c => {
      const matchSearch =
        c.issueTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.repository.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.prTitle && c.prTitle.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = selectedStatus === 'all' || c.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [contributions, searchTerm, selectedStatus]);

  const openCodespaces = (repository: string) => {
    window.open(`https://codespaces.new/${repository}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'rgba(2, 5, 14, 0.75)',
        padding: '24px 28px',
        borderRadius: '16px',
        border: '1px solid rgba(0, 106, 103, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(16px)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(0, 106, 103, 0.25)',
              border: '1px solid rgba(255, 244, 183, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <GitPullRequest size={20} color="#FFF4B7" />
            </div>
            <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.03em' }} className="gradient-text">
              Contribution Tracker
            </h1>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontFamily: 'JetBrains Mono, monospace'
            }}>
              GitHub REST Sync
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8' }}>
            Monitor open PRs, track issue applications, and build a verifiable open source pipeline.
          </p>
        </div>

        {/* Sync & Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            color: '#94a3b8',
            background: 'rgba(0, 106, 103, 0.12)',
            padding: '6px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(0, 106, 103, 0.25)'
          }}>
            <Clock size={14} color="#FFF4B7" />
            <span>Synced: <strong style={{ color: '#FFF4B7' }}>{lastSyncText}</strong></span>
          </div>

          <button
            onClick={() => triggerSync()}
            disabled={syncing}
            className="btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem',
              padding: '8px 16px',
              cursor: syncing ? 'not-allowed' : 'pointer',
              opacity: syncing ? 0.7 : 1
            }}
          >
            <RefreshCw size={15} className={syncing ? 'spin-animation' : ''} />
            {syncing ? 'Syncing...' : 'Sync GitHub'}
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              padding: '8px 16px'
            }}
          >
            <Plus size={16} />
            Track Item
          </button>
        </div>
      </div>

      {/* Progress & Pipeline Hero Card */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '18px'
      }}>
        {/* Success Rate Gauge */}
        <div className="glass-panel" style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(2, 5, 14, 0.85) 0%, rgba(0, 106, 103, 0.15) 100%)',
          border: '1px solid rgba(0, 106, 103, 0.35)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FFF4B7', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace' }}>
                Contribution Metric
              </span>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                PR Merge Rate
              </h3>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={20} color="#10b981" />
            </div>
          </div>

          <div style={{ margin: '20px 0 14px 0' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#10b981', fontFamily: 'Sora, sans-serif' }}>
                {stats.successRate}%
              </span>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                ({stats.merged} of {stats.merged + stats.inProgress + stats.closed} PRs merged)
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              overflow: 'hidden',
              marginTop: '10px'
            }}>
              <div style={{
                width: `${stats.successRate}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #10b981 0%, #38bdf8 100%)',
                borderRadius: '6px',
                transition: 'width 0.8s ease-in-out'
              }} />
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '0.78rem', color: '#cbd5e1' }}>
            ⭐ High merge rates highlight dependable code quality and increase maintainer trust.
          </p>
        </div>

        {/* Contribution Pipeline Breadcrumbs */}
        <div className="glass-panel" style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(2, 5, 14, 0.85) 0%, rgba(15, 23, 42, 0.6) 100%)',
          border: '1px solid rgba(0, 106, 103, 0.35)'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace' }}>
              Lifecycle Pipeline
            </span>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
              Contribution Funnel
            </h3>
          </div>

          {/* Pipeline flow steps */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            margin: '18px 0',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'center', flex: 1, minWidth: '55px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fbbf24' }}>{stats.saved}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Saved</div>
            </div>
            <div style={{ color: '#475569', fontSize: '0.9rem' }}>→</div>
            <div style={{ textAlign: 'center', flex: 1, minWidth: '55px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>{stats.applied}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Applied</div>
            </div>
            <div style={{ color: '#475569', fontSize: '0.9rem' }}>→</div>
            <div style={{ textAlign: 'center', flex: 1, minWidth: '55px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b' }}>{stats.inProgress}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>In Dev</div>
            </div>
            <div style={{ color: '#475569', fontSize: '0.9rem' }}>→</div>
            <div style={{ textAlign: 'center', flex: 1, minWidth: '55px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>{stats.merged}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Merged</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#94a3b8' }}>
            <span>Total Tracked Items: <strong style={{ color: '#f8fafc' }}>{stats.total}</strong></span>
            <NavLink to="/issues" style={{ color: '#FFF4B7', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              Find More Issues <ArrowUpRight size={13} />
            </NavLink>
          </div>
        </div>
      </div>

      {/* Interactive Status Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '14px'
      }}>
        {(['all', 'in_progress', 'merged', 'applied', 'saved', 'closed'] as const).map((st) => {
          const isAll = st === 'all';
          const cfg = !isAll ? statusConfig[st as ContributionStatus] : {
            label: 'All Items',
            color: '#f8fafc',
            bg: 'rgba(255, 255, 255, 0.05)',
            border: 'rgba(255, 255, 255, 0.15)',
            icon: FolderGit2
          };
          const count = isAll
            ? stats.total
            : st === 'in_progress'
            ? stats.inProgress
            : st === 'merged'
            ? stats.merged
            : st === 'applied'
            ? stats.applied
            : st === 'saved'
            ? stats.saved
            : stats.closed;

          const isSelected = selectedStatus === st;
          const IconComponent = cfg.icon;

          return (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              style={{
                background: isSelected ? cfg.bg : 'rgba(2, 5, 14, 0.65)',
                border: `1px solid ${isSelected ? cfg.color : 'rgba(0, 106, 103, 0.25)'}`,
                padding: '16px 18px',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? `0 4px 20px ${cfg.bg}` : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: isSelected ? cfg.color : '#94a3b8', fontWeight: 600 }}>
                  {cfg.label}
                </span>
                <IconComponent size={16} color={cfg.color} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, color: cfg.color, fontFamily: 'Sora, sans-serif' }}>
                  {count}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>items</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        background: 'rgba(2, 5, 14, 0.65)',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid rgba(0, 106, 103, 0.25)'
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(0, 106, 103, 0.1)',
          padding: '8px 14px',
          borderRadius: '8px',
          border: '1px solid rgba(0, 106, 103, 0.3)',
          flex: '1',
          minWidth: '240px',
          maxWidth: '450px'
        }}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by repo, PR title, or issue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: '0.85rem',
              width: '100%'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(['all', 'in_progress', 'merged', 'applied', 'saved', 'closed'] as const).map((st) => {
            const isSel = selectedStatus === st;
            const label = st === 'all' ? 'All' : statusConfig[st]?.label || st;
            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isSel ? '1px solid #FFF4B7' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: isSel ? 'rgba(0, 106, 103, 0.4)' : 'transparent',
                  color: isSel ? '#FFF4B7' : '#94a3b8',
                  transition: 'all 0.15s ease'
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contributions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredContributions.length === 0 ? (
          <div className="glass-panel" style={{
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(0, 106, 103, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <GitPullRequest size={28} color="#FFF4B7" />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc' }}>
              No contributions found
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', maxWidth: '420px' }}>
              {searchTerm
                ? `No tracked items matched "${searchTerm}". Try a different search query.`
                : 'You have no tracked items in this category yet. Explore beginner-friendly issues to get started!'}
            </p>
            <NavLink to="/issues" className="btn-primary" style={{ textDecoration: 'none', marginTop: '6px' }}>
              Browse Good First Issues
            </NavLink>
          </div>
        ) : (
          filteredContributions.map((item) => {
            const statCfg = statusConfig[item.status];
            const StatusIcon = statCfg.icon;

            return (
              <div
                key={item.id}
                className="glass-panel hover-card"
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '18px',
                  borderLeft: `4px solid ${statCfg.color}`
                }}
              >
                {/* Left Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '280px' }}>
                  {/* Repo & Tag Line */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <a
                      href={`https://github.com/${item.repository}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#FFF4B7',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <FolderGit2 size={14} />
                      {item.repository}
                      <ArrowUpRight size={12} color="#94a3b8" />
                    </a>

                    {/* Status Badge */}
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: statCfg.bg,
                      color: statCfg.color,
                      border: `1px solid ${statCfg.border}`,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      <StatusIcon size={12} />
                      {statCfg.label}
                    </span>

                    {/* Labels */}
                    {item.labels && item.labels.slice(0, 2).map((lbl, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.68rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#cbd5e1',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        {lbl}
                      </span>
                    ))}

                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Updated {item.updatedAt}
                    </span>
                  </div>

                  {/* Issue or PR Title */}
                  <a
                    href={item.prUrl || item.issueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: '#f8fafc',
                      textDecoration: 'none',
                      lineHeight: '1.4'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#f8fafc')}
                  >
                    {item.prTitle ? `PR: ${item.prTitle}` : item.issueTitle}
                  </a>

                  {/* Direct links & PR Number */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem', color: '#94a3b8' }}>
                    {item.prNumber && (
                      <a
                        href={item.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                      >
                        <GitPullRequest size={13} />
                        PR #{item.prNumber}
                      </a>
                    )}
                    {item.issueNumber && (
                      <a
                        href={item.issueUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#cbd5e1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <ExternalLink size={12} />
                        Issue #{item.issueNumber}
                      </a>
                    )}
                    {item.mergedAt && (
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <GitMerge size={13} />
                        Merged {item.mergedAt}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Action Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {/* Status Dropdown */}
                  <div style={{ position: 'relative' }}>
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value as ContributionStatus)}
                      style={{
                        background: 'rgba(0, 106, 103, 0.25)',
                        border: '1px solid rgba(0, 106, 103, 0.45)',
                        color: '#f8fafc',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="saved">Status: Saved</option>
                      <option value="applied">Status: Applied</option>
                      <option value="in_progress">Status: In Progress</option>
                      <option value="merged">Status: Merged</option>
                      <option value="closed">Status: Closed</option>
                    </select>
                  </div>

                  {/* Launch Codespaces Button */}
                  <button
                    onClick={() => openCodespaces(item.repository)}
                    title="Launch GitHub Codespaces"
                    style={{
                      background: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: '#38bdf8',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Terminal size={13} />
                    Codespaces
                  </button>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    title="Remove from tracker"
                    style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#f87171',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Manual Track Item Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '520px',
            width: '100%',
            padding: '28px',
            borderRadius: '16px',
            border: '1px solid rgba(0, 106, 103, 0.45)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                Track an Issue or Pull Request
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddManual} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
                  Repository (owner/repo) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. facebook/react or vercel/next.js"
                  value={newRepo}
                  onChange={(e) => setNewRepo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(0, 106, 103, 0.15)',
                    border: '1px solid rgba(0, 106, 103, 0.35)',
                    color: '#f8fafc',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
                  Issue / PR Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fix memory leak on unmount"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(0, 106, 103, 0.15)',
                    border: '1px solid rgba(0, 106, 103, 0.35)',
                    color: '#f8fafc',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
                  GitHub Link (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(0, 106, 103, 0.15)',
                    border: '1px solid rgba(0, 106, 103, 0.35)',
                    color: '#f8fafc',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
                  Current Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ContributionStatus)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(0, 106, 103, 0.25)',
                    border: '1px solid rgba(0, 106, 103, 0.45)',
                    color: '#f8fafc',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                >
                  <option value="saved">Saved (Bookmarked)</option>
                  <option value="applied">Applied (Assigned / Commented)</option>
                  <option value="in_progress">In Progress (Draft / Open PR)</option>
                  <option value="merged">Merged</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                >
                  Add to Tracker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
