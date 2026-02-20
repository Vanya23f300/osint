import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { EvidenceModel } from '@/lib/models';

// GET /api/evidence - Get all evidence (optionally filtered by boardId)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId');
    
    const query = boardId ? { boardId } : {};
    const evidence = await EvidenceModel.find(query).lean();
    
    return NextResponse.json({ evidence });
  } catch (error) {
    console.error('Error fetching evidence:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evidence' },
      { status: 500 }
    );
  }
}

// POST /api/evidence - Create new evidence
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const evidence = await EvidenceModel.create(body);
    
    return NextResponse.json({ evidence: evidence.toObject() }, { status: 201 });
  } catch (error) {
    console.error('Error creating evidence:', error);
    return NextResponse.json(
      { error: 'Failed to create evidence' },
      { status: 500 }
    );
  }
}
