'use client';

import { useState } from 'react';
import {
  Play,
  Search,
  Plus,
  CheckSquare,
  HelpCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Send,
  Sparkles,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { Thought } from '@/types';
import { useBoardStore } from '@/lib/store';

interface AIGuidanceSectionProps {
  thought: Thought;
}

function getActionIcon(type: string) {
  switch (type) {
    case 'run':
      return Play;
    case 'search':
      return Search;
    case 'create':
      return Plus;
    case 'checklist':
      return CheckSquare;
    default:
      return Play;
  }
}

function getActionColor(type: string) {
  switch (type) {
    case 'run':
      return 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30';
    case 'search':
      return 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30';
    case 'create':
      return 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30';
    case 'checklist':
      return 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30';
    default:
      return 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
  }
}

function ActionItem({ action }: { action: any }) {
  const [completed, setCompleted] = useState(action.completed);
  const [showWhy, setShowWhy] = useState(false);
  const { updateAIAction } = useBoardStore();

  const Icon = getActionIcon(action.actionType);

  const handleToggle = (checked: boolean) => {
    setCompleted(checked);
    updateAIAction(action.id, { completed: checked });
  };

  return (
    <div
      className={`rounded-lg p-3 transition-colors ${
        completed ? 'bg-secondary/30 opacity-60' : 'bg-secondary/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={completed}
          onCheckedChange={handleToggle}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm ${completed ? 'line-through text-muted-foreground' : ''}`}
          >
            {action.text}
          </p>
          <button
            type="button"
            onClick={() => setShowWhy(!showWhy)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-1"
          >
            <HelpCircle className="w-3 h-3" />
            Why?
            {showWhy ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
          {showWhy && (
            <p className="text-xs text-muted-foreground mt-2 bg-background/50 rounded p-2">
              {action.reason}
            </p>
          )}
        </div>
        <Button
          size="sm"
          className={`h-7 text-xs ${getActionColor(action.actionType)}`}
          disabled={completed}
        >
          <Icon className="w-3 h-3 mr-1" />
          {action.actionType.charAt(0).toUpperCase() + action.actionType.slice(1)}
        </Button>
      </div>
    </div>
  );
}

function InsightItem({ insight }: { insight: any }) {
  return (
    <div className="bg-secondary/50 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm">{insight.message}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {insight.actions.map((action: any, i: number) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="h-6 text-xs bg-transparent border-border hover:border-primary hover:text-primary"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AIChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    {
      role: 'ai',
      content: 'I can help you analyze this investigation. What would you like to know?',
    },
  ]);

  const suggestedPrompts = [
    'What is missing to validate this?',
    'Summarize contradictions',
    'Propose alternate hypotheses',
    'Draft a cautious claim from current evidence',
  ];

  const handleSend = () => {
    if (message.trim()) {
      setMessages((prev) => [...prev, { role: 'user', content: message }]);
      // Simulate AI response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            content:
              'Based on the current evidence, I would suggest focusing on verifying the phone number connection across cases. This is currently the strongest link but could be strengthened with additional corroborating evidence.',
          },
        ]);
      }, 500);
      setMessage('');
    }
  };

  return (
    <div className="border-t border-border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Ask AI about this investigation</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-3">
            {/* Chat messages */}
            <div className="max-h-48 overflow-y-auto space-y-2">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary'
                    }`}
                  >
                    {msg.content}
                    {msg.role === 'ai' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs mt-2 w-full bg-transparent hover:bg-primary/20"
                      >
                        <ArrowRight className="w-3 h-3 mr-1" />
                        Use as Thought
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Suggested prompts */}
            <div className="flex flex-wrap gap-1">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMessage(prompt)}
                  className="text-[10px] px-2 py-1 rounded bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 bg-input border-border h-8 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button size="icon" className="h-8 w-8" onClick={handleSend}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function AIGuidanceSection({ thought }: AIGuidanceSectionProps) {
  const { getAIActionsForThought, getAIInsightsForThought } = useBoardStore();
  
  const actions = getAIActionsForThought(thought.id);
  const insights = getAIInsightsForThought(thought.id);

  return (
    <div className="space-y-4">
      {/* Next Actions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium">Suggested next actions</h3>
        </div>
        <div className="space-y-2">
          {actions.map((action) => (
            <ActionItem key={action.id} action={action} />
          ))}
        </div>
      </div>

      {/* Reasoning & Patterns */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-medium">Reasoning and patterns</h3>
        </div>
        <div className="space-y-2">
          {insights.map((insight) => (
            <InsightItem key={insight.id} insight={insight} />
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground text-center py-2 border-t border-border">
        AI suggestions are based on current board evidence. Review before applying.
      </p>

      {/* AI Chat Drawer */}
      <AIChatDrawer />
    </div>
  );
}
