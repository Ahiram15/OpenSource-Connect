const API_BASE_URL = 'http://localhost:5000/api';

export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

const getHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export interface UserProfile {
  githubId: string;
  username: string;
  avatarUrl: string;
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
