// Core Types
export type ThoughtType = 'Question' | 'Hypothesis' | 'Claim' | 'Observation';

export type ThoughtStatus = 
  | 'Open' 
  | 'Investigating' 
  | 'Supported' 
  | 'Disproved' 
  | 'Parked' 
  | 'Conflicted';

export type EvidenceRelation = 'Supports' | 'Contradicts' | 'Context';

export type EvidenceSourceType = 
  | 'Profiler' 
  | 'LinkAnalysis' 
  | 'URL' 
  | 'Note' 
  | 'CaseArtifact' 
  | 'SearchResult';

export type Reliability = 'Unknown' | 'Low' | 'Medium' | 'High';

export type UserRole = 'Viewer' | 'Editor' | 'Lead';

export type ConnectionType = 'supports' | 'contradicts' | 'related';

// Main Models
export interface Board {
  id: string;
  title: string;
  status: 'Active' | 'Archived';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  members: BoardMember[];
}

export interface BoardMember {
  userId: string;
  name: string;
  avatar?: string;
  role: UserRole;
}

export interface Thought {
  id: string;
  boardId: string;
  type: ThoughtType;
  title: string;
  body: string;
  confidence?: number; // 0-100, only for Hypothesis/Claim
  status: ThoughtStatus;
  tags: string[];
  owner?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  // Canvas position for React Flow
  position: { x: number; y: number };
}

export interface Evidence {
  id: string;
  boardId: string;
  type: EvidenceSourceType;
  title: string;
  summary: string;
  timestamp: Date;
  reliability: Reliability;
  extractedEntities?: Entity[];
  rawPayload?: Record<string, any>; // For showing previews
  createdBy: string;
  createdAt: Date;
}

export interface EvidenceLink {
  id: string;
  nodeId: string; // ThoughtNode id
  evidenceId: string; // Evidence id
  relation: EvidenceRelation; // Supports/Contradicts/Context
  note?: string; // Optional note about why this evidence relates
  isKey: boolean; // Key evidence for this specific thought
  createdBy: string;
  createdAt: Date;
}

export interface Entity {
  type: 'domain' | 'ip' | 'email' | 'handle' | 'phone';
  value: string;
}

export interface Connection {
  id: string;
  boardId: string;
  sourceId: string;
  targetId: string;
  type: ConnectionType;
}

export interface Comment {
  id: string;
  thoughtId: string;
  boardId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  resolved: boolean;
  isPinned: boolean;
}

export interface AIAction {
  id: string;
  thoughtId: string;
  text: string;
  reason: string;
  actionType: 'run' | 'search' | 'create' | 'checklist';
  completed: boolean;
}

export interface AIInsight {
  id: string;
  thoughtId: string;
  type: 'warning' | 'pattern' | 'contradiction';
  message: string;
  actions: Array<{
    label: string;
    action: string;
  }>;
}

export interface ActivityEntry {
  id: string;
  boardId: string;
  type: 'thought_created' | 'evidence_attached' | 'status_changed' | 
        'confidence_changed' | 'export_created' | 'comment_added';
  userId: string;
  userName: string;
  timestamp: Date;
  details: Record<string, any>;
}
