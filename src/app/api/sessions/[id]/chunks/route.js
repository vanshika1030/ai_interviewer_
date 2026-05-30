import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Session from '@/models/Session';
import { saveChunk } from '@/lib/storage';

export async function POST(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    const formData = await request.formData();
    const chunk = formData.get('chunk');
    const questionIndex = parseInt(formData.get('questionIndex'), 10);
    const chunkIndex = parseInt(formData.get('chunkIndex'), 10);

    // ─── Validate inputs ───────────────────────────────────────
    if (!chunk) {
      return NextResponse.json(
        { error: 'Chunk blob is required.' },
        { status: 400 }
      );
    }

    if (isNaN(questionIndex) || questionIndex < 0) {
      return NextResponse.json(
        { error: 'Valid questionIndex is required.' },
        { status: 400 }
      );
    }

    if (isNaN(chunkIndex) || chunkIndex < 0) {
      return NextResponse.json(
        { error: 'Valid chunkIndex is required.' },
        { status: 400 }
      );
    }

    // ─── Verify session exists ─────────────────────────────────
    const session = await Session.findById(id);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found.' },
        { status: 404 }
      );
    }

    // ─── Find or create the response entry for this question ───
    let responseEntry = session.responses.find(
      (r) => r.questionIndex === questionIndex
    );

    if (!responseEntry) {
      session.responses.push({
        questionIndex,
        chunks: [],
        chunksReceived: 0,
        status: 'recording',
      });
      responseEntry = session.responses[session.responses.length - 1];
    }

    // ─── Check for duplicate chunk ─────────────────────────────
    const isDuplicate = responseEntry.chunks.some(
      (c) => c.order === chunkIndex
    );

    if (isDuplicate) {
      return NextResponse.json(
        {
          success: true,
          chunkIndex,
          questionIndex,
          message: 'Duplicate chunk skipped.',
          duplicate: true,
        },
        { status: 200 }
      );
    }

    // ─── Convert blob to buffer and save ───────────────────────
    const arrayBuffer = await chunk.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let filePath;
    try {
      filePath = saveChunk(id, questionIndex, chunkIndex, buffer);
    } catch (storageError) {
      console.error('[Chunks] Storage error:', storageError);
      return NextResponse.json(
        { error: 'Failed to save chunk to storage.' },
        { status: 500 }
      );
    }

    // ─── Update session metadata ───────────────────────────────
    responseEntry.chunks.push({
      key: filePath,
      order: chunkIndex,
      size: buffer.length,
      uploadedAt: new Date(),
    });

    responseEntry.chunksReceived = responseEntry.chunks.length;

    if (responseEntry.status === 'pending') {
      responseEntry.status = 'recording';
      responseEntry.startedAt = new Date();
    }

    session.chunksReceived = (session.chunksReceived || 0) + 1;

    session.markModified('responses');
    await session.save();

    return NextResponse.json(
      {
        success: true,
        chunkIndex,
        questionIndex,
        totalChunks: responseEntry.chunksReceived,
        fileSize: buffer.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Chunks POST] Error:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid session ID format.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process chunk upload.' },
      { status: 500 }
    );
  }
}
