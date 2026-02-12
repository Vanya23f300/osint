'use client';

import { CheckCircle2, AlertTriangle, TrendingUp, Play, Search, Plus, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Thought } from '@/types';
import { useBoardStore } from '@/lib/store';

interface AIGuidanceSectionProps {
  thought: Thought;
}

export function AIGuidanceSection({ thought }: AIGuidanceSectionProps) {
  const { getAIActionsForThought, getAIInsightsForThought, updateAIAction } = useBoardStore();
  
  const actions = getAIActionsForThought(thought.id);
  const insights = getAIInsightsForThought(thought.id);

  const handleToggleAction = (actionId: string, completed: boolean) => {
    updateAIAction(actionId, { completed });
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'run':
        return <Play className="h-3 w-3" />;
      case 'search':
        return <Search className="h-3 w-3" />;
      case 'create':
        return <Plus className="h-3 w-3" />;
      case 'checklist':
        return <ListChecks className="h-3 w-3" />;
      default:
        return <Play className="h-3 w-3" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'pattern':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'contradiction':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="border-b px-4 py-4 pr-6 space-y-4 w-full overflow-hidden">
      <div className="flex items-center justify-between pr-2">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">
          AI Guidance
        </h2>
        <Badge variant="outline" className="text-xs">
          Beta
        </Badge>
      </div>

      {/* Next Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Suggested Next Actions</h3>
        {actions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No suggestions at this time</p>
        ) : (
          <div className="space-y-2">
            {actions.map((action, index) => (
              <Card key={action.id} className="p-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      {index + 1}.
                    </span>
                    <input
                      type="checkbox"
                      checked={action.completed}
                      onChange={(e) => handleToggleAction(action.id, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm">{action.text}</p>
                    <p className="text-xs text-muted-foreground">{action.reason}</p>
                    <Button size="sm" variant="outline" className="h-7">
                      {getActionIcon(action.actionType)}
                      <span className="ml-2 capitalize">{action.actionType}</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Insights */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Reasoning & Patterns</h3>
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">No insights detected</p>
        ) : (
          <div className="space-y-2">
            {insights.map((insight) => (
              <Card key={insight.id} className="p-3">
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1 space-y-2">
                    <p className="text-sm">{insight.message}</p>
                    <div className="flex flex-wrap gap-2">
                      {insight.actions.map((action, idx) => (
                        <Button key={idx} size="sm" variant="ghost" className="h-7 text-xs">
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground italic">
        AI suggestions are based on current board evidence. Review before applying.
      </p>
    </div>
  );
}
