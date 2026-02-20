import mongoose, { Schema, Model, models } from 'mongoose';
import type {
  Board,
  Thought,
  Evidence,
  EvidenceLink,
  Connection,
  Comment,
  ActivityEntry,
  AIAction,
  AIInsight,
  BoardMember,
  Entity,
} from '@/types';

// Board Schema
const BoardMemberSchema = new Schema<BoardMember>({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  avatar: String,
  role: { type: String, enum: ['Viewer', 'Editor', 'Lead'], required: true },
}, { _id: false });

const BoardSchema = new Schema<Board>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Archived'], default: 'Active' },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  members: [BoardMemberSchema],
}, {
  timestamps: true,
  collection: 'boards',
});

// Thought Schema
const ThoughtSchema = new Schema<Thought>({
  id: { type: String, required: true, unique: true },
  boardId: { type: String, required: true, index: true },
  type: { type: String, enum: ['Question', 'Hypothesis', 'Claim', 'Observation'], required: true },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  confidence: { type: Number, min: 0, max: 100 },
  status: {
    type: String,
    enum: ['Open', 'Investigating', 'Supported', 'Disproved', 'Parked', 'Conflicted'],
    default: 'Open'
  },
  tags: { type: [String], default: [] },
  owner: String,
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
}, {
  timestamps: true,
  collection: 'thoughts',
});

// Evidence Schema
const EntitySchema = new Schema<Entity>({
  type: { type: String, enum: ['domain', 'ip', 'email', 'handle', 'phone'], required: true },
  value: { type: String, required: true },
}, { _id: false });

const EvidenceSchema = new Schema<Evidence>({
  id: { type: String, required: true, unique: true },
  boardId: { type: String, required: true, index: true },
  type: {
    type: String,
    enum: ['Profiler', 'LinkAnalysis', 'URL', 'Note', 'CaseArtifact', 'SearchResult'],
    required: true
  },
  title: { type: String, required: true },
  summary: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
  reliability: { type: String, enum: ['Unknown', 'Low', 'Medium', 'High'], default: 'Unknown' },
  extractedEntities: { type: [EntitySchema], default: [] },
  rawPayload: Schema.Types.Mixed,
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  collection: 'evidence',
});

// Evidence Link Schema
const EvidenceLinkSchema = new Schema<EvidenceLink>({
  id: { type: String, required: true, unique: true },
  nodeId: { type: String, required: true, index: true },
  evidenceId: { type: String, required: true, index: true },
  relation: { type: String, enum: ['Supports', 'Contradicts', 'Context'], required: true },
  note: String,
  isKey: { type: Boolean, default: false },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  collection: 'evidence_links',
});

// Connection Schema
const ConnectionSchema = new Schema<Connection>({
  id: { type: String, required: true, unique: true },
  boardId: { type: String, required: true, index: true },
  sourceId: { type: String, required: true },
  targetId: { type: String, required: true },
  type: { type: String, enum: ['supports', 'contradicts', 'related'], required: true },
}, {
  timestamps: false,
  collection: 'connections',
});

// Comment Schema
const CommentSchema = new Schema<Comment>({
  id: { type: String, required: true, unique: true },
  thoughtId: { type: String, required: true, index: true },
  boardId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
}, {
  timestamps: true,
  collection: 'comments',
});

// Activity Entry Schema
const ActivityEntrySchema = new Schema<ActivityEntry>({
  id: { type: String, required: true, unique: true },
  boardId: { type: String, required: true, index: true },
  type: { 
    type: String, 
    enum: ['thought_created', 'evidence_attached', 'status_changed', 'confidence_changed', 'export_created', 'comment_added'],
    required: true 
  },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  details: Schema.Types.Mixed,
}, {
  timestamps: false,
  collection: 'activities',
});

// AI Action Schema
const AIActionSchema = new Schema<AIAction>({
  id: { type: String, required: true, unique: true },
  thoughtId: { type: String, required: true, index: true },
  text: { type: String, required: true },
  reason: { type: String, required: true },
  actionType: { type: String, enum: ['run', 'search', 'create', 'checklist'], required: true },
  completed: { type: Boolean, default: false },
}, {
  timestamps: false,
  collection: 'ai_actions',
});

// AI Insight Schema
const AIInsightSchema = new Schema<AIInsight>({
  id: { type: String, required: true, unique: true },
  thoughtId: { type: String, required: true, index: true },
  type: { type: String, enum: ['warning', 'pattern', 'contradiction'], required: true },
  message: { type: String, required: true },
  actions: [{
    label: String,
    action: String,
  }],
}, {
  timestamps: false,
  collection: 'ai_insights',
});

// Create indexes
BoardSchema.index({ createdBy: 1, status: 1 });
ThoughtSchema.index({ boardId: 1, status: 1 });
ThoughtSchema.index({ boardId: 1, type: 1 });
EvidenceSchema.index({ boardId: 1, type: 1 });
EvidenceLinkSchema.index({ nodeId: 1, relation: 1 });
ConnectionSchema.index({ boardId: 1, sourceId: 1 });
ConnectionSchema.index({ boardId: 1, targetId: 1 });
ActivityEntrySchema.index({ boardId: 1, timestamp: -1 });

// Export Models
export const BoardModel: Model<Board> = models.Board || mongoose.model<Board>('Board', BoardSchema);
export const ThoughtModel: Model<Thought> = models.Thought || mongoose.model<Thought>('Thought', ThoughtSchema);
export const EvidenceModel: Model<Evidence> = models.Evidence || mongoose.model<Evidence>('Evidence', EvidenceSchema);
export const EvidenceLinkModel: Model<EvidenceLink> = models.EvidenceLink || mongoose.model<EvidenceLink>('EvidenceLink', EvidenceLinkSchema);
export const ConnectionModel: Model<Connection> = models.Connection || mongoose.model<Connection>('Connection', ConnectionSchema);
export const CommentModel: Model<Comment> = models.Comment || mongoose.model<Comment>('Comment', CommentSchema);
export const ActivityEntryModel: Model<ActivityEntry> = models.ActivityEntry || mongoose.model<ActivityEntry>('ActivityEntry', ActivityEntrySchema);
export const AIActionModel: Model<AIAction> = models.AIAction || mongoose.model<AIAction>('AIAction', AIActionSchema);
export const AIInsightModel: Model<AIInsight> = models.AIInsight || mongoose.model<AIInsight>('AIInsight', AIInsightSchema);
