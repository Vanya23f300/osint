'use client';

import { useState } from 'react';
import { Link2, CheckCircle2, XCircle } from 'lucide-react';
import { CreateThoughtModal } from '@/components/modals/create-thought-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Thought, ThoughtType, ThoughtStatus } from '@/types';
import { useBoardStore } from '@/lib/store';
import { format } from 'date-fns';

interface ThoughtSectionProps {
  thought: Thought;
}

export function ThoughtSection({ thought }: ThoughtSectionProps) {
  const { updateThought, currentUserRole, getEvidenceForThought } = useBoardStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const evidence = getEvidenceForThought(thought.id);
  const supportingEvidence = evidence.filter((e) => e.link.relation === 'Supports');
  const contradictingEvidence = evidence.filter((e) => e.link.relation === 'Contradicts');
  const hasKeySupporting = supportingEvidence.some((e) => e.link.isKey);
  const isConflicted = supportingEvidence.length > 0 && contradictingEvidence.length > 0;

  const handleUpdate = (updates: Partial<Thought>) => {
    updateThought(thought.id, updates);
  };

  const handleStatusChange = (status: ThoughtStatus) => {
    if (status === 'Supported' && !hasKeySupporting) {
      alert('Mark at least one supporting evidence as Key before marking as Supported');
      return;
    }
    handleUpdate({ status });
  };

  const showConfidenceSlider = thought.type === 'Hypothesis' || thought.type === 'Claim';

  return (
    <div className="border-b px-4 py-4 pr-6 space-y-4 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between w-full pr-2">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">
          Thought Details
        </h2>
        {isConflicted && (
          <Badge variant="destructive" className="text-xs">
            Conflicted
          </Badge>
        )}
      </div>

      {/* Type Selector */}
      <div className="space-y-2 w-full">
        <Label htmlFor="type">Type</Label>
        <Select
          value={thought.type}
          onValueChange={(value) => handleUpdate({ type: value as ThoughtType })}
          disabled={currentUserRole === 'Viewer'}
        >
          <SelectTrigger id="type" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-50 bg-popover">
            <SelectItem value="Question">Question</SelectItem>
            <SelectItem value="Hypothesis">Hypothesis</SelectItem>
            <SelectItem value="Claim">Claim</SelectItem>
            <SelectItem value="Observation">Observation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Title */}
      <div className="space-y-2 w-full">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={thought.title}
          onChange={(e) => handleUpdate({ title: e.target.value })}
          disabled={currentUserRole === 'Viewer'}
          className="w-full"
        />
      </div>

      {/* Body */}
      <div className="space-y-2 w-full">
        <Label htmlFor="body">Description</Label>
        <Textarea
          id="body"
          value={thought.body}
          onChange={(e) => handleUpdate({ body: e.target.value })}
          rows={4}
          disabled={currentUserRole === 'Viewer'}
          className="w-full resize-none"
        />
      </div>

      {/* Status */}
      <div className="space-y-2 w-full">
        <Label htmlFor="status">Status</Label>
        <Select
          value={thought.status}
          onValueChange={(value) => handleStatusChange(value as ThoughtStatus)}
          disabled={currentUserRole === 'Viewer'}
        >
          <SelectTrigger id="status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-50 bg-popover">
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Investigating">Investigating</SelectItem>
            <SelectItem value="Supported">Supported</SelectItem>
            <SelectItem value="Disproved">Disproved</SelectItem>
            <SelectItem value="Parked">Parked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Confidence Slider (only for Hypothesis/Claim) */}
      {showConfidenceSlider && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Confidence</Label>
            <span className="text-sm font-medium">{thought.confidence || 50}%</span>
          </div>
          <Slider
            value={[thought.confidence || 50]}
            onValueChange={([value]) => handleUpdate({ confidence: value })}
            max={100}
            step={5}
            disabled={currentUserRole === 'Viewer'}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>
      )}

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2">
          {thought.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          disabled={currentUserRole === 'Viewer'}
          onClick={() => setShowCreateModal(true)}
        >
          <Link2 className="mr-2 h-4 w-4" />
          Create Linked Thought
        </Button>
        
        {currentUserRole === 'Lead' && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleStatusChange('Supported')}
              disabled={!hasKeySupporting}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark Supported
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleStatusChange('Disproved')}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Mark Disproved
            </Button>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div>Created by {thought.createdBy} • {format(new Date(thought.createdAt), 'MMM d, yyyy')}</div>
        <div>Updated {format(new Date(thought.updatedAt), 'MMM d, yyyy')}</div>
      </div>

      {/* Create Linked Thought Modal */}
      <CreateThoughtModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        parentThoughtId={thought.id}
      />
    </div>
  );
}
