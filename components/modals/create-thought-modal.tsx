'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import type { ThoughtType } from '@/types';
import { useBoardStore } from '@/lib/store';

interface CreateThoughtModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentThoughtId?: string;
}

export function CreateThoughtModal({ open, onOpenChange, parentThoughtId }: CreateThoughtModalProps) {
  const { addThought, currentBoard, addConnection } = useBoardStore();
  const [type, setType] = useState<ThoughtType>('Question');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [confidence, setConfidence] = useState(50);

  const showConfidence = type === 'Hypothesis' || type === 'Claim';

  const handleCreate = () => {
    if (!title.trim() || !currentBoard) return;

    const newThought = {
      id: `thought-${Date.now()}`,
      boardId: currentBoard.id,
      type,
      title: title.trim(),
      body: body.trim(),
      confidence: showConfidence ? confidence : undefined,
      status: 'Open' as const,
      tags: [],
      createdBy: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date(),
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
    };

    addThought(newThought);

    // If this is a linked thought, create a connection
    if (parentThoughtId) {
      addConnection({
        id: `connection-${Date.now()}`,
        boardId: currentBoard.id,
        sourceId: parentThoughtId,
        targetId: newThought.id,
        type: 'related',
      });
    }

    // Reset form
    setTitle('');
    setBody('');
    setConfidence(50);
    setType('Question');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {parentThoughtId ? 'Create Linked Thought' : 'Create New Thought'}
          </DialogTitle>
          <DialogDescription>
            Add a new thought to your investigation board
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="thought-type">Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as ThoughtType)}>
              <SelectTrigger id="thought-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Question">Question</SelectItem>
                <SelectItem value="Hypothesis">Hypothesis</SelectItem>
                <SelectItem value="Claim">Claim</SelectItem>
                <SelectItem value="Observation">Observation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="thought-title">Title</Label>
            <Input
              id="thought-title"
              placeholder="Enter thought title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="thought-body">Description (optional)</Label>
            <Textarea
              id="thought-body"
              placeholder="Add details..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
            />
          </div>

          {/* Confidence (only for Hypothesis/Claim) */}
          {showConfidence && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Initial Confidence</Label>
                <span className="text-sm font-medium">{confidence}%</span>
              </div>
              <Slider
                value={[confidence]}
                onValueChange={([value]) => setConfidence(value)}
                max={100}
                step={5}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!title.trim()}>
            {parentThoughtId ? 'Create & Link' : 'Create Thought'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
