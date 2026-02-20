# OSINT Investigation Board - API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently no authentication (prototype). In production, add JWT or session-based auth.

---

## Boards

### GET /api/boards
Get all boards.

**Response:**
```json
{
  "boards": [
    {
      "id": "board-1",
      "title": "Investigation Title",
      "status": "Active",
      "createdBy": "user-1",
      "createdAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z",
      "members": [...]
    }
  ]
}
```

### GET /api/boards/:id
Get a specific board with all related data.

**Response:**
```json
{
  "board": {...},
  "thoughts": [...],
  "evidence": [...],
  "evidenceLinks": [...],
  "connections": [...],
  "activities": [...]
}
```

### POST /api/boards
Create a new board.

**Request Body:**
```json
{
  "id": "board-2",
  "title": "New Investigation",
  "status": "Active",
  "createdBy": "user-1",
  "createdAt": "2024-01-15T00:00:00.000Z",
  "updatedAt": "2024-01-15T00:00:00.000Z",
  "members": []
}
```

### PATCH /api/boards/:id
Update a board.

**Request Body:**
```json
{
  "title": "Updated Title",
  "status": "Archived"
}
```

### DELETE /api/boards/:id
Delete a board.

**Response:**
```json
{
  "success": true
}
```

---

## Thoughts

### POST /api/thoughts
Create a new thought.

**Request Body:**
```json
{
  "id": "thought-5",
  "boardId": "board-1",
  "type": "Question",
  "title": "Is this legitimate?",
  "body": "Details here...",
  "status": "Open",
  "confidence": 50,
  "tags": ["tag1"],
  "createdBy": "user-1",
  "createdAt": "2024-01-15T00:00:00.000Z",
  "updatedAt": "2024-01-15T00:00:00.000Z",
  "position": { "x": 100, "y": 100 }
}
```

### PATCH /api/thoughts/:id
Update a thought.

**Request Body:**
```json
{
  "title": "Updated title",
  "status": "Investigating",
  "confidence": 75
}
```

### DELETE /api/thoughts/:id
Delete a thought (also deletes related evidence links and connections).

---

## Evidence

### POST /api/evidence
Create new evidence item.

**Request Body:**
```json
{
  "id": "evidence-8",
  "boardId": "board-1",
  "type": "Note",
  "title": "Evidence title",
  "summary": "Evidence description",
  "timestamp": "2024-01-15T00:00:00.000Z",
  "reliability": "High",
  "extractedEntities": [],
  "rawPayload": {},
  "createdBy": "user-1",
  "createdAt": "2024-01-15T00:00:00.000Z"
}
```

---

## Evidence Links

### POST /api/evidence-links
Link evidence to a thought with a relationship.

**Request Body:**
```json
{
  "id": "link-8",
  "nodeId": "thought-1",
  "evidenceId": "evidence-8",
  "relation": "Supports",
  "isKey": false,
  "note": "Optional note",
  "createdBy": "user-1",
  "createdAt": "2024-01-15T00:00:00.000Z"
}
```

### PATCH /api/evidence-links/:id
Update an evidence link (e.g., reclassify or mark as key).

**Request Body:**
```json
{
  "relation": "Contradicts",
  "isKey": true
}
```

### DELETE /api/evidence-links/:id
Remove the link between evidence and thought.

---

## Connections

### POST /api/connections
Create a connection between two thoughts.

**Request Body:**
```json
{
  "id": "connection-4",
  "boardId": "board-1",
  "sourceId": "thought-1",
  "targetId": "thought-2",
  "type": "supports"
}
```

---

## Data Model

### Key Concepts:

**Evidence vs. EvidenceLink:**
- `Evidence` - Independent evidence items (can be reused)
- `EvidenceLink` - Connects evidence to thoughts with relation (Supports/Contradicts/Context)
- Same evidence can be linked to multiple thoughts with different relations
- `isKey` flag is per-link, not per-evidence

**Relations:**
- `Supports` - Evidence strengthens the thought
- `Contradicts` - Evidence weakens the thought
- `Context` - Background information

**Thought Types:**
- `Question` - Investigation question
- `Hypothesis` - Proposed explanation
- `Claim` - Assertion with evidence
- `Observation` - Factual observation

---

## Error Responses

All endpoints return errors in this format:
```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `404` - Not Found
- `500` - Server Error
