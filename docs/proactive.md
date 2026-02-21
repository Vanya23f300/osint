
# Proactive Investigation Agent – Implementation Guide

## Overview

The Proactive Investigation Agent is a reasoning copilot embedded inside the OSINT Board.

Its purpose is not to chat endlessly.
Its purpose is to:

* Analyze the current investigation state
* Detect reasoning gaps
* Suggest structured next steps
* Propose tool calls
* Highlight contradictions
* Encourage evidence-backed thinking

The agent must enhance investigation quality without overwhelming the analyst.

This guide defines:

* Scope
* Inputs
* Outputs
* Triggers
* Decision logic
* UI integration
* MVP boundaries

---

# 1. Product Philosophy

The agent is:

* Advisory, not autonomous
* Context-aware, not generic
* Structured, not verbose
* Actionable, not conversational
* Evidence-driven, not speculative

The agent must never:

* Run tools automatically
* Change confidence automatically
* Modify evidence automatically
* Override user reasoning

User is always in control.

---

# 2. Core Responsibilities

The agent performs five responsibilities:

1. Detect missing evidence
2. Detect contradictions
3. Detect weak confidence alignment
4. Suggest next investigation steps
5. Surface alternative hypotheses

It operates at two levels:

* Thought-level guidance
* Board-level health overview

---

# 3. When the Agent Runs

The agent recalculates suggestions on:

* Board load
* Thought selection
* Evidence added
* Evidence reclassified
* Confidence updated
* Thought status changed
* New contradiction detected

The agent must not run continuously.
It should be event-triggered only.

---

# 4. Agent Input Snapshot

The agent consumes a structured investigation snapshot.

This snapshot must be assembled before calling the agent.

## Snapshot Structure

```
{
  board: {
    id,
    title,
    unresolvedThoughtCount,
    conflictedThoughtCount
  },

  selectedThought: {
    id,
    type,
    title,
    description,
    status,
    confidence,
    supportingEvidenceCount,
    contradictingEvidenceCount,
    contextEvidenceCount,
    keySupportingEvidenceCount,
    extractedEntities: {
      domains: [],
      ips: [],
      phones: [],
      emails: [],
      handles: []
    },
    linkedThoughts: [
      { id, relationType, title }
    ]
  },

  evidenceSummary: {
    supporting: [
      { id, title, reliability, isKey }
    ],
    contradicting: [
      { id, title, reliability }
    ],
    context: [
      { id, title }
    ]
  },

  userFeedbackMemory: {
    acceptedSuggestionIds: [],
    ignoredSuggestionIds: [],
    completedSuggestionIds: []
  }
}
```

This structure is enough for meaningful reasoning.

---

# 5. Agent Output Schema

The agent must return structured suggestions.

Each suggestion must follow this schema:

```
{
  id: string,
  title: string,
  why: string,
  actionType: "RUN_TOOL" | "CREATE_THOUGHT" | "ADD_EVIDENCE" | "ADD_CHECKLIST" | "LINK_THOUGHT" | "ADJUST_CONFIDENCE",
  actionPayload: {},
  priority: 1-5,
  category: "EVIDENCE_GAP" | "CONTRADICTION" | "ALTERNATIVE" | "VERIFICATION" | "BOARD_HEALTH"
}
```

Constraints:

* Maximum 7 suggestions
* Minimum 2 suggestions
* Suggestions must reference current state
* Suggestions must be actionable

---

# 6. Suggestion Categories

## 6.1 Evidence Gap

Triggered when:

* No supporting evidence exists
* No key supporting evidence exists
* Only context evidence exists

Example:

* Attach supporting evidence for this hypothesis
* Mark key supporting evidence
* Verify payment flow with screenshot capture

---

## 6.2 Contradiction Handling

Triggered when:

* Supporting AND contradicting evidence exist

Example:

* Review contradictory evidence before increasing confidence
* Create alternate hypothesis to explain contradiction
* Add verification step to resolve hosting conflict

---

## 6.3 Verification Steps

Triggered when:

* Claim confidence > 70 but key evidence < 1
* Evidence reliability low
* Hypothesis lacks independent confirmation

Example:

* Run domain profiler
* Check phone number reuse
* Validate WHOIS registration date

---

## 6.4 Alternative Hypothesis

Triggered when:

* Only one hypothesis exists
* Conflicted evidence appears
* Claim heavily relies on shared infrastructure

Example:

* Create alternate hypothesis about shared hosting coincidence

---

## 6.5 Board Health

Triggered when:

* Multiple high confidence but unsupported claims
* Many open questions without progress
* Stale investigations

Example:

* Resolve 2 open questions
* Review 1 conflicted thought
* Convert supported hypothesis into claim

---

# 7. Rule-Based Baseline Logic (MVP Layer 1)

Before integrating LLM, implement deterministic rules.

Examples:

### Rule 1

If supportingEvidenceCount == 0
→ Suggest "Add supporting evidence"

### Rule 2

If confidence > 70 AND keySupportingEvidenceCount == 0
→ Suggest "Mark key supporting evidence"

### Rule 3

If supportingEvidenceCount > 0 AND contradictingEvidenceCount > 0
→ Suggest "Resolve contradiction"

### Rule 4

If extractedEntities.domains.length > 0 AND no profiler evidence exists
→ Suggest "Run domain profiler"

### Rule 5

If only one hypothesis exists for a question
→ Suggest "Create alternate hypothesis"

These rules alone make the system feel intelligent.

---

# 8. LLM Layer (Optional Enhancement)

Once baseline rules exist, add LLM suggestions.

LLM receives structured snapshot and must return:

* Structured JSON only
* No narrative
* No chat text

Prompt must instruct:

* Do not hallucinate external facts
* Base suggestions only on snapshot
* Avoid repeating accepted suggestions

---

# 9. UI Integration

The agent lives in the sidebar.

## Section 1: Suggested Next Steps

Compact checklist style.

Each item shows:

* Title
* Short reason
* Action button
* Dismiss option

## Section 2: Reasoning Checks

Small warnings:

* Conflicted thought
* Weak evidence
* Overconfident claim

## Optional Section 3: Ask AI

Chat interface scoped to:

* Selected thought
* Board evidence only

Chat must always cite evidence references.

---

# 10. Action Flow

When user clicks a suggestion:

1. Action executes
2. Tool runs OR modal opens
3. Evidence created OR Thought created
4. Snapshot refreshed
5. Agent recalculates suggestions

This creates a closed reasoning loop.

---

# 11. Feedback Memory

Track:

* Accepted suggestions
* Ignored suggestions
* Completed suggestions

Suppress repeating ignored suggestions.

Reorder accepted patterns higher priority.

---

# 12. Constraints for MVP

The proactive agent must:

* Produce at most 7 suggestions
* Avoid generic language
* Reference real board data
* Never auto-modify investigation
* Never override user confidence
* Never fabricate evidence

---

# 13. Success Criteria

The agent is successful if:

* Investigators feel guided, not interrupted
* Confidence aligns better with evidence
* Contradictions are resolved faster
* Investigation moves forward consistently
* Export quality improves

---

# 14. What NOT to Build for MVP

* Autonomous investigation agents
* Continuous background crawling
* Complex planning trees
* Multi-agent orchestration
* Real-time chat streaming
* Memory across boards

Keep it tight. Keep it reasoning-first.

---

# Final Principle

The proactive agent is not the investigator.

It is the quiet analyst beside them asking:

* Is this verified?
* What contradicts this?
* Are you too confident?
* What’s the next logical step?

If it does that consistently, your MVP wins.

---

