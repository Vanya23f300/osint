import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ConnectionModel } from '@/lib/models';

// GET /api/connections - Get connections (optionally filtered by boardId)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId');
    
    const query = boardId ? { boardId } : {};
    const connections = await ConnectionModel.find(query).lean();
    
    return NextResponse.json({ connections });
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}

// POST /api/connections - Create a new connection
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const connection = await ConnectionModel.create(body);
    
    return NextResponse.json({ connection: connection.toObject() }, { status: 201 });
  } catch (error) {
    console.error('Error creating connection:', error);
    return NextResponse.json(
      { error: 'Failed to create connection' },
      { status: 500 }
    );
  }
}

// DELETE /api/connections/[id] - Delete a connection
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Connection ID required' },
        { status: 400 }
      );
    }
    
    const result = await ConnectionModel.deleteOne({ id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting connection:', error);
    return NextResponse.json(
      { error: 'Failed to delete connection' },
      { status: 500 }
    );
  }
}
