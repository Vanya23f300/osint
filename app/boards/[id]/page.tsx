'use client';

import { useParams } from 'next/navigation';
import { useBoardStore } from '@/lib/store';
import { TopBar } from '@/components/workspace/top-bar';
import { BoardCanvas } from '@/components/workspace/canvas/board-canvas';
import { InvestigationCockpit } from '@/components/workspace/right-sidebar/investigation-cockpit';

export default function BoardWorkspacePage() {
  const params = useParams();
  const boardId = params.id as string;
  const { currentBoard, sidebarOpen } = useBoardStore();

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
        {/* Canvas */}
        <div className="flex-1 relative">
          <BoardCanvas />
        </div>

        {/* Right Sidebar - Investigation Cockpit */}
        {sidebarOpen && (
          <div className="w-[420px] min-w-[420px] max-w-[420px] border-l bg-card overflow-hidden flex-shrink-0">
            <InvestigationCockpit />
          </div>
        )}
      </div>
    </div>
  );
}
