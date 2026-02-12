'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Plus, Upload, Download, Users, ChevronLeft } from 'lucide-react';
import { CreateThoughtModal } from '@/components/modals/create-thought-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBoardStore } from '@/lib/store';

export function TopBar() {
  const router = useRouter();
  const { currentBoard, currentUserRole } = useBoardStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateThoughtModal, setShowCreateThoughtModal] = useState(false);

  if (!currentBoard) return null;

  return (
    <div className="border-b bg-card">
      <div className="flex h-14 items-center gap-4 px-4">
        {/* Left Section */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/boards')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-lg font-semibold truncate">
              {currentBoard.title}
            </h1>
            <Badge variant="secondary" className="shrink-0">
              {currentBoard.status}
            </Badge>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search thoughts, evidence, comments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>All Types</DropdownMenuItem>
              <DropdownMenuItem>Questions</DropdownMenuItem>
              <DropdownMenuItem>Hypotheses</DropdownMenuItem>
              <DropdownMenuItem>Claims</DropdownMenuItem>
              <DropdownMenuItem>Observations</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Presence Avatars */}
          <div className="flex -space-x-2">
            {currentBoard.members.slice(0, 3).map((member) => (
              <Avatar key={member.userId} className="h-8 w-8 border-2 border-background">
                <AvatarFallback className="text-xs">
                  {member.avatar}
                </AvatarFallback>
              </Avatar>
            ))}
            {currentBoard.members.length > 3 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                +{currentBoard.members.length - 3}
              </div>
            )}
          </div>

          <Button variant="outline" size="sm">
            <Users className="mr-2 h-4 w-4" />
            Invite
          </Button>

          <div className="h-4 w-px bg-border" />

          <Button size="sm" onClick={() => setShowCreateThoughtModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Thought
          </Button>

          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Attach Evidence
          </Button>

          <Button variant="outline" size="sm" onClick={() => router.push(`/boards/${currentBoard.id}/export`)}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Create Thought Modal */}
      <CreateThoughtModal
        open={showCreateThoughtModal}
        onOpenChange={setShowCreateThoughtModal}
      />
    </div>
  );
}
