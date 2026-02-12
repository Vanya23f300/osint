'use client';

import { useState } from 'react';
import { MoreVertical, Star, Eye, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import type { Evidence, Reliability, EvidenceRelation } from '@/types';
import { useBoardStore } from '@/lib/store';
import { format } from 'date-fns';

interface EvidenceCardProps {
  evidence: Evidence & { link: import('@/types').EvidenceLink };
}

export function EvidenceCard({ evidence }: EvidenceCardProps) {
  const { updateEvidence, deleteEvidence, updateEvidenceLink, deleteEvidenceLink, reclassifyEvidenceLink } = useBoardStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  const getSourceBadgeColor = (type: Evidence['type']) => {
    switch (type) {
      case 'Profiler':
        return 'bg-blue-500';
      case 'URL':
        return 'bg-green-500';
      case 'LinkAnalysis':
        return 'bg-purple-500';
      case 'Note':
        return 'bg-amber-500';
      case 'CaseArtifact':
        return 'bg-red-500';
      case 'SearchResult':
        return 'bg-cyan-500';
      default:
        return 'bg-slate-500';
    }
  };

  const handleReliabilityChange = (reliability: Reliability) => {
    updateEvidence(evidence.id, { reliability });
  };

  const handleToggleKey = () => {
    updateEvidenceLink(evidence.link.id, { isKey: !evidence.link.isKey });
  };

  const handleReclassify = (relation: EvidenceRelation) => {
    reclassifyEvidenceLink(evidence.link.id, relation);
  };

  const handleDelete = () => {
    deleteEvidenceLink(evidence.link.id);
    setShowDeleteDialog(false);
    setDeleteReason('');
  };

  // Use summary for preview
  const contentPreview = evidence.summary || evidence.rawPayload?.description || '';

  return (
    <Card className="p-3 space-y-2 w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Badge className={`${getSourceBadgeColor(evidence.type)} text-white text-xs shrink-0`}>
            {evidence.type}
          </Badge>
          <h4 className="font-medium text-sm truncate">{evidence.title}</h4>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleReclassify('Supports')}>
              Reclassify as Supporting
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleReclassify('Contradicts')}>
              Reclassify as Contradicting
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleReclassify('Context')}>
              Reclassify as Context
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Timestamp */}
      <div className="text-xs text-muted-foreground">
        {format(new Date(evidence.timestamp), 'MMM d, yyyy HH:mm')}
      </div>

      {/* Preview */}
      <p className="text-sm text-muted-foreground line-clamp-2">
        {contentPreview}
      </p>

      {/* Entities */}
      {evidence.extractedEntities && evidence.extractedEntities.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {evidence.extractedEntities.map((entity, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {entity.type}: {entity.value}
            </Badge>
          ))}
        </div>
      )}

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-2">
          <Select value={evidence.reliability} onValueChange={handleReliabilityChange}>
            <SelectTrigger className="h-7 text-xs w-24">
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

        <Button
          variant={evidence.link.isKey ? 'default' : 'outline'}
          size="sm"
          className="h-7 text-xs"
          onClick={handleToggleKey}
        >
          <Star className={`mr-1 h-3 w-3 ${evidence.link.isKey ? 'fill-current' : ''}`} />
          Key
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Evidence</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this evidence from the thought?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-4">
            <Label htmlFor="delete-reason">Reason for removal (optional)</Label>
            <Textarea
              id="delete-reason"
              placeholder="Why are you removing this evidence?"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Remove Evidence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
