import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ThoughtModel, EvidenceLinkModel } from '@/lib/models';

// GET /api/thoughts/[id] - Get a specific thought
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const thought = await ThoughtModel.findOne({ id }).lean();
    
    if (!thought) {
      return NextResponse.json(
        { error: 'Thought not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ thought });
  } catch (error) {
    console.error('Error fetching thought:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thought' },
      { status: 500 }
    );
  }
}

// PATCH /api/thoughts/[id] - Update a thought
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    
    const thought = await ThoughtModel.findOneAndUpdate(
      { id },
      { ...body, updatedAt: new Date() },
      { new: true }
    ).lean();
    
    if (!thought) {
      return NextResponse.json(
        { error: 'Thought not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ thought });
  } catch (error) {
    console.error('Error updating thought:', error);
    return NextResponse.json(
      { error: 'Failed to update thought' },
      { status: 500 }
    );
  }
}

// DELETE /api/thoughts/[id] - Delete a thought
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    const result = await ThoughtModel.deleteOne({ id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Thought not found' },
        { status: 404 }
      );
    }

    // Clean up related evidence links
    await EvidenceLinkModel.deleteMany({ nodeId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting thought:', error);
    return NextResponse.json(
      { error: 'Failed to delete thought' },
      { status: 500 }
    );
  }
}
