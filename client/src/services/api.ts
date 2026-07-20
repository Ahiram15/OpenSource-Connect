const API_BASE_URL = 'http://localhost:5000/api';

export interface UserProfile {
  githubId: string;
  username: string;
  avatarUrl: string;
  technicalInterests: string[];
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
  const response = await fetch(`${API_BASE_URL}/user/profile`);
  if (!response.ok) throw new Error('Failed to fetch user profile');
  return response.json();
};

export const updateUserProfile = async (interests: string[], experience: string): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ technicalInterests: interests, experienceLevel: experience })
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
