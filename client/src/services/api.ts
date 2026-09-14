const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api');

export const getAuthUrl = (path: string = '/api/auth/github'): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return `${import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '')}${path}`;
  }
  return window.location.hostname === 'localhost' ? `http://localhost:5000${path}` : path;
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const logout = (): void => {
  removeAuthToken();
};

const getHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export interface UserProfile {
  githubId: string;
  username: string;
  displayName?: string;
  avatarUrl: string;
  bio?: string;
  location?: string;
  githubProfileUrl?: string;
  publicRepos?: number;
  followers?: number;
  following?: number;
  technicalInterests: string[];
  languageBreakdown?: Record<string, number>;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  savedIssueIds: string[];
}

export interface IssueItem {
  id: string;
  title: string;
  repository: string;
  stars: number;
  labels: string[];
  matchScore: number;
  explanation: string;
  difficulty: string;
  estimatedTime: string;
  knowledgeGaps: string[];
  roadmap: Array<{ step: number; task: string; completed: boolean }>;
  url?: string;
}

export const fetchUserProfile = async (): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/user/profile`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch user profile');
  return response.json();
};

export const updateUserProfile = async (interests: string[], experience: string, username?: string): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getHeaders() },
    body: JSON.stringify({ technicalInterests: interests, experienceLevel: experience, username })
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return response.json();
};

export const fetchRecommendations = async (language: string = 'javascript', label: string = 'good first issue'): Promise<IssueItem[]> => {
  const response = await fetch(`${API_BASE_URL}/issues/recommendations?language=${encodeURIComponent(language)}&label=${encodeURIComponent(label)}`);
  if (!response.ok) throw new Error('Failed to fetch issue recommendations');
  return response.json();
};

export const toggleIssueBookmark = async (issueId: string): Promise<{ savedIssueIds: string[] }> => {
  const response = await fetch(`${API_BASE_URL}/issues/${encodeURIComponent(issueId)}/bookmark`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Failed to bookmark issue');
  return response.json();
};

export interface AIPRStarter {
  prTitle: string;
  hint1?: string;
  hint2?: string;
  implementationOutline: string[];
  codeDraft: string;
  prChecklist: string[];
}

export const fetchPRStarter = async (title: string, body?: string, stack?: string[]): Promise<AIPRStarter> => {
  const response = await fetch(`${API_BASE_URL}/issues/pr-starter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders() },
    body: JSON.stringify({ title, body, stack })
  });
  if (!response.ok) throw new Error('Failed to generate PR starter blueprint');
  return response.json();
};

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const sendIssueChatMessage = async (
  issueId: string,
  issueTitle: string,
  issueBody: string,
  history: ChatMessage[],
  message: string
): Promise<{ reply: string }> => {
  const response = await fetch(`${API_BASE_URL}/issues/${encodeURIComponent(issueId)}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders() },
    body: JSON.stringify({ issueTitle, issueBody, history, message })
  });
  if (!response.ok) throw new Error('Failed to send message to Copilot');
  return response.json();
};

export interface GitHubRepo {
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  pushed_at: string;
  html_url: string;
  topics?: string[];
}

export const fetchUserReposFromGitHub = async (username: string): Promise<GitHubRepo[]> => {
  const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`);
  if (!response.ok) throw new Error('Failed to fetch repositories from GitHub');
  return response.json();
};

export type ContributionStatus = 'saved' | 'applied' | 'in_progress' | 'merged' | 'closed';

export interface ContributionItem {
  id: string;
  repoOwner: string;
  repoName: string;
  repository: string;
  issueNumber?: number;
  issueTitle: string;
  issueUrl: string;
  prNumber?: number;
  prTitle?: string;
  prUrl?: string;
  status: ContributionStatus;
  isAssigned: boolean;
  labels: string[];
  language?: string;
  updatedAt: string;
  mergedAt?: string;
}

const DEFAULT_MOCK_CONTRIBUTIONS: ContributionItem[] = [
  {
    id: 'contrib-1',
    repoOwner: 'facebook',
    repoName: 'react',
    repository: 'facebook/react',
    issueNumber: 28402,
    issueTitle: 'Improve warning message when hook dependencies are misconfigured in DevTools',
    issueUrl: 'https://github.com/facebook/react/issues/28402',
    prNumber: 28415,
    prTitle: 'fix(devtools): clarify missing hook dependency array warning',
    prUrl: 'https://github.com/facebook/react/pull/28415',
    status: 'merged',
    isAssigned: true,
    labels: ['good first issue', 'React DevTools', 'Component: Core'],
    language: 'TypeScript',
    updatedAt: '2 days ago',
    mergedAt: 'Yesterday'
  },
  {
    id: 'contrib-2',
    repoOwner: 'expressjs',
    repoName: 'express',
    repository: 'expressjs/express',
    issueNumber: 5410,
    issueTitle: 'Add TypeScript types for route handler error pipelines',
    issueUrl: 'https://github.com/expressjs/express/issues/5410',
    prNumber: 5422,
    prTitle: 'types: enhance NextFunction error inference in route chains',
    prUrl: 'https://github.com/expressjs/express/pull/5422',
    status: 'in_progress',
    isAssigned: true,
    labels: ['typescript', 'help wanted', 'in-progress'],
    language: 'TypeScript',
    updatedAt: '3 hours ago'
  },
  {
    id: 'contrib-3',
    repoOwner: 'tailwindlabs',
    repoName: 'tailwindcss',
    repository: 'tailwindlabs/tailwindcss',
    issueNumber: 12093,
    issueTitle: 'Fix dark mode color-scheme fallback in Firefox on Linux',
    issueUrl: 'https://github.com/tailwindlabs/tailwindcss/issues/12093',
    status: 'applied',
    isAssigned: true,
    labels: ['good first issue', 'browser-compat'],
    language: 'CSS',
    updatedAt: '5 hours ago'
  },
  {
    id: 'contrib-4',
    repoOwner: 'vitejs',
    repoName: 'vite',
    repository: 'vitejs/vite',
    issueNumber: 16120,
    issueTitle: 'Optimize HMR reload debouncing when touching CSS modules in nested subtrees',
    issueUrl: 'https://github.com/vitejs/vite/issues/16120',
    status: 'saved',
    isAssigned: false,
    labels: ['perf', 'hmr', 'good first issue'],
    language: 'JavaScript',
    updatedAt: '1 day ago'
  },
  {
    id: 'contrib-5',
    repoOwner: 'mongodb',
    repoName: 'node-mongodb-native',
    repository: 'mongodb/node-mongodb-native',
    issueNumber: 3901,
    issueTitle: 'Refactor client connection retry backoff to exponential jitter',
    issueUrl: 'https://github.com/mongodb/node-mongodb-native/issues/3901',
    prNumber: 3918,
    prTitle: 'feat: apply full jitter to reconnect attempts',
    prUrl: 'https://github.com/mongodb/node-mongodb-native/pull/3918',
    status: 'closed',
    isAssigned: false,
    labels: ['refactor', 'driver'],
    language: 'TypeScript',
    updatedAt: '1 week ago'
  }
];

export const getCachedContributions = (): ContributionItem[] => {
  const cached = localStorage.getItem('osc_contributions');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore
    }
  }
  return DEFAULT_MOCK_CONTRIBUTIONS;
};

export const saveContributions = (items: ContributionItem[]): void => {
  localStorage.setItem('osc_contributions', JSON.stringify(items));
  localStorage.setItem('osc_contributions_last_sync', Date.now().toString());
};

export const getLastSyncTime = (): number | null => {
  const t = localStorage.getItem('osc_contributions_last_sync');
  return t ? parseInt(t, 10) : null;
};

export const fetchLiveContributions = async (username?: string): Promise<ContributionItem[]> => {
  // If a username is available, attempt real GitHub API queries (assigned issues & PRs)
  if (username && username !== 'demo' && username !== 'demo-user-123') {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json'
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // 1. Fetch user PRs (author:{user} is:pr)
      const prsPromise = fetch(
        `https://api.github.com/search/issues?q=author:${encodeURIComponent(username)}+is:pr&sort=updated&per_page=15`,
        { headers }
      ).then(r => r.ok ? r.json() : { items: [] }).catch(() => ({ items: [] }));

      // 2. Fetch assigned issues (assignee:{user} is:issue)
      const issuesPromise = fetch(
        `https://api.github.com/search/issues?q=assignee:${encodeURIComponent(username)}+is:issue&sort=updated&per_page=15`,
        { headers }
      ).then(r => r.ok ? r.json() : { items: [] }).catch(() => ({ items: [] }));

      const [prsRes, issuesRes] = await Promise.all([prsPromise, issuesPromise]);

      const liveItems: ContributionItem[] = [];

      // Transform PRs
      if (Array.isArray(prsRes.items)) {
        for (const pr of prsRes.items) {
          const repoParts = (pr.repository_url || '').replace('https://api.github.com/repos/', '').split('/');
          const repoOwner = repoParts[0] || 'github';
          const repoName = repoParts[1] || 'repo';
          const isMerged = pr.pull_request?.merged_at != null || pr.state_reason === 'completed';
          const isClosed = pr.state === 'closed' && !isMerged;
          const status: ContributionStatus = isMerged ? 'merged' : isClosed ? 'closed' : 'in_progress';

          liveItems.push({
            id: `pr-${pr.id}`,
            repoOwner,
            repoName,
            repository: `${repoOwner}/${repoName}`,
            issueTitle: pr.title,
            issueUrl: pr.html_url,
            prNumber: pr.number,
            prTitle: pr.title,
            prUrl: pr.html_url,
            status,
            isAssigned: true,
            labels: (pr.labels || []).map((l: any) => l.name || l),
            updatedAt: new Date(pr.updated_at).toLocaleDateString(),
            mergedAt: isMerged ? new Date(pr.closed_at || pr.updated_at).toLocaleDateString() : undefined
          });
        }
      }

      // Transform Assigned Issues
      if (Array.isArray(issuesRes.items)) {
        for (const issue of issuesRes.items) {
          const repoParts = (issue.repository_url || '').replace('https://api.github.com/repos/', '').split('/');
          const repoOwner = repoParts[0] || 'github';
          const repoName = repoParts[1] || 'repo';

          // Avoid duplicate if PR already handled
          if (!liveItems.some(item => item.repository === `${repoOwner}/${repoName}` && item.issueTitle === issue.title)) {
            liveItems.push({
              id: `issue-${issue.id}`,
              repoOwner,
              repoName,
              repository: `${repoOwner}/${repoName}`,
              issueNumber: issue.number,
              issueTitle: issue.title,
              issueUrl: issue.html_url,
              status: issue.state === 'closed' ? 'closed' : 'applied',
              isAssigned: true,
              labels: (issue.labels || []).map((l: any) => l.name || l),
              updatedAt: new Date(issue.updated_at).toLocaleDateString()
            });
          }
        }
      }

      if (liveItems.length > 0) {
        // Merge with existing saved bookmarks so users don't lose local bookmarks
        const existing = getCachedContributions();
        const savedBookmarks = existing.filter(i => i.status === 'saved');
        const combined = [...liveItems, ...savedBookmarks.filter(s => !liveItems.some(l => l.issueUrl === s.issueUrl))];
        saveContributions(combined);
        return combined;
      }
    } catch (err) {
      console.warn('Could not sync with live GitHub API, using cached/mock items:', err);
    }
  }

  // Fallback to cached or default
  const cached = getCachedContributions();
  saveContributions(cached);
  return cached;
};

/* ─── SMTP Email API ─────────────────────────────────────────────────────── */

export interface SmtpStatusResponse {
  configured: boolean;
  host: string;
  port: string;
  service: string | null;
  user: string | null;
}

export const fetchSmtpStatus = async (): Promise<SmtpStatusResponse> => {
  try {
    const res = await fetch(`${API_BASE_URL}/email/status`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch SMTP status');
    return res.json();
  } catch (err) {
    console.warn('Could not fetch SMTP status:', err);
    return { configured: false, host: 'smtp.gmail.com', port: '587', service: null, user: null };
  }
};

export const sendTestEmailApi = async (email: string, username?: string): Promise<{ success: boolean; message: string; preview?: boolean }> => {
  const res = await fetch(`${API_BASE_URL}/email/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders() },
    body: JSON.stringify({ email, username })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to send test email');
  }
  return res.json();
};

export const sendDigestEmailApi = async (email: string, username?: string): Promise<{ success: boolean; message: string; preview?: boolean }> => {
  const res = await fetch(`${API_BASE_URL}/email/digest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders() },
    body: JSON.stringify({ email, username })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to send digest email');
  }
  return res.json();
};

export const sendFeedbackApi = async (data: { name: string; email: string; subject: string; message: string }): Promise<{ success: boolean; message: string }> => {
  const res = await fetch(`${API_BASE_URL}/email/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to send feedback message');
  }
  return res.json();
};

