import type {
  Board,
  Thought,
  Evidence,
  EvidenceLink,
  Connection,
  Entity,
} from '@/types';

export interface InvestigationSnapshot {
  board: {
    id: string;
    title: string;
    unresolvedThoughtCount: number;
    conflictedThoughtCount: number;
  };
  selectedThought: {
    id: string;
    type: string;
    title: string;
    body: string;
    status: string;
    confidence?: number;
    supportingEvidenceCount: number;
    contradictingEvidenceCount: number;
    contextEvidenceCount: number;
    keySupportingEvidenceCount: number;
    extractedEntities: {
      domains: string[];
      ips: string[];
      phones: string[];
      emails: string[];
      handles: string[];
    };
    linkedThoughts: Array<{
      id: string;
      relationType: string;
      title: string;
    }>;
  };
  evidenceSummary: {
    supporting: Array<{
      id: string;
      title: string;
      reliability: string;
      isKey: boolean;
    }>;
    contradicting: Array<{
      id: string;
      title: string;
      reliability: string;
    }>;
    context: Array<{
      id: string;
      title: string;
    }>;
  };
  userFeedbackMemory: {
    acceptedSuggestionIds: string[];
    ignoredSuggestionIds: string[];
    completedSuggestionIds: string[];
  };
}

export type SuggestionActionType =
  | 'RUN_TOOL'
  | 'CREATE_THOUGHT'
  | 'ADD_EVIDENCE'
  | 'ADD_CHECKLIST'
  | 'LINK_THOUGHT'
  | 'ADJUST_CONFIDENCE';

export type SuggestionCategory =
  | 'EVIDENCE_GAP'
  | 'CONTRADICTION'
  | 'ALTERNATIVE'
  | 'VERIFICATION'
  | 'BOARD_HEALTH';

export interface ProactiveSuggestion {
  id: string;
  title: string;
  why: string;
  actionType: SuggestionActionType;
  actionPayload: Record<string, any>;
  priority: 1 | 2 | 3 | 4 | 5;
  category: SuggestionCategory;
}

/**
 * Build investigation snapshot from current board state
 */
export function buildInvestigationSnapshot(
  board: Board,
  selectedThought: Thought | null,
  thoughts: Thought[],
  evidence: Evidence[],
  evidenceLinks: EvidenceLink[],
  connections: Connection[],
  userFeedback: {
    acceptedSuggestionIds: string[];
    ignoredSuggestionIds: string[];
    completedSuggestionIds: string[];
  }
): InvestigationSnapshot | null {
  if (!selectedThought) return null;

  // Get evidence for selected thought
  const thoughtEvidenceLinks = evidenceLinks.filter((el) => el.nodeId === selectedThought.id);
  
  const supporting = thoughtEvidenceLinks
    .filter((el) => el.relation === 'Supports')
    .map((el) => {
      const ev = evidence.find((e) => e.id === el.evidenceId);
      return ev ? {
        id: ev.id,
        title: ev.title,
        reliability: ev.reliability,
        isKey: el.isKey,
      } : null;
    })
    .filter(Boolean) as any[];

  const contradicting = thoughtEvidenceLinks
    .filter((el) => el.relation === 'Contradicts')
    .map((el) => {
      const ev = evidence.find((e) => e.id === el.evidenceId);
      return ev ? {
        id: ev.id,
        title: ev.title,
        reliability: ev.reliability,
      } : null;
    })
    .filter(Boolean) as any[];

  const context = thoughtEvidenceLinks
    .filter((el) => el.relation === 'Context')
    .map((el) => {
      const ev = evidence.find((e) => e.id === el.evidenceId);
      return ev ? {
        id: ev.id,
        title: ev.title,
      } : null;
    })
    .filter(Boolean) as any[];

  // Extract entities from all evidence
  const allEntities = thoughtEvidenceLinks
    .map((el) => evidence.find((e) => e.id === el.evidenceId))
    .filter(Boolean)
    .flatMap((ev) => ev!.extractedEntities || []);

  const extractedEntities = {
    domains: [...new Set(allEntities.filter((e) => e.type === 'domain').map((e) => e.value))],
    ips: [...new Set(allEntities.filter((e) => e.type === 'ip').map((e) => e.value))],
    phones: [...new Set(allEntities.filter((e) => e.type === 'phone').map((e) => e.value))],
    emails: [...new Set(allEntities.filter((e) => e.type === 'email').map((e) => e.value))],
    handles: [...new Set(allEntities.filter((e) => e.type === 'handle').map((e) => e.value))],
  };

  // Get linked thoughts
  const linkedThoughts = connections
    .filter((c) => c.sourceId === selectedThought.id || c.targetId === selectedThought.id)
    .map((c) => {
      const linkedId = c.sourceId === selectedThought.id ? c.targetId : c.sourceId;
      const linkedThought = thoughts.find((t) => t.id === linkedId);
      return linkedThought ? {
        id: linkedThought.id,
        relationType: c.type,
        title: linkedThought.title,
      } : null;
    })
    .filter(Boolean) as any[];

  // Calculate board metrics
  const unresolvedThoughtCount = thoughts.filter(
    (t) => t.status === 'Open' || t.status === 'Investigating'
  ).length;

  const conflictedThoughtCount = thoughts.filter((t) => {
    const links = evidenceLinks.filter((el) => el.nodeId === t.id);
    const hasSupporting = links.some((el) => el.relation === 'Supports');
    const hasContradicting = links.some((el) => el.relation === 'Contradicts');
    return hasSupporting && hasContradicting;
  }).length;

  return {
    board: {
      id: board.id,
      title: board.title,
      unresolvedThoughtCount,
      conflictedThoughtCount,
    },
    selectedThought: {
      id: selectedThought.id,
      type: selectedThought.type,
      title: selectedThought.title,
      body: selectedThought.body,
      status: selectedThought.status,
      confidence: selectedThought.confidence,
      supportingEvidenceCount: supporting.length,
      contradictingEvidenceCount: contradicting.length,
      contextEvidenceCount: context.length,
      keySupportingEvidenceCount: supporting.filter((e) => e.isKey).length,
      extractedEntities,
      linkedThoughts,
    },
    evidenceSummary: {
      supporting,
      contradicting,
      context,
    },
    userFeedbackMemory: userFeedback,
  };
}

/**
 * Rule-based suggestion generator (MVP Layer 1)
 * Deterministic rules that don't require LLM
 */
export function generateRuleBasedSuggestions(
  snapshot: InvestigationSnapshot
): ProactiveSuggestion[] {
  const suggestions: ProactiveSuggestion[] = [];
  const thought = snapshot.selectedThought;

  // Rule 1: No supporting evidence
  if (thought.supportingEvidenceCount === 0 && 
      (thought.type === 'Hypothesis' || thought.type === 'Claim')) {
    suggestions.push({
      id: `rule-no-support-${Date.now()}`,
      title: 'Add supporting evidence for this ' + thought.type.toLowerCase(),
      why: 'A ' + thought.type.toLowerCase() + ' requires supporting evidence to be validated.',
      actionType: 'ADD_EVIDENCE',
      actionPayload: {
        thoughtId: thought.id,
        relation: 'Supports',
      },
      priority: 5,
      category: 'EVIDENCE_GAP',
    });
  }

  // Rule 2: High confidence without key evidence
  if (thought.confidence && thought.confidence > 70 && thought.keySupportingEvidenceCount === 0) {
    suggestions.push({
      id: `rule-no-key-${Date.now()}`,
      title: 'Mark key supporting evidence',
      why: `Confidence is ${thought.confidence}% but no evidence is marked as key. Key evidence strengthens your claim.`,
      actionType: 'ADD_CHECKLIST',
      actionPayload: {
        thoughtId: thought.id,
        task: 'Review and mark the strongest supporting evidence as key',
      },
      priority: 4,
      category: 'VERIFICATION',
    });
  }

  // Rule 3: Contradiction detected
  if (thought.supportingEvidenceCount > 0 && thought.contradictingEvidenceCount > 0) {
    suggestions.push({
      id: `rule-contradiction-${Date.now()}`,
      title: 'Resolve contradiction in evidence',
      why: `This thought has ${thought.supportingEvidenceCount} supporting and ${thought.contradictingEvidenceCount} contradicting evidence. Address this conflict before proceeding.`,
      actionType: 'ADD_CHECKLIST',
      actionPayload: {
        thoughtId: thought.id,
        task: 'Review contradicting evidence and adjust reasoning or confidence',
      },
      priority: 5,
      category: 'CONTRADICTION',
    });
  }

  // Rule 4: Domain profiling opportunity
  if (thought.extractedEntities.domains.length > 0) {
    const allEvidence = [
      ...snapshot.evidenceSummary.supporting,
      ...snapshot.evidenceSummary.context,
    ];
    const hasProfilerEvidence = allEvidence.some((e) =>
      e.title.toLowerCase().includes('profiler') ||
      e.title.toLowerCase().includes('whois') ||
      e.title.toLowerCase().includes('dns')
    );
    
    if (!hasProfilerEvidence) {
      suggestions.push({
        id: `rule-domain-profile-${Date.now()}`,
        title: `Run domain profiler on ${thought.extractedEntities.domains[0]}`,
        why: 'Domain entities detected but no profiler analysis found. Technical analysis can reveal infrastructure patterns.',
        actionType: 'RUN_TOOL',
        actionPayload: {
          tool: 'domain_profiler',
          target: thought.extractedEntities.domains[0],
        },
        priority: 3,
        category: 'VERIFICATION',
      });
    }
  }

  // Rule 5: IP profiling opportunity
  if (thought.extractedEntities.ips.length > 0) {
    const allEvidenceForIP = [
      ...snapshot.evidenceSummary.supporting,
      ...snapshot.evidenceSummary.context,
    ];
    const hasIPAnalysis = allEvidenceForIP.some((e) =>
      e.title.toLowerCase().includes('ip') ||
      e.title.toLowerCase().includes('hosting')
    );
    
    if (!hasIPAnalysis) {
      suggestions.push({
        id: `rule-ip-profile-${Date.now()}`,
        title: `Analyze IP address ${thought.extractedEntities.ips[0]}`,
        why: 'IP address detected. Infrastructure analysis can reveal shared hosting or attribution clues.',
        actionType: 'RUN_TOOL',
        actionPayload: {
          tool: 'ip_profiler',
          target: thought.extractedEntities.ips[0],
        },
        priority: 3,
        category: 'VERIFICATION',
      });
    }
  }

  // Rule 6: Only one hypothesis for investigation
  if (thought.type === 'Question' && thought.linkedThoughts.length === 1) {
    suggestions.push({
      id: `rule-alt-hypothesis-${Date.now()}`,
      title: 'Create alternative hypothesis',
      why: 'Only one hypothesis exists. Consider alternative explanations to strengthen your analysis.',
      actionType: 'CREATE_THOUGHT',
      actionPayload: {
        type: 'Hypothesis',
        linkedTo: thought.id,
      },
      priority: 3,
      category: 'ALTERNATIVE',
    });
  }

  // Rule 7: Weak evidence reliability
  const weakEvidence = snapshot.evidenceSummary.supporting.filter(
    (e) => e.reliability === 'Low' || e.reliability === 'Unknown'
  );
  
  if (weakEvidence.length > 0 && thought.confidence && thought.confidence > 60) {
    suggestions.push({
      id: `rule-weak-evidence-${Date.now()}`,
      title: 'Verify evidence reliability',
      why: `${weakEvidence.length} supporting evidence items have low/unknown reliability. This may not justify ${thought.confidence}% confidence.`,
      actionType: 'ADD_CHECKLIST',
      actionPayload: {
        thoughtId: thought.id,
        task: 'Review and update reliability ratings for supporting evidence',
      },
      priority: 4,
      category: 'VERIFICATION',
    });
  }

  // Rule 8: Phone number cross-reference
  if (thought.extractedEntities.phones.length > 0) {
    suggestions.push({
      id: `rule-phone-search-${Date.now()}`,
      title: `Search for phone number ${thought.extractedEntities.phones[0]} across cases`,
      why: 'Phone number reuse is a strong attribution signal. Cross-referencing can reveal patterns.',
      actionType: 'RUN_TOOL',
      actionPayload: {
        tool: 'phone_search',
        target: thought.extractedEntities.phones[0],
      },
      priority: 4,
      category: 'VERIFICATION',
    });
  }

  // Rule 9: Supported claim without key evidence
  if (thought.status === 'Supported' && thought.keySupportingEvidenceCount === 0) {
    suggestions.push({
      id: `rule-supported-no-key-${Date.now()}`,
      title: 'Mark key evidence for supported claim',
      why: 'This claim is marked as Supported but has no key evidence. Key evidence is required for export.',
      actionType: 'ADD_CHECKLIST',
      actionPayload: {
        thoughtId: thought.id,
        task: 'Identify and mark the strongest evidence as key',
      },
      priority: 5,
      category: 'EVIDENCE_GAP',
    });
  }

  // Rule 10: High confidence with limited evidence
  if (thought.confidence && thought.confidence > 75 && thought.supportingEvidenceCount < 3) {
    suggestions.push({
      id: `rule-high-conf-limited-${Date.now()}`,
      title: 'Consider lowering confidence or adding more evidence',
      why: `${thought.confidence}% confidence with only ${thought.supportingEvidenceCount} supporting evidence items may be overconfident.`,
      actionType: 'ADJUST_CONFIDENCE',
      actionPayload: {
        thoughtId: thought.id,
        recommendedConfidence: 65,
        reason: 'Limited evidence quantity',
      },
      priority: 3,
      category: 'VERIFICATION',
    });
  }

  // Sort by priority (highest first) and limit to 7
  return suggestions
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 7);
}

/**
 * Generate LLM-enhanced suggestions (Layer 2)
 * This adds contextual, nuanced suggestions on top of rule-based ones
 */
export async function generateLLMSuggestions(
  snapshot: InvestigationSnapshot,
  ruleBasedSuggestions: ProactiveSuggestion[]
): Promise<ProactiveSuggestion[]> {
  // This will call the AI API to generate additional contextual suggestions
  // For MVP, we'll implement this in the next phase
  return [];
}

/**
 * Main entry point: Generate all suggestions
 */
export async function generateProactiveSuggestions(
  board: Board,
  selectedThought: Thought | null,
  thoughts: Thought[],
  evidence: Evidence[],
  evidenceLinks: EvidenceLink[],
  connections: Connection[],
  userFeedback: {
    acceptedSuggestionIds: string[];
    ignoredSuggestionIds: string[];
    completedSuggestionIds: string[];
  }
): Promise<ProactiveSuggestion[]> {
  // Build snapshot
  const snapshot = buildInvestigationSnapshot(
    board,
    selectedThought,
    thoughts,
    evidence,
    evidenceLinks,
    connections,
    userFeedback
  );

  if (!snapshot) return [];

  // Generate rule-based suggestions
  const ruleBasedSuggestions = generateRuleBasedSuggestions(snapshot);

  // Filter out ignored suggestions
  const filteredSuggestions = ruleBasedSuggestions.filter(
    (s) => !userFeedback.ignoredSuggestionIds.includes(s.id)
  );

  // TODO: Add LLM suggestions in Phase 2
  // const llmSuggestions = await generateLLMSuggestions(snapshot, filteredSuggestions);

  return filteredSuggestions;
}
