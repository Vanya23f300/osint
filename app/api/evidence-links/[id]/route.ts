import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { EvidenceLinkModel } from '@/lib/models';

// PATCH /api/evidence-links/[id] - Update an evidence link
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    
    const evidenceLink = await EvidenceLinkModel.findOneAndUpdate(
      { id },
      body,
      { new: true }
    ).lean();
    
    if (!evidenceLink) {
      return NextResponse.json(
        { error: 'Evidence link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ evidenceLink });
  } catch (error) {
    console.error('Error updating evidence link:', error);
    return NextResponse.json(
      { error: 'Failed to update evidence link' },
      { status: 500 }
    );
  }
}

// DELETE /api/evidence-links/[id] - Delete an evidence link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    const result = await EvidenceLinkModel.deleteOne({ id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Evidence link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting evidence link:', error);
    return NextResponse.json(
      { error: 'Failed to delete evidence link' },
      { status: 500 }
    );
  }
}
