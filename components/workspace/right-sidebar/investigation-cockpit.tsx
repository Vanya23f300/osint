'use client';

import { useState } from 'react';
import {
  Plus,
  Sparkles,
  MessageSquare,
  Link2,
  CheckCircle,
  XCircle,
  ChevronDown,
  ClipboardPaste,
  Import,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useBoardStore } from '@/lib/store';
import type { Thought, ThoughtType, ThoughtStatus } from '@/types';
import { EvidenceSection } from './sections/evidence-section';
import { AIGuidanceSection } from './sections/ai-guidance-section';
import { DiscussionSection } from './sections/discussion-section';

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Sparkles className="w-6 h-6 text-primary" />
      </div>
      <h3 className="font-semibold mb-2">Start your investigation</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        Select a thought from the canvas or create a new one to begin working.
      </p>
      <div className="space-y-2 w-full max-w-xs">
        <Button variant="outline" className="w-full justify-start gap-2">
          <Plus className="w-4 h-4" />
          Quick add Thought
        </Button>
        <Button variant="outline" className="w-full justify-start gap-2">
          <ClipboardPaste className="w-4 h-4" />
          Paste lead
        </Button>
        <Button variant="outline" className="w-full justify-start gap-2">
          <Import className="w-4 h-4" />
          Import from case
        </Button>
      </div>
    </div>
  );
}

function ThoughtSection({ thought }: { thought: Thought }) {
  const [isOpen, setIsOpen] = useState(true);
  const { updateThought } = useBoardStore();

  const thoughtTypes: { value: ThoughtType; label: string }[] = [
    { value: 'Question', label: 'Question' },
    { value: 'Hypothesis', label: 'Hypothesis' },
    { value: 'Claim', label: 'Claim' },
    { value: 'Observation', label: 'Observation' },
  ];

  const statusOptions: { value: ThoughtStatus; label: string }[] = [
    { value: 'Open', label: 'Open' },
    { value: 'Investigating', label: 'Investigating' },
    { value: 'Supported', label: 'Supported' },
    { value: 'Disproved', label: 'Disproved' },
    { value: 'Parked', label: 'Parked' },
  ];

  const showConfidence = thought.type === 'Hypothesis' || thought.type === 'Claim';

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-secondary/50 transition-colors">
        <span className="font-medium text-sm">Thought</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-3 pt-0 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select
                value={thought.type}
                onValueChange={(value) =>
                  updateThought(thought.id, { type: value as ThoughtType })
                }
              >
                <SelectTrigger className="bg-input border-border h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {thoughtTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select
                value={thought.status}
                onValueChange={(value) =>
                  updateThought(thought.id, { status: value as ThoughtStatus })
                }
              >
                <SelectTrigger className="bg-input border-border h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Title</Label>
            <Input
              value={thought.title}
              onChange={(e) => updateThought(thought.id, { title: e.target.value })}
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Body</Label>
            <Textarea
              value={thought.body}
              onChange={(e) => updateThought(thought.id, { body: e.target.value })}
              className="bg-input border-border resize-none min-h-[80px]"
            />
          </div>

          {showConfidence && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Confidence</Label>
                <span className="text-xs text-muted-foreground">
                  {thought.confidence}%
                </span>
              </div>
              <Slider
                value={[thought.confidence || 50]}
                onValueChange={([value]) =>
                  updateThought(thought.id, { confidence: value })
                }
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">Tags</Label>
            <div className="flex flex-wrap gap-1">
              {thought.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs bg-secondary"
                >
                  {tag}
                </Badge>
              ))}
              <button
                type="button"
                className="px-2 py-0.5 text-xs border border-dashed border-border rounded hover:border-primary transition-colors"
              >
                + Add tag
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              <Link2 className="w-3 h-3" />
              Create linked thought
            </Button>
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              <Plus className="w-3 h-3" />
              Add connection
            </Button>
          </div>

          {/* Status actions for Lead role */}
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1 text-xs bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
            >
              <CheckCircle className="w-3 h-3" />
              Mark Supported
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1 text-xs bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300"
            >
              <XCircle className="w-3 h-3" />
              Mark Disproved
            </Button>
          </div>

          <div className="text-[10px] text-muted-foreground pt-2 border-t border-border">
            Created by {thought.createdBy} on{' '}
            {new Date(thought.createdAt).toLocaleDateString()}
            <br />
            Last updated {new Date(thought.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function InvestigationCockpit() {
  const { selectedThoughtId, getThoughtById } = useBoardStore();
  const [activeTab, setActiveTab] = useState<'evidence' | 'ai' | 'discussion'>('evidence');
  
  const selectedThought = selectedThoughtId ? getThoughtById(selectedThoughtId) : null;

  if (!selectedThought) {
    return (
      <div className="w-96 border-l border-border bg-card flex flex-col">
        <div className="p-3 border-b border-border">
          <h2 className="font-semibold">Investigation Cockpit</h2>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="w-96 min-w-96 max-w-96 border-l border-border bg-card flex flex-col overflow-hidden flex-shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-border shrink-0">
        <h2 className="font-semibold">Investigation Cockpit</h2>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Section 1: Thought */}
        <div className="border-b border-border">
          <ThoughtSection thought={selectedThought} />
        </div>

        {/* Tabs for Evidence/AI/Discussion */}
        <div className="border-b border-border">
          <div className="flex">
            <button
              type="button"
              onClick={() => setActiveTab('evidence')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm transition-colors border-b-2 ${
                activeTab === 'evidence'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Plus className="w-4 h-4" />
              Evidence
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm transition-colors border-b-2 ${
                activeTab === 'ai'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Guidance
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('discussion')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm transition-colors border-b-2 ${
                activeTab === 'discussion'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Discussion
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="p-3">
          {activeTab === 'evidence' && <EvidenceSection thought={selectedThought} />}
          {activeTab === 'ai' && <AIGuidanceSection thought={selectedThought} />}
          {activeTab === 'discussion' && <DiscussionSection thought={selectedThought} />}
        </div>
      </div>
    </div>
  );
}
