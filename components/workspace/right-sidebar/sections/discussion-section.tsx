'use client';

import { useState } from 'react';
import { MessageCircle, Send, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Thought } from '@/types';
import { useBoardStore } from '@/lib/store';
import { format } from 'date-fns';

interface DiscussionSectionProps {
  thought: Thought;
}

export function DiscussionSection({ thought }: DiscussionSectionProps) {
  const { getCommentsForThought, addComment, currentBoard } = useBoardStore();
  const [newComment, setNewComment] = useState('');
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiChatInput, setAiChatInput] = useState('');
  
  const comments = getCommentsForThought(thought.id);

  const handleAddComment = () => {
    if (!newComment.trim() || !currentBoard) return;

    addComment({
      id: `comment-${Date.now()}`,
      thoughtId: thought.id,
      boardId: currentBoard.id,
      userId: 'current-user',
      userName: 'Current User',
      content: newComment,
      createdAt: new Date(),
      resolved: false,
      isPinned: false,
    });

    setNewComment('');
  };

  const suggestedPrompts = [
    'What is missing to validate this?',
    'Summarize contradictions',
    'Propose alternate hypotheses',
    'Draft a cautious claim from current evidence',
  ];

  return (
    <div className="px-4 py-4 pr-6 space-y-4 w-full overflow-hidden">
      <div className="flex items-center justify-between pr-2">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">
          Discussion
        </h2>
        <Badge variant="secondary" className="text-xs">
          {comments.length}
        </Badge>
      </div>

      {/* Comments */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No comments yet. Start the discussion!
          </p>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="p-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground shrink-0">
                  {comment.userName.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{comment.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.createdAt), 'MMM d, HH:mm')}
                    </span>
                    {comment.isPinned && (
                      <Badge variant="secondary" className="text-xs">
                        Pinned
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Comment */}
      <div className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
        />
        <Button onClick={handleAddComment} size="sm" className="w-full">
          <Send className="mr-2 h-4 w-4" />
          Post Comment
        </Button>
      </div>

      <Separator />

      {/* AI Chat */}
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowAIChat(!showAIChat)}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Ask AI about this investigation
          {showAIChat ? (
            <ChevronUp className="ml-auto h-4 w-4" />
          ) : (
            <ChevronDown className="ml-auto h-4 w-4" />
          )}
        </Button>

        {showAIChat && (
          <div className="space-y-3">
            {/* Suggested Prompts */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Suggested prompts:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-1.5"
                    onClick={() => setAiChatInput(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>

            {/* Chat Input */}
            <div className="space-y-2">
              <Textarea
                placeholder="Ask AI anything about this thought..."
                value={aiChatInput}
                onChange={(e) => setAiChatInput(e.target.value)}
                rows={3}
              />
              <Button size="sm" className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                Ask AI
              </Button>
            </div>

            {/* Mock AI Response */}
            <Card className="p-3 bg-muted/50">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground shrink-0">
                  AI
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm">
                    This is a demo AI response. In a full implementation, this would provide contextual insights based on the selected thought and its evidence.
                  </p>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    Use as Thought
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
