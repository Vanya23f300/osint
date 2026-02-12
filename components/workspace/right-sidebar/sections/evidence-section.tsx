'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Thought, EvidenceSourceType, EvidenceRelation } from '@/types';
import { useBoardStore } from '@/lib/store';
import { EvidenceCard } from '../components/evidence-card';

interface EvidenceSectionProps {
  thought: Thought;
}

export function EvidenceSection({ thought }: EvidenceSectionProps) {
  const { getEvidenceForThought, addEvidence, addEvidenceLink, currentBoard } = useBoardStore();
  const evidence = getEvidenceForThought(thought.id);
  const [showAddModal, setShowAddModal] = useState(false);
  const [evidenceType, setEvidenceType] = useState<EvidenceSourceType>('Note');
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceContent, setEvidenceContent] = useState('');
  const [evidenceRelation, setEvidenceRelation] = useState<EvidenceRelation>('Supports');
  const [reliability, setReliability] = useState<'Unknown' | 'Low' | 'Medium' | 'High'>('Medium');

  const supporting = evidence.filter((e) => e.link.relation === 'Supports');
  const contradicting = evidence.filter((e) => e.link.relation === 'Contradicts');
  const context = evidence.filter((e) => e.link.relation === 'Context');

  const handleAddEvidence = () => {
    if (!evidenceTitle.trim() || !currentBoard) return;

    const evidenceId = `evidence-${Date.now()}`;
    
    // Create the evidence item
    addEvidence({
      id: evidenceId,
      boardId: currentBoard.id,
      type: evidenceType,
      title: evidenceTitle.trim(),
      summary: evidenceContent.trim(),
      timestamp: new Date(),
      reliability,
      createdBy: 'current-user',
      createdAt: new Date(),
    });

    // Create the link to this thought
    addEvidenceLink({
      id: `link-${Date.now()}`,
      nodeId: thought.id,
      evidenceId,
      relation: evidenceRelation,
      isKey: false,
      createdBy: 'current-user',
      createdAt: new Date(),
    });

    // Reset form
    setEvidenceTitle('');
    setEvidenceContent('');
    setEvidenceType('Note');
    setEvidenceRelation('Supports');
    setReliability('Medium');
    setShowAddModal(false);
  };

  return (
    <div className="border-b px-4 py-4 pr-6 space-y-4 w-full overflow-hidden">
      <div className="flex items-center justify-between pr-2">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">
          Evidence
        </h2>
        <Button size="sm" variant="outline" onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Evidence
        </Button>
      </div>

      <Tabs defaultValue="supports" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="supports" className="relative">
            Supporting
            {supporting.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1">
                {supporting.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="contradicts" className="relative">
            Contradicting
            {contradicting.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1">
                {contradicting.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="context" className="relative">
            Context
            {context.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1">
                {context.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="supports" className="space-y-3 mt-4">
          {supporting.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No supporting evidence yet
            </div>
          ) : (
            supporting.map((item) => (
              <EvidenceCard key={item.id} evidence={item} />
            ))
          )}
        </TabsContent>

        <TabsContent value="contradicts" className="space-y-3 mt-4">
          {contradicting.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No contradicting evidence yet
            </div>
          ) : (
            contradicting.map((item) => (
              <EvidenceCard key={item.id} evidence={item} />
            ))
          )}
        </TabsContent>

        <TabsContent value="context" className="space-y-3 mt-4">
          {context.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No contextual evidence yet
            </div>
          ) : (
            context.map((item) => (
              <EvidenceCard key={item.id} evidence={item} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Add Evidence Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Evidence</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Evidence Type */}
            <div className="space-y-2">
              <Label>Evidence Type</Label>
              <Select value={evidenceType} onValueChange={(v) => setEvidenceType(v as EvidenceSourceType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Note">Note</SelectItem>
                  <SelectItem value="URL">URL Capture</SelectItem>
                  <SelectItem value="Profiler">Profiler Output</SelectItem>
                  <SelectItem value="LinkAnalysis">Link Analysis</SelectItem>
                  <SelectItem value="CaseArtifact">Case Artifact</SelectItem>
                  <SelectItem value="SearchResult">Search Result</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="evidence-title">Title</Label>
              <Input
                id="evidence-title"
                placeholder="Evidence title..."
                value={evidenceTitle}
                onChange={(e) => setEvidenceTitle(e.target.value)}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="evidence-content">Content/Description</Label>
              <Textarea
                id="evidence-content"
                placeholder="Evidence details..."
                value={evidenceContent}
                onChange={(e) => setEvidenceContent(e.target.value)}
                rows={4}
              />
            </div>

            {/* Relation */}
            <div className="space-y-2">
              <Label>Categorize As</Label>
              <Select value={evidenceRelation} onValueChange={(v) => setEvidenceRelation(v as EvidenceRelation)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Supports">Supports</SelectItem>
                  <SelectItem value="Contradicts">Contradicts</SelectItem>
                  <SelectItem value="Context">Context</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reliability */}
            <div className="space-y-2">
              <Label>Reliability</Label>
              <Select value={reliability} onValueChange={(v) => setReliability(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unknown">Unknown</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvidence} disabled={!evidenceTitle.trim()}>
              Add Evidence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
