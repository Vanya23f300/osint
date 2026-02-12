'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MessageCircle, Link2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Thought } from '@/types';
import { useBoardStore } from '@/lib/store';

export const ThoughtNode = memo(({ data }: NodeProps) => {
  const { getEvidenceForThought, getCommentsForThought } = useBoardStore();
  
  const thought = data as unknown as Thought;
  const evidence = getEvidenceForThought(thought.id);
  const comments = getCommentsForThought(thought.id);
  
  const supportCount = evidence.filter((e) => e.link.relation === 'Supports').length;
  const contradictCount = evidence.filter((e) => e.link.relation === 'Contradicts').length;
  const contextCount = evidence.filter((e) => e.link.relation === 'Context').length;

  const getTypeColor = (type: Thought['type']) => {
    switch (type) {
      case 'Question':
        return 'bg-blue-500';
      case 'Hypothesis':
        return 'bg-purple-500';
      case 'Claim':
        return 'bg-green-500';
      case 'Observation':
        return 'bg-amber-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getStatusVariant = (status: Thought['status']) => {
    switch (status) {
      case 'Supported':
        return 'default';
      case 'Disproved':
        return 'destructive';
      case 'Conflicted':
        return 'destructive';
      case 'Investigating':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="w-72 shadow-lg hover:shadow-xl transition-shadow">
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-2">
          <div className={`h-2 w-2 rounded-full mt-2 ${getTypeColor(thought.type)}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-muted-foreground">
                {thought.type}
              </span>
              <Badge variant={getStatusVariant(thought.status)} className="text-xs">
                {thought.status}
              </Badge>
            </div>
            <h3 className="font-semibold text-sm leading-tight line-clamp-2">
              {thought.title}
            </h3>
          </div>
        </div>

        {/* Confidence (for Hypothesis and Claim) */}
        {(thought.type === 'Hypothesis' || thought.type === 'Claim') && thought.confidence !== undefined && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Confidence</span>
              <span className="font-medium">{thought.confidence}%</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${thought.confidence}%` }}
              />
            </div>
          </div>
        )}

        {/* Evidence Summary */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-green-600 font-medium">S:{supportCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-red-600 font-medium">C:{contradictCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-600 font-medium">Ctx:{contextCount}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <MessageCircle className="h-3 w-3" />
            <span>{comments.length}</span>
          </button>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Link2 className="h-3 w-3" />
          </button>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto">
            <Sparkles className="h-3 w-3" />
            <span>AI</span>
          </button>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </Card>
  );
});

ThoughtNode.displayName = 'ThoughtNode';
