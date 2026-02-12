'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBoardStore } from '@/lib/store';
import { seedBoard, seedThoughts, seedEvidence, seedEvidenceLinks, seedConnections, seedComments, seedAIActions, seedAIInsights } from '@/lib/seed-data';
import { format } from 'date-fns';

export default function BoardsPage() {
  const router = useRouter();
  const { currentBoard, setCurrentBoard, thoughts, addThought, addEvidence, addEvidenceLink, addConnection, addComment, addAIAction, addAIInsight } = useBoardStore();

  // Initialize with seed data if no board exists
  useEffect(() => {
    if (!currentBoard && thoughts.length === 0) {
      setCurrentBoard(seedBoard);
      seedThoughts.forEach(addThought);
      seedEvidence.forEach(addEvidence);
      seedEvidenceLinks.forEach(addEvidenceLink);
      seedConnections.forEach(addConnection);
      seedComments.forEach(addComment);
      seedAIActions.forEach(addAIAction);
      seedAIInsights.forEach(addAIInsight);
    }
  }, [currentBoard, thoughts.length, setCurrentBoard, addThought, addEvidence, addEvidenceLink, addConnection, addComment, addAIAction, addAIInsight]);

  const handleOpenBoard = () => {
    if (currentBoard) {
      router.push(`/boards/${currentBoard.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Investigation Boards</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Collaborative OSINT investigation workspace
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Board
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {currentBoard && (
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={handleOpenBoard}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5" />
                      {currentBoard.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {thoughts.length} thoughts • {currentBoard.members.length} members
                    </CardDescription>
                  </div>
                  <Badge variant={currentBoard.status === 'Active' ? 'default' : 'secondary'}>
                    {currentBoard.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{format(new Date(currentBoard.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Updated:</span>
                    <span>{format(new Date(currentBoard.updatedAt), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    {currentBoard.members.map((member) => (
                      <div
                        key={member.userId}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground"
                        title={member.name}
                      >
                        {member.avatar}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty state if no boards */}
          {!currentBoard && (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No boards yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first investigation board to get started
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Board
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
