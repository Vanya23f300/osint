'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Sparkles, Lightbulb } from 'lucide-react';
import { useBoardStore } from '@/lib/store';
import { boardsApi } from '@/lib/api-client';
import { TopBar } from '@/components/workspace/top-bar';
import { LeftSidebar } from '@/components/workspace/left-sidebar';
import { BoardCanvas } from '@/components/workspace/canvas/board-canvas';
import { InvestigationCockpit } from '@/components/workspace/right-sidebar/investigation-cockpit';

export default function BoardWorkspacePage() {
  const params = useParams();
  const boardId = params.id as string;
  const [loading, setLoading] = useState(true);
  const store = useBoardStore();
  const { currentBoard, sidebarOpen } = store;

  // Fetch board data from API
  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        const data = await boardsApi.getById(boardId);
        
        // Load all data into Zustand using the store's setState
        useBoardStore.setState({
          currentBoard: data.board,
          thoughts: data.thoughts,
          evidence: data.evidence,
          evidenceLinks: data.evidenceLinks,
          connections: data.connections,
        });
        
      } catch (error) {
        console.error('Failed to fetch board data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (boardId) {
      fetchBoardData();
    }
  }, [boardId]);

  // Demo: Show AI suggestion toast after 20 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      toast.custom((t) => (
        <div
          className="border border-emerald-500/30 rounded-xl p-4 shadow-2xl shadow-black/20 w-[300px]"
          style={{ backgroundColor: 'hsl(240 6% 12%)' }}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  NEW THOUGHT
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              </div>
              <p className="text-sm font-medium mb-2">
                Propose new hypothesis: Scam kit reuse
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Evidence suggests a shared scam kit template across multiple domains
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    toast.dismiss(t);
                    toast.success('Suggestion accepted!');
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-medium transition-colors"
                >
                  Review
                </button>
                <button
                  onClick={() => toast.dismiss(t)}
                  className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-xs font-medium transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2 pl-11">
            <Sparkles className="w-2.5 h-2.5" />
            <span>AI insight</span>
          </div>
        </div>
      ), {
        duration: 10000,
      });
    }, 20000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading board...</p>
      </div>
    );
  }

  if (!currentBoard || currentBoard.id !== boardId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Board not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Top Bar */}
      <TopBar />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar />
        
        {/* Canvas */}
        <div className="flex-1 relative">
          <BoardCanvas />
        </div>

        {/* Right Sidebar - Investigation Cockpit */}
        {sidebarOpen && <InvestigationCockpit />}
      </div>
    </div>
  );
}
