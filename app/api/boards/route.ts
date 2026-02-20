import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { BoardModel } from '@/lib/models';

// GET /api/boards - Get all boards
export async function GET() {
  try {
    await connectDB();
    const boards = await BoardModel.find({}).lean();
    return NextResponse.json({ boards });
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch boards' },
      { status: 500 }
    );
  }
}

// POST /api/boards - Create a new board
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const board = await BoardModel.create(body);
    return NextResponse.json({ board: board.toObject() }, { status: 201 });
  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json(
      { error: 'Failed to create board' },
      { status: 500 }
    );
  }
}
