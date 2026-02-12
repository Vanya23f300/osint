import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Board,
  Thought,
  Evidence,
  EvidenceLink,
  Connection,
  Comment,
  ActivityEntry,
  UserRole,
  AIAction,
  AIInsight,
  EvidenceRelation,
} from '@/types';

interface BoardStore {
  // Current board state
  currentBoard: Board | null;
  thoughts: Thought[];
  evidence: Evidence[];
  evidenceLinks: EvidenceLink[];
  connections: Connection[];
  comments: Comment[];
  activities: ActivityEntry[];
  aiActions: AIAction[];
  aiInsights: AIInsight[];
  
  // UI state
  selectedThoughtId: string | null;
  sidebarOpen: boolean;
  currentUserRole: UserRole;
  
  // Board actions
  setCurrentBoard: (board: Board) => void;
  updateBoard: (updates: Partial<Board>) => void;
  
  // Thought actions
  addThought: (thought: Thought) => void;
  updateThought: (id: string, updates: Partial<Thought>) => void;
  deleteThought: (id: string) => void;
  selectThought: (id: string | null) => void;
  
  // Evidence actions
  addEvidence: (evidence: Evidence) => void;
  updateEvidence: (id: string, updates: Partial<Evidence>) => void;
  deleteEvidence: (id: string) => void;
  
  // Evidence Link actions
  addEvidenceLink: (link: EvidenceLink) => void;
  updateEvidenceLink: (id: string, updates: Partial<EvidenceLink>) => void;
  deleteEvidenceLink: (id: string) => void;
  reclassifyEvidenceLink: (id: string, relation: EvidenceRelation) => void;
  
  // Connection actions
  addConnection: (connection: Connection) => void;
  deleteConnection: (id: string) => void;
  
  // Comment actions
  addComment: (comment: Comment) => void;
  updateComment: (id: string, updates: Partial<Comment>) => void;
  deleteComment: (id: string) => void;
  
  // Activity actions
  addActivity: (activity: ActivityEntry) => void;
  
  // AI actions
  addAIAction: (action: AIAction) => void;
  updateAIAction: (id: string, updates: Partial<AIAction>) => void;
  addAIInsight: (insight: AIInsight) => void;
  
  // UI actions
  setSidebarOpen: (open: boolean) => void;
  setCurrentUserRole: (role: UserRole) => void;
  
  // Computed/derived getters
  getThoughtById: (id: string) => Thought | undefined;
  getEvidenceForThought: (thoughtId: string) => Array<Evidence & { link: EvidenceLink }>;
  getEvidenceLinksForThought: (thoughtId: string) => EvidenceLink[];
  getCommentsForThought: (thoughtId: string) => Comment[];
  getConflictedThoughts: () => Thought[];
  getConnectionsForThought: (thoughtId: string) => Connection[];
  getAIActionsForThought: (thoughtId: string) => AIAction[];
  getAIInsightsForThought: (thoughtId: string) => AIInsight[];
}

export const useBoardStore = create<BoardStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentBoard: null,
      thoughts: [],
      evidence: [],
      evidenceLinks: [],
      connections: [],
      comments: [],
      activities: [],
      aiActions: [],
      aiInsights: [],
      selectedThoughtId: null,
      sidebarOpen: true,
      currentUserRole: 'Editor',
      
      // Board actions
      setCurrentBoard: (board) => set({ currentBoard: board }),
      
      updateBoard: (updates) => set((state) => ({
        currentBoard: state.currentBoard ? { ...state.currentBoard, ...updates } : null,
      })),
      
      // Thought actions
      addThought: (thought) => set((state) => ({
        thoughts: [...state.thoughts, thought],
        activities: [
          ...state.activities,
          {
            id: `activity-${Date.now()}`,
            boardId: thought.boardId,
            type: 'thought_created',
            userId: thought.createdBy,
            userName: 'Current User',
            timestamp: new Date(),
            details: { thoughtId: thought.id, thoughtTitle: thought.title },
          },
        ],
      })),
      
      updateThought: (id, updates) => set((state) => ({
        thoughts: state.thoughts.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
        ),
      })),
      
      deleteThought: (id) => set((state) => ({
        thoughts: state.thoughts.filter((t) => t.id !== id),
        evidenceLinks: state.evidenceLinks.filter((el) => el.nodeId !== id),
        comments: state.comments.filter((c) => c.thoughtId !== id),
        connections: state.connections.filter(
          (c) => c.sourceId !== id && c.targetId !== id
        ),
        selectedThoughtId: state.selectedThoughtId === id ? null : state.selectedThoughtId,
      })),
      
      selectThought: (id) => set({ selectedThoughtId: id }),
      
      // Evidence actions
      addEvidence: (evidence) => set((state) => ({
        evidence: [...state.evidence, evidence],
      })),
      
      updateEvidence: (id, updates) => set((state) => ({
        evidence: state.evidence.map((e) =>
          e.id === id ? { ...e, ...updates } : e
        ),
      })),
      
      deleteEvidence: (id) => set((state) => ({
        evidence: state.evidence.filter((e) => e.id !== id),
        evidenceLinks: state.evidenceLinks.filter((el) => el.evidenceId !== id),
      })),
      
      // Evidence Link actions
      addEvidenceLink: (link) => set((state) => ({
        evidenceLinks: [...state.evidenceLinks, link],
        activities: [
          ...state.activities,
          {
            id: `activity-${Date.now()}`,
            boardId: state.currentBoard?.id || '',
            type: 'evidence_attached',
            userId: link.createdBy,
            userName: 'Current User',
            timestamp: new Date(),
            details: {
              evidenceId: link.evidenceId,
              nodeId: link.nodeId,
              relation: link.relation,
            },
          },
        ],
      })),
      
      updateEvidenceLink: (id, updates) => set((state) => ({
        evidenceLinks: state.evidenceLinks.map((el) =>
          el.id === id ? { ...el, ...updates } : el
        ),
      })),
      
      deleteEvidenceLink: (id) => set((state) => ({
        evidenceLinks: state.evidenceLinks.filter((el) => el.id !== id),
      })),
      
      reclassifyEvidenceLink: (id, relation) => set((state) => ({
        evidenceLinks: state.evidenceLinks.map((el) =>
          el.id === id ? { ...el, relation } : el
        ),
      })),
      
      // Connection actions
      addConnection: (connection) => set((state) => ({
        connections: [...state.connections, connection],
      })),
      
      deleteConnection: (id) => set((state) => ({
        connections: state.connections.filter((c) => c.id !== id),
      })),
      
      // Comment actions
      addComment: (comment) => set((state) => ({
        comments: [...state.comments, comment],
        activities: [
          ...state.activities,
          {
            id: `activity-${Date.now()}`,
            boardId: comment.boardId,
            type: 'comment_added',
            userId: comment.userId,
            userName: comment.userName,
            timestamp: new Date(),
            details: { commentId: comment.id, thoughtId: comment.thoughtId },
          },
        ],
      })),
      
      updateComment: (id, updates) => set((state) => ({
        comments: state.comments.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      })),
      
      deleteComment: (id) => set((state) => ({
        comments: state.comments.filter((c) => c.id !== id),
      })),
      
      // Activity actions
      addActivity: (activity) => set((state) => ({
        activities: [...state.activities, activity],
      })),
      
      // AI actions
      addAIAction: (action) => set((state) => ({
        aiActions: [...state.aiActions, action],
      })),
      
      updateAIAction: (id, updates) => set((state) => ({
        aiActions: state.aiActions.map((a) =>
          a.id === id ? { ...a, ...updates } : a
        ),
      })),
      
      addAIInsight: (insight) => set((state) => ({
        aiInsights: [...state.aiInsights, insight],
      })),
      
      // UI actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setCurrentUserRole: (role) => set({ currentUserRole: role }),
      
      // Getters
      getThoughtById: (id) => {
        return get().thoughts.find((t) => t.id === id);
      },
      
      getEvidenceForThought: (thoughtId) => {
        const { evidence, evidenceLinks } = get();
        console.log('Getting evidence for thought:', thoughtId);
        console.log('Total evidence:', evidence.length);
        console.log('Total evidenceLinks:', evidenceLinks.length);
        const links = evidenceLinks.filter((el) => el.nodeId === thoughtId);
        console.log('Links for this thought:', links.length);
        return links.map((link) => {
          const ev = evidence.find((e) => e.id === link.evidenceId);
          if (!ev) return null;
          return { ...ev, link };
        }).filter(Boolean) as Array<Evidence & { link: EvidenceLink }>;
      },
      
      getEvidenceLinksForThought: (thoughtId) => {
        return get().evidenceLinks.filter((el) => el.nodeId === thoughtId);
      },
      
      getCommentsForThought: (thoughtId) => {
        return get().comments.filter((c) => c.thoughtId === thoughtId);
      },
      
      getConflictedThoughts: () => {
        const { thoughts, evidenceLinks } = get();
        return thoughts.filter((thought) => {
          const links = evidenceLinks.filter((el) => el.nodeId === thought.id);
          const hasSupporting = links.some((el) => el.relation === 'Supports');
          const hasContradicting = links.some((el) => el.relation === 'Contradicts');
          return hasSupporting && hasContradicting;
        });
      },
      
      getConnectionsForThought: (thoughtId) => {
        return get().connections.filter(
          (c) => c.sourceId === thoughtId || c.targetId === thoughtId
        );
      },
      
      getAIActionsForThought: (thoughtId) => {
        return get().aiActions.filter((a) => a.thoughtId === thoughtId);
      },
      
      getAIInsightsForThought: (thoughtId) => {
        return get().aiInsights.filter((i) => i.thoughtId === thoughtId);
      },
    }),
    {
      name: 'osint-board-storage',
    }
  )
);
