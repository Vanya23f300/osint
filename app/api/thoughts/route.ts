import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ThoughtModel } from '@/lib/models';

// GET /api/thoughts - Get all thoughts (optionally filtered by boardId)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId');
    
    const query = boardId ? { boardId } : {};
    const thoughts = await ThoughtModel.find(query).lean();
    
    return NextResponse.json({ thoughts });
  } catch (error) {
    console.error('Error fetching thoughts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thoughts' },
      { status: 500 }
    );
  }
}

// POST /api/thoughts - Create a new thought
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const thought = await ThoughtModel.create(body);
    
    return NextResponse.json({ thought: thought.toObject() }, { status: 201 });
  } catch (error) {
    console.error('Error creating thought:', error);
    return NextResponse.json(
      { error: 'Failed to create thought' },
      { status: 500 }
    );
  }
}
