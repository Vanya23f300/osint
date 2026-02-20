'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Clock,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Lightbulb,
  Eye,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useBoardStore } from '@/lib/store';
import type { Thought } from '@/types';

export function LeftSidebar() {
  const { thoughts, selectedThoughtId, selectThought } = useBoardStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline'>('overview');

  const openThoughts = thoughts.filter(
    (t) => t.status === 'Open' || t.status === 'Investigating'
  );
  const conflictedThoughts = thoughts.filter((t) => t.status === 'Conflicted');
  const supportedThoughts = thoughts.filter((t) => t.status === 'Supported');
  const disprovedThoughts = thoughts.filter((t) => t.status === 'Disproved');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Question':
        return HelpCircle;
      case 'Hypothesis':
        return Lightbulb;
      case 'Claim':
        return CheckCircle;
      case 'Observation':
        return Eye;
      default:
        return HelpCircle;
    }
  };

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col h-full">
      {/* Navigation tabs */}
      <div className="p-2 border-b border-border">
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
              activeTab === 'overview'
                ? 'bg-background text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
              activeTab === 'timeline'
                ? 'bg-background text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="w-4 h-4" />
            Timeline
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'overview' ? (
          <div className="space-y-4">
            {/* Board stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-secondary rounded-lg p-3">
                <div className="text-2xl font-semibold">{openThoughts.length}</div>
                <div className="text-xs text-muted-foreground">Open</div>
              </div>
              <div className="bg-amber-500/10 rounded-lg p-3">
                <div className="text-2xl font-semibold text-amber-400">
                  {conflictedThoughts.length}
                </div>
                <div className="text-xs text-muted-foreground">Conflicted</div>
              </div>
              <div className="bg-emerald-500/10 rounded-lg p-3">
                <div className="text-2xl font-semibold text-emerald-400">
                  {supportedThoughts.length}
                </div>
                <div className="text-xs text-muted-foreground">Supported</div>
              </div>
              <div className="bg-red-500/10 rounded-lg p-3">
                <div className="text-2xl font-semibold text-red-400">
                  {disprovedThoughts.length}
                </div>
                <div className="text-xs text-muted-foreground">Disproved</div>
              </div>
            </div>

            {/* Warnings */}
            {conflictedThoughts.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Needs Attention
                </div>
                <p className="text-xs text-muted-foreground">
                  {conflictedThoughts.length} thought(s) have contradicting evidence
                </p>
              </div>
            )}

            {/* Thought list */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                All Thoughts
              </div>
              {thoughts.map((thought) => {
                const Icon = getTypeIcon(thought.type);
                return (
                  <button
                    key={thought.id}
                    type="button"
                    onClick={() => selectThought(thought.id)}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                      selectedThoughtId === thought.id
                        ? 'bg-primary/10 border border-primary/30'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm line-clamp-1 flex-1">{thought.title}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge
                        variant="outline"
                        className="text-[10px] py-0 capitalize"
                      >
                        {thought.status}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Recent Activity
            </div>
            {/* Mock timeline entries */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
                <div>
                  <div className="text-sm">Claim marked as supported</div>
                  <div className="text-xs text-muted-foreground">Sarah Chen - 2h ago</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                <div>
                  <div className="text-sm">Evidence attached</div>
                  <div className="text-xs text-muted-foreground">
                    Mike Rodriguez - 4h ago
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5" />
                <div>
                  <div className="text-sm">Confidence updated to 75%</div>
                  <div className="text-xs text-muted-foreground">
                    Mike Rodriguez - 1d ago
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <button
          type="button"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors"
        >
          <Settings className="w-4 h-4" />
          Board Settings
        </button>
      </div>
    </div>
  );
}
