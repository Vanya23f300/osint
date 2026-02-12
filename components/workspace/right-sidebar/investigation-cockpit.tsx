'use client';

import { useBoardStore } from '@/lib/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThoughtSection } from './sections/thought-section';
import { EvidenceSection } from './sections/evidence-section';
import { AIGuidanceSection } from './sections/ai-guidance-section';
import { DiscussionSection } from './sections/discussion-section';
import { FileQuestion } from 'lucide-react';

export function InvestigationCockpit() {
  const { selectedThoughtId, getThoughtById } = useBoardStore();
  const selectedThought = selectedThoughtId ? getThoughtById(selectedThoughtId) : null;

  if (!selectedThought) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No thought selected</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Select a thought from the canvas to view and edit details
        </p>
        <div className="w-full space-y-3 text-left">
          <div className="rounded-lg border p-4">
            <h4 className="font-medium mb-2">Quick Actions</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Click a thought node on the canvas</li>
              <li>• Create a new thought</li>
              <li>• Import from case</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col w-full max-w-full">
        {/* Section 1: Thought Details */}
        <ThoughtSection thought={selectedThought} />

        {/* Section 2: Evidence */}
        <EvidenceSection thought={selectedThought} />

        {/* Section 3: AI Guidance */}
        <AIGuidanceSection thought={selectedThought} />

        {/* Section 4: Discussion + AI Chat */}
        <DiscussionSection thought={selectedThought} />
      </div>
    </div>
  );
}
