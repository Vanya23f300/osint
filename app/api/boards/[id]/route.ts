import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import {
  BoardModel,
  ThoughtModel,
  EvidenceModel,
  EvidenceLinkModel,
  ConnectionModel,
  ActivityEntryModel,
} from '@/lib/models';

// GET /api/boards/[id] - Get a specific board with all related data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    const board = await BoardModel.findOne({ id }).lean();
    
    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    // Get all related data in parallel
    const [thoughts, evidence, connections, activities, evidenceLinks] = await Promise.all([
      ThoughtModel.find({ boardId: id }).lean(),
      EvidenceModel.find({ boardId: id }).lean(),
      ConnectionModel.find({ boardId: id }).lean(),
      ActivityEntryModel.find({ boardId: id }).sort({ timestamp: -1 }).lean(),
      EvidenceLinkModel.find({ nodeId: { $in: await ThoughtModel.find({ boardId: id }).distinct('id') } }).lean(),
    ]);

    return NextResponse.json({
      board,
      thoughts,
      evidence,
      evidenceLinks,
      connections,
      activities,
    });
  } catch (error) {
    console.error('Error fetching board:', error);
    return NextResponse.json(
      { error: 'Failed to fetch board' },
      { status: 500 }
    );
  }
}

// PATCH /api/boards/[id] - Update a board
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    
    const board = await BoardModel.findOneAndUpdate(
      { id },
      { ...body, updatedAt: new Date() },
      { new: true }
    ).lean();
    
    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ board });
  } catch (error) {
    console.error('Error updating board:', error);
    return NextResponse.json(
      { error: 'Failed to update board' },
      { status: 500 }
    );
  }
}

// DELETE /api/boards/[id] - Delete a board
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    const result = await BoardModel.deleteOne({ id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    // Clean up related data
    await Promise.all([
      ThoughtModel.deleteMany({ boardId: id }),
      EvidenceModel.deleteMany({ boardId: id }),
      ConnectionModel.deleteMany({ boardId: id }),
      ActivityEntryModel.deleteMany({ boardId: id }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting board:', error);
    return NextResponse.json(
      { error: 'Failed to delete board' },
      { status: 500 }
    );
  }
}
