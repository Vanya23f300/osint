import type {
  Board,
  Thought,
  Evidence,
  EvidenceLink,
  Connection,
  Comment,
  ActivityEntry,
} from '@/types';
import { seedBoard, seedThoughts, seedEvidence, seedEvidenceLinks, seedConnections, seedComments } from './seed-data';

// In-memory database
class InMemoryDB {
  private boards: Map<string, Board> = new Map();
  private thoughts: Map<string, Thought> = new Map();
  private evidence: Map<string, Evidence> = new Map();
  private evidenceLinks: Map<string, EvidenceLink> = new Map();
  private connections: Map<string, Connection> = new Map();
  private comments: Map<string, Comment> = new Map();
  private activities: Map<string, ActivityEntry> = new Map();

  constructor() {
    this.initializeSeedData();
  }

  private initializeSeedData() {
    // Load seed data
    this.boards.set(seedBoard.id, seedBoard);
    seedThoughts.forEach((t) => this.thoughts.set(t.id, t));
    seedEvidence.forEach((e) => this.evidence.set(e.id, e));
    seedEvidenceLinks.forEach((el) => this.evidenceLinks.set(el.id, el));
    seedConnections.forEach((c) => this.connections.set(c.id, c));
    seedComments.forEach((c) => this.comments.set(c.id, c));
  }

  // Board operations
  getAllBoards(): Board[] {
    return Array.from(this.boards.values());
  }

  getBoard(id: string): Board | undefined {
    return this.boards.get(id);
  }

  createBoard(board: Board): Board {
    this.boards.set(board.id, board);
    return board;
  }

  updateBoard(id: string, updates: Partial<Board>): Board | null {
    const board = this.boards.get(id);
    if (!board) return null;
    const updated = { ...board, ...updates, updatedAt: new Date() };
    this.boards.set(id, updated);
    return updated;
  }

  deleteBoard(id: string): boolean {
    return this.boards.delete(id);
  }

  // Thought operations
  getThoughtsByBoard(boardId: string): Thought[] {
    return Array.from(this.thoughts.values()).filter((t) => t.boardId === boardId);
  }

  getThought(id: string): Thought | undefined {
    return this.thoughts.get(id);
  }

  createThought(thought: Thought): Thought {
    this.thoughts.set(thought.id, thought);
    return thought;
  }

  updateThought(id: string, updates: Partial<Thought>): Thought | null {
    const thought = this.thoughts.get(id);
    if (!thought) return null;
    const updated = { ...thought, ...updates, updatedAt: new Date() };
    this.thoughts.set(id, updated);
    return updated;
  }

  deleteThought(id: string): boolean {
    // Also delete related evidence links and connections
    Array.from(this.evidenceLinks.values())
      .filter((el) => el.nodeId === id)
      .forEach((el) => this.evidenceLinks.delete(el.id));
    
    Array.from(this.connections.values())
      .filter((c) => c.sourceId === id || c.targetId === id)
      .forEach((c) => this.connections.delete(c.id));
    
    return this.thoughts.delete(id);
  }

  // Evidence operations
  getEvidenceByBoard(boardId: string): Evidence[] {
    return Array.from(this.evidence.values()).filter((e) => e.boardId === boardId);
  }

  getEvidence(id: string): Evidence | undefined {
    return this.evidence.get(id);
  }

  createEvidence(evidence: Evidence): Evidence {
    this.evidence.set(evidence.id, evidence);
    return evidence;
  }

  updateEvidence(id: string, updates: Partial<Evidence>): Evidence | null {
    const evidence = this.evidence.get(id);
    if (!evidence) return null;
    const updated = { ...evidence, ...updates };
    this.evidence.set(id, updated);
    return updated;
  }

  deleteEvidence(id: string): boolean {
    // Also delete related evidence links
    Array.from(this.evidenceLinks.values())
      .filter((el) => el.evidenceId === id)
      .forEach((el) => this.evidenceLinks.delete(el.id));
    
    return this.evidence.delete(id);
  }

  // Evidence Link operations
  getEvidenceLinksForNode(nodeId: string): EvidenceLink[] {
    return Array.from(this.evidenceLinks.values()).filter((el) => el.nodeId === nodeId);
  }

  getEvidenceLink(id: string): EvidenceLink | undefined {
    return this.evidenceLinks.get(id);
  }

  createEvidenceLink(link: EvidenceLink): EvidenceLink {
    this.evidenceLinks.set(link.id, link);
    return link;
  }

  updateEvidenceLink(id: string, updates: Partial<EvidenceLink>): EvidenceLink | null {
    const link = this.evidenceLinks.get(id);
    if (!link) return null;
    const updated = { ...link, ...updates };
    this.evidenceLinks.set(id, updated);
    return updated;
  }

  deleteEvidenceLink(id: string): boolean {
    return this.evidenceLinks.delete(id);
  }

  // Connection operations
  getConnectionsByBoard(boardId: string): Connection[] {
    return Array.from(this.connections.values()).filter((c) => c.boardId === boardId);
  }

  createConnection(connection: Connection): Connection {
    this.connections.set(connection.id, connection);
    return connection;
  }

  deleteConnection(id: string): boolean {
    return this.connections.delete(id);
  }

  // Comment operations
  getCommentsByThought(thoughtId: string): Comment[] {
    return Array.from(this.comments.values()).filter((c) => c.thoughtId === thoughtId);
  }

  createComment(comment: Comment): Comment {
    this.comments.set(comment.id, comment);
    return comment;
  }

  updateComment(id: string, updates: Partial<Comment>): Comment | null {
    const comment = this.comments.get(id);
    if (!comment) return null;
    const updated = { ...comment, ...updates };
    this.comments.set(id, updated);
    return updated;
  }

  deleteComment(id: string): boolean {
    return this.comments.delete(id);
  }

  // Activity operations
  getActivitiesByBoard(boardId: string): ActivityEntry[] {
    return Array.from(this.activities.values())
      .filter((a) => a.boardId === boardId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  createActivity(activity: ActivityEntry): ActivityEntry {
    this.activities.set(activity.id, activity);
    return activity;
  }
}

// Singleton instance
export const db = new InMemoryDB();
