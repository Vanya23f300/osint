import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { EvidenceLinkModel } from '@/lib/models';

// GET /api/evidence-links - Get evidence links (optionally filtered by nodeId)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const nodeId = searchParams.get('nodeId');
    
    const query = nodeId ? { nodeId } : {};
    const evidenceLinks = await EvidenceLinkModel.find(query).lean();
    
    return NextResponse.json({ evidenceLinks });
  } catch (error) {
    console.error('Error fetching evidence links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evidence links' },
      { status: 500 }
    );
  }
}

// POST /api/evidence-links - Create a new evidence link
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const evidenceLink = await EvidenceLinkModel.create(body);
    
    return NextResponse.json({ evidenceLink: evidenceLink.toObject() }, { status: 201 });
  } catch (error) {
    console.error('Error creating evidence link:', error);
    return NextResponse.json(
      { error: 'Failed to create evidence link' },
      { status: 500 }
    );
  }
}
