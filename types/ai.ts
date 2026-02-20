import type { ThoughtType, EvidenceRelation } from './index';

export type AISuggestionCategory =
  | 'new-thought'
  | 'new-evidence'
  | 'confidence-adjustment'
  | 'connection-proposal'
  | 'contradiction-alert'
  | 'pattern-detected';

export type AISuggestionPriority = 'low' | 'medium' | 'high';

export type SuggestedAction =
  | {
      type: 'create-thought';
      thoughtType: ThoughtType;
      title: string;
      body: string;
      tags: string[];
    }
  | {
      type: 'add-evidence';
      targetThoughtId: string;
      evidenceTitle: string;
      evidenceContent: string;
      relation: EvidenceRelation;
    }
  | {
      type: 'adjust-confidence';
      targetThoughtId: string;
      currentConfidence: number;
      suggestedConfidence: number;
      reason: string;
    }
  | {
      type: 'create-connection';
      sourceId: string;
      targetId: string;
      connectionType: 'supports' | 'contradicts' | 'related';
    }
  | {
      type: 'review-contradiction';
      thoughtIds: string[];
      description: string;
    };

export interface AISuggestion {
  id: string;
  category: AISuggestionCategory;
  priority: AISuggestionPriority;
  title: string;
  summary: string;
  reasoning: string;
  relatedThoughtIds: string[];
  suggestedAction: SuggestedAction;
  createdAt: string;
  dismissed: boolean;
  accepted: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: MessageAction[];
  thinking?: boolean;
}

export interface MessageAction {
  label: string;
  icon: 'thought' | 'evidence' | 'confidence' | 'alert';
  description?: string;
}
