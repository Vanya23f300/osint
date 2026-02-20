'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBoardStore } from '@/lib/store';
import { boardsApi } from '@/lib/api-client';
import { format } from 'date-fns';

export default function BoardsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [boards, setBoards] = useState<any[]>([]);
  const { setCurrentBoard } = useBoardStore();

  // Fetch boards from API
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const data = await boardsApi.getAll();
        setBoards(data.boards);
      } catch (error) {
        console.error('Failed to fetch boards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  const handleOpenBoard = (boardId: string) => {
    router.push(`/boards/${boardId}`);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading boards...</p>
      </div>
    );
  }

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
          {boards.map((board) => (
            <Card
              key={board.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleOpenBoard(board.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5" />
                      {board.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {board.members.length} members
                    </CardDescription>
                  </div>
                  <Badge variant={board.status === 'Active' ? 'default' : 'secondary'}>
                    {board.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{format(new Date(board.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Updated:</span>
                    <span>{format(new Date(board.updatedAt), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    {board.members.map((member: any) => (
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
          ))}

          {/* Empty state if no boards */}
          {boards.length === 0 && !loading && (
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
