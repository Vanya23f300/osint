import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import {
  BoardModel,
  ThoughtModel,
  EvidenceModel,
  EvidenceLinkModel,
  ConnectionModel,
} from '@/lib/models';
import { generateProactiveSuggestions } from '@/lib/ai/proactive-agent';

export const runtime = 'edge';

// POST /api/ai/analyze - Analyze board and generate proactive suggestions
export async function POST(req: NextRequest) {
  try {
    const { boardId, thoughtId, userFeedback } = await req.json();

    if (!boardId || !thoughtId) {
      return NextResponse.json(
        { error: 'boardId and thoughtId are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Fetch all necessary data
    const [board, thoughts, evidence, evidenceLinks, connections] = await Promise.all([
      BoardModel.findOne({ id: boardId }).lean(),
      ThoughtModel.find({ boardId }).lean(),
      EvidenceModel.find({ boardId }).lean(),
      EvidenceLinkModel.find({}).lean(),
      ConnectionModel.find({ boardId }).lean(),
    ]);

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    const selectedThought = thoughts.find((t) => t.id === thoughtId);

    if (!selectedThought) {
      return NextResponse.json(
        { error: 'Thought not found' },
        { status: 404 }
      );
    }

    // Generate suggestions
    const suggestions = await generateProactiveSuggestions(
      board as any,
      selectedThought as any,
      thoughts as any[],
      evidence as any[],
      evidenceLinks as any[],
      connections as any[],
      userFeedback || {
        acceptedSuggestionIds: [],
        ignoredSuggestionIds: [],
        completedSuggestionIds: [],
      }
    );

    return NextResponse.json({
      suggestions,
      analysisTimestamp: new Date().toISOString(),
      thoughtId,
    });
  } catch (error) {
    console.error('Error analyzing board:', error);
    return NextResponse.json(
      { error: 'Failed to analyze board', details: String(error) },
      { status: 500 }
    );
  }
}
