import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { thoughtsApi, evidenceApi, evidenceLinksApi, connectionsApi } from '@/lib/api-client';
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
      addThought: async (thought) => {
        // Optimistic update
        set((state) => ({
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
        }));
        
        // Sync with API
        try {
          await thoughtsApi.create(thought);
        } catch (error) {
          console.error('Failed to create thought:', error);
          // Rollback on error
          set((state) => ({
            thoughts: state.thoughts.filter((t) => t.id !== thought.id),
          }));
        }
      },
      
      updateThought: async (id, updates) => {
        // Optimistic update
        set((state) => ({
          thoughts: state.thoughts.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
          ),
        }));
        
        // Sync with API
        try {
          await thoughtsApi.update(id, updates);
        } catch (error) {
          console.error('Failed to update thought:', error);
        }
      },
      
      deleteThought: async (id) => {
        // Optimistic update
        set((state) => ({
          thoughts: state.thoughts.filter((t) => t.id !== id),
          evidenceLinks: state.evidenceLinks.filter((el) => el.nodeId !== id),
          comments: state.comments.filter((c) => c.thoughtId !== id),
          connections: state.connections.filter(
            (c) => c.sourceId !== id && c.targetId !== id
          ),
          selectedThoughtId: state.selectedThoughtId === id ? null : state.selectedThoughtId,
        }));
        
        // Sync with API
        try {
          await thoughtsApi.delete(id);
        } catch (error) {
          console.error('Failed to delete thought:', error);
        }
      },
      
      selectThought: (id) => set({ selectedThoughtId: id }),
      
      // Evidence actions
      addEvidence: async (evidence) => {
        // Optimistic update
        set((state) => ({
          evidence: [...state.evidence, evidence],
        }));
        
        // Sync with API
        try {
          await evidenceApi.create(evidence);
        } catch (error) {
          console.error('Failed to create evidence:', error);
          set((state) => ({
            evidence: state.evidence.filter((e) => e.id !== evidence.id),
          }));
        }
      },
      
      updateEvidence: async (id, updates) => {
        // Optimistic update
        set((state) => ({
          evidence: state.evidence.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        }));
        
        // Sync with API
        try {
          await evidenceApi.update(id, updates);
        } catch (error) {
          console.error('Failed to update evidence:', error);
        }
      },
      
      deleteEvidence: async (id) => {
        // Optimistic update
        set((state) => ({
          evidence: state.evidence.filter((e) => e.id !== id),
          evidenceLinks: state.evidenceLinks.filter((el) => el.evidenceId !== id),
        }));
        
        // Sync with API
        try {
          await evidenceApi.delete(id);
        } catch (error) {
          console.error('Failed to delete evidence:', error);
        }
      },
      
      // Evidence Link actions
      addEvidenceLink: async (link) => {
        // Optimistic update
        set((state) => ({
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
        }));
        
        // Sync with API
        try {
          await evidenceLinksApi.create(link);
        } catch (error) {
          console.error('Failed to create evidence link:', error);
          set((state) => ({
            evidenceLinks: state.evidenceLinks.filter((el) => el.id !== link.id),
          }));
        }
      },
      
      updateEvidenceLink: async (id, updates) => {
        // Optimistic update
        set((state) => ({
          evidenceLinks: state.evidenceLinks.map((el) =>
            el.id === id ? { ...el, ...updates } : el
          ),
        }));
        
        // Sync with API
        try {
          await evidenceLinksApi.update(id, updates);
        } catch (error) {
          console.error('Failed to update evidence link:', error);
        }
      },
      
      deleteEvidenceLink: async (id) => {
        // Optimistic update
        set((state) => ({
          evidenceLinks: state.evidenceLinks.filter((el) => el.id !== id),
        }));
        
        // Sync with API
        try {
          await evidenceLinksApi.delete(id);
        } catch (error) {
          console.error('Failed to delete evidence link:', error);
        }
      },
      
      reclassifyEvidenceLink: async (id, relation) => {
        // Optimistic update
        set((state) => ({
          evidenceLinks: state.evidenceLinks.map((el) =>
            el.id === id ? { ...el, relation } : el
          ),
        }));
        
        // Sync with API
        try {
          await evidenceLinksApi.update(id, { relation });
        } catch (error) {
          console.error('Failed to reclassify evidence link:', error);
        }
      },
      
      // Connection actions
      addConnection: async (connection) => {
        // Optimistic update
        set((state) => ({
          connections: [...state.connections, connection],
        }));
        
        // Sync with API
        try {
          await connectionsApi.create(connection);
        } catch (error) {
          console.error('Failed to create connection:', error);
          set((state) => ({
            connections: state.connections.filter((c) => c.id !== connection.id),
          }));
        }
      },
      
      deleteConnection: async (id) => {
        // Optimistic update
        set((state) => ({
          connections: state.connections.filter((c) => c.id !== id),
        }));
        
        // Sync with API
        try {
          await connectionsApi.delete(id);
        } catch (error) {
          console.error('Failed to delete connection:', error);
        }
      },
      
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
