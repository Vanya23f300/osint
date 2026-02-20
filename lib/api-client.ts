import type {
  Board,
  Thought,
  Evidence,
  EvidenceLink,
  Connection,
  Comment,
  ActivityEntry,
} from '@/types';

const API_BASE = '/api';

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

// Board API
export const boardsApi = {
  getAll: () => apiCall<{ boards: Board[] }>('/boards'),
  
  getById: (id: string) => apiCall<{
    board: Board;
    thoughts: Thought[];
    evidence: Evidence[];
    evidenceLinks: EvidenceLink[];
    connections: Connection[];
    activities: ActivityEntry[];
  }>(`/boards/${id}`),
  
  create: (board: Board) => apiCall<{ board: Board }>('/boards', {
    method: 'POST',
    body: JSON.stringify(board),
  }),
  
  update: (id: string, updates: Partial<Board>) => apiCall<{ board: Board }>(`/boards/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
  
  delete: (id: string) => apiCall<{ success: boolean }>(`/boards/${id}`, {
    method: 'DELETE',
  }),
};

// Thought API
export const thoughtsApi = {
  create: (thought: Thought) => apiCall<{ thought: Thought }>('/thoughts', {
    method: 'POST',
    body: JSON.stringify(thought),
  }),
  
  update: (id: string, updates: Partial<Thought>) => apiCall<{ thought: Thought }>(`/thoughts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
  
  delete: (id: string) => apiCall<{ success: boolean }>(`/thoughts/${id}`, {
    method: 'DELETE',
  }),
};

// Evidence API
export const evidenceApi = {
  create: (evidence: Evidence) => apiCall<{ evidence: Evidence }>('/evidence', {
    method: 'POST',
    body: JSON.stringify(evidence),
  }),
  
  update: (id: string, updates: Partial<Evidence>) => apiCall<{ evidence: Evidence }>(`/evidence/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
  
  delete: (id: string) => apiCall<{ success: boolean }>(`/evidence/${id}`, {
    method: 'DELETE',
  }),
};

// Evidence Link API
export const evidenceLinksApi = {
  create: (link: EvidenceLink) => apiCall<{ link: EvidenceLink }>('/evidence-links', {
    method: 'POST',
    body: JSON.stringify(link),
  }),
  
  update: (id: string, updates: Partial<EvidenceLink>) => apiCall<{ link: EvidenceLink }>(`/evidence-links/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
  
  delete: (id: string) => apiCall<{ success: boolean }>(`/evidence-links/${id}`, {
    method: 'DELETE',
  }),
};

// Connection API
export const connectionsApi = {
  create: (connection: Connection) => apiCall<{ connection: Connection }>('/connections', {
    method: 'POST',
    body: JSON.stringify(connection),
  }),
  
  delete: (id: string) => apiCall<{ success: boolean }>(`/connections/${id}`, {
    method: 'DELETE',
  }),
};

// Comment API
export const commentsApi = {
  create: (comment: Comment) => apiCall<{ comment: Comment }>('/comments', {
    method: 'POST',
    body: JSON.stringify(comment),
  }),
  
  update: (id: string, updates: Partial<Comment>) => apiCall<{ comment: Comment }>(`/comments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
  
  delete: (id: string) => apiCall<{ success: boolean }>(`/comments/${id}`, {
    method: 'DELETE',
  }),
};
