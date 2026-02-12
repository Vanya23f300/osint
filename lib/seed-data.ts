import type {
  Board,
  Thought,
  Evidence,
  EvidenceLink,
  Connection,
  Comment,
  AIAction,
  AIInsight,
} from '@/types';

export const seedBoard: Board = {
  id: 'board-1',
  title: 'Acme Support Refund Investigation',
  status: 'Active',
  createdBy: 'user-1',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date(),
  members: [
    {
      userId: 'user-1',
      name: 'Sarah Chen',
      avatar: 'SC',
      role: 'Lead',
    },
    {
      userId: 'user-2',
      name: 'Mike Rodriguez',
      avatar: 'MR',
      role: 'Editor',
    },
  ],
};

export const seedThoughts: Thought[] = [
  {
    id: 'thought-1',
    boardId: 'board-1',
    type: 'Question',
    title: 'Is acme-support-refund.com a scam site?',
    body: 'Domain reported by multiple users claiming to be official Acme support. Requesting payment for "refund processing fees".',
    status: 'Investigating',
    tags: ['scam', 'phishing', 'domain'],
    owner: 'user-1',
    createdBy: 'user-1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    position: { x: 100, y: 100 },
  },
  {
    id: 'thought-2',
    boardId: 'board-1',
    type: 'Hypothesis',
    title: 'Brand impersonation for refund scam',
    body: 'Site appears to be impersonating Acme Corp to collect fraudulent "processing fees" from victims expecting refunds.',
    confidence: 75,
    status: 'Investigating',
    tags: ['impersonation', 'fraud'],
    owner: 'user-1',
    createdBy: 'user-1',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-18'),
    position: { x: 400, y: 100 },
  },
  {
    id: 'thought-3',
    boardId: 'board-1',
    type: 'Claim',
    title: 'Domain linked to prior case by phone reuse',
    body: 'Phone number +1-555-0123 found on site matches number from Case #2847 (confirmed scam operation).',
    confidence: 85,
    status: 'Supported',
    tags: ['attribution', 'phone', 'link-analysis'],
    owner: 'user-2',
    createdBy: 'user-2',
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-19'),
    position: { x: 700, y: 100 },
  },
  {
    id: 'thought-4',
    boardId: 'board-1',
    type: 'Observation',
    title: 'Site uses shared hosting infrastructure',
    body: 'Domain resolves to 192.168.1.100 which hosts 200+ other domains. Hosting provider is BudgetHost LLC.',
    status: 'Open',
    tags: ['infrastructure', 'hosting'],
    createdBy: 'user-2',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    position: { x: 400, y: 350 },
  },
];

// Evidence items - independent of thoughts
export const seedEvidence: Evidence[] = [
  {
    id: 'evidence-1',
    boardId: 'board-1',
    type: 'URL',
    title: 'Screenshot of fraudulent site',
    summary: 'Screenshot showing acme-support-refund.com homepage with fake Acme branding',
    timestamp: new Date('2024-01-15'),
    reliability: 'High',
    extractedEntities: [
      { type: 'domain', value: 'acme-support-refund.com' },
    ],
    rawPayload: {
      url: 'https://acme-support-refund.com',
      capturedAt: new Date('2024-01-15'),
    },
    createdBy: 'user-1',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'evidence-2',
    boardId: 'board-1',
    type: 'Note',
    title: 'User report from victim',
    summary: 'Received email claiming to be from Acme support. Asked for $50 processing fee to release $500 refund. Site looks legitimate but domain is suspicious.',
    timestamp: new Date('2024-01-15'),
    reliability: 'Medium',
    createdBy: 'user-1',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'evidence-3',
    boardId: 'board-1',
    type: 'Profiler',
    title: 'Domain WHOIS lookup',
    summary: 'WHOIS data shows recent registration with privacy protection',
    timestamp: new Date('2024-01-16'),
    reliability: 'High',
    extractedEntities: [
      { type: 'domain', value: 'acme-support-refund.com' },
    ],
    rawPayload: {
      registrar: 'NameCheap',
      registrationDate: '2024-01-10',
      registrant: 'Privacy Protected',
      nameservers: ['ns1.budgethost.com', 'ns2.budgethost.com'],
    },
    createdBy: 'user-1',
    createdAt: new Date('2024-01-16'),
  },
  {
    id: 'evidence-4',
    boardId: 'board-1',
    type: 'URL',
    title: 'Payment flow screenshot',
    summary: 'Site requests payment via untraceable gift cards',
    timestamp: new Date('2024-01-16'),
    reliability: 'High',
    rawPayload: {
      description: 'Site requests payment via untraceable gift cards',
      paymentMethods: ['Amazon Gift Card', 'iTunes Gift Card'],
    },
    createdBy: 'user-1',
    createdAt: new Date('2024-01-16'),
  },
  {
    id: 'evidence-5',
    boardId: 'board-1',
    type: 'CaseArtifact',
    title: 'Phone number match from Case #2847',
    summary: 'Phone number +1-555-0123 appears in previous confirmed scam case',
    timestamp: new Date('2024-01-17'),
    reliability: 'High',
    extractedEntities: [
      { type: 'phone', value: '+1-555-0123' },
    ],
    rawPayload: {
      caseId: '2847',
      phoneNumber: '+1-555-0123',
      status: 'Confirmed Scam',
      dateReported: '2023-11-20',
    },
    createdBy: 'user-2',
    createdAt: new Date('2024-01-17'),
  },
  {
    id: 'evidence-6',
    boardId: 'board-1',
    type: 'Note',
    title: 'Shared hosting weakens attribution',
    summary: 'IP address hosts 200+ domains. Cannot definitively attribute to same actor without additional evidence. Shared hosting is common for budget operations.',
    timestamp: new Date('2024-01-18'),
    reliability: 'Medium',
    extractedEntities: [
      { type: 'ip', value: '192.168.1.100' },
    ],
    createdBy: 'user-2',
    createdAt: new Date('2024-01-18'),
  },
  {
    id: 'evidence-7',
    boardId: 'board-1',
    type: 'Profiler',
    title: 'IP and hosting analysis',
    summary: 'IP 192.168.1.100 hosted by BudgetHost LLC with 247 co-hosted domains',
    timestamp: new Date('2024-01-18'),
    reliability: 'High',
    extractedEntities: [
      { type: 'ip', value: '192.168.1.100' },
    ],
    rawPayload: {
      ip: '192.168.1.100',
      hostingProvider: 'BudgetHost LLC',
      sharedHosting: true,
      cohostedDomains: 247,
      location: 'United States',
    },
    createdBy: 'user-2',
    createdAt: new Date('2024-01-18'),
  },
];

// Evidence Links - connect evidence to thoughts with relationships
export const seedEvidenceLinks: EvidenceLink[] = [
  // Evidence for thought-1 (Question)
  {
    id: 'link-1',
    nodeId: 'thought-1',
    evidenceId: 'evidence-1',
    relation: 'Context',
    isKey: false,
    createdBy: 'user-1',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'link-2',
    nodeId: 'thought-1',
    evidenceId: 'evidence-2',
    relation: 'Supports',
    isKey: true,
    createdBy: 'user-1',
    createdAt: new Date('2024-01-15'),
  },
  
  // Evidence for thought-2 (Hypothesis)
  {
    id: 'link-3',
    nodeId: 'thought-2',
    evidenceId: 'evidence-3',
    relation: 'Supports',
    isKey: true,
    createdBy: 'user-1',
    createdAt: new Date('2024-01-16'),
  },
  {
    id: 'link-4',
    nodeId: 'thought-2',
    evidenceId: 'evidence-4',
    relation: 'Supports',
    isKey: true,
    createdBy: 'user-1',
    createdAt: new Date('2024-01-16'),
  },
  
  // Evidence for thought-3 (Claim)
  {
    id: 'link-5',
    nodeId: 'thought-3',
    evidenceId: 'evidence-5',
    relation: 'Supports',
    isKey: true,
    createdBy: 'user-2',
    createdAt: new Date('2024-01-17'),
  },
  {
    id: 'link-6',
    nodeId: 'thought-3',
    evidenceId: 'evidence-6',
    relation: 'Contradicts',
    isKey: false,
    createdBy: 'user-2',
    createdAt: new Date('2024-01-18'),
  },
  
  // Evidence for thought-4 (Observation)
  {
    id: 'link-7',
    nodeId: 'thought-4',
    evidenceId: 'evidence-7',
    relation: 'Supports',
    isKey: false,
    createdBy: 'user-2',
    createdAt: new Date('2024-01-18'),
  },
];

export const seedConnections: Connection[] = [
  {
    id: 'connection-1',
    boardId: 'board-1',
    sourceId: 'thought-1',
    targetId: 'thought-2',
    type: 'related',
  },
  {
    id: 'connection-2',
    boardId: 'board-1',
    sourceId: 'thought-2',
    targetId: 'thought-3',
    type: 'supports',
  },
  {
    id: 'connection-3',
    boardId: 'board-1',
    sourceId: 'thought-4',
    targetId: 'thought-3',
    type: 'contradicts',
  },
];

export const seedComments: Comment[] = [
  {
    id: 'comment-1',
    thoughtId: 'thought-2',
    boardId: 'board-1',
    userId: 'user-2',
    userName: 'Mike Rodriguez',
    content: 'The gift card payment method is a strong indicator. Legitimate businesses don\'t use this.',
    createdAt: new Date('2024-01-16T14:30:00'),
    resolved: false,
    isPinned: false,
  },
  {
    id: 'comment-2',
    thoughtId: 'thought-3',
    boardId: 'board-1',
    userId: 'user-1',
    userName: 'Sarah Chen',
    content: 'Good catch on the phone number! However, we should verify if the number could have been spoofed or recycled.',
    createdAt: new Date('2024-01-17T10:15:00'),
    resolved: false,
    isPinned: true,
  },
];

export const seedAIActions: AIAction[] = [
  {
    id: 'ai-action-1',
    thoughtId: 'thought-2',
    text: 'Run domain profiler on extracted IPs',
    reason: 'Understanding hosting infrastructure can reveal patterns',
    actionType: 'run',
    completed: true,
  },
  {
    id: 'ai-action-2',
    thoughtId: 'thought-2',
    text: 'Capture screenshot and payment flow',
    reason: 'Visual evidence is crucial for case documentation',
    actionType: 'checklist',
    completed: true,
  },
  {
    id: 'ai-action-3',
    thoughtId: 'thought-2',
    text: 'Search for reused phone number across cases',
    reason: 'Phone reuse is a strong attribution signal',
    actionType: 'search',
    completed: true,
  },
  {
    id: 'ai-action-4',
    thoughtId: 'thought-2',
    text: 'Create alternative hypothesis: copycat vs same actor',
    reason: 'Consider if this is imitation or same threat actor',
    actionType: 'create',
    completed: false,
  },
];

export const seedAIInsights: AIInsight[] = [
  {
    id: 'ai-insight-1',
    thoughtId: 'thought-3',
    type: 'contradiction',
    message: 'Contradiction detected with Thought: "Site uses shared hosting infrastructure"',
    actions: [
      { label: 'Review contradiction', action: 'review' },
      { label: 'Add verification step', action: 'verify' },
    ],
  },
  {
    id: 'ai-insight-2',
    thoughtId: 'thought-2',
    type: 'pattern',
    message: 'Pattern: Gift card payment method seen in 15 similar cases',
    actions: [
      { label: 'View related cases', action: 'view-cases' },
      { label: 'Add to evidence', action: 'add-evidence' },
    ],
  },
  {
    id: 'ai-insight-3',
    thoughtId: 'thought-3',
    type: 'warning',
    message: 'Confidence may be high relative to evidence strength. Consider adding more verification.',
    actions: [
      { label: 'Lower confidence', action: 'lower-confidence' },
      { label: 'Add verification checklist', action: 'add-checklist' },
    ],
  },
];
