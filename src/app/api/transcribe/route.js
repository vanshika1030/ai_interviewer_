import { NextResponse } from 'next/server';
import fs from 'fs';
import connectDB from '@/lib/db';
import Session from '@/models/Session';
import { getChunkPaths, saveMergedFile } from '@/lib/storage';
import { transcribeAudio } from '@/lib/deepgram';

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { sessionId, questionIndex } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required.' },
        { status: 400 }
      );
    }

    if (questionIndex === undefined || questionIndex === null || questionIndex < 0) {
      return NextResponse.json(
        { error: 'Valid questionIndex is required.' },
        { status: 400 }
      );
    }

    // Verify session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found.' },
        { status: 404 }
      );
    }

    // Get chunk file paths from storage
    const chunkPaths = getChunkPaths(sessionId, questionIndex);

    if (!chunkPaths || chunkPaths.length === 0) {
      return NextResponse.json(
        { error: 'No chunks found for this question. Record a response first.' },
        { status: 400 }
      );
    }

    // Merge chunks by simple concatenation (demo approach; production would use FFmpeg)
    const buffers = [];
    for (const chunkPath of chunkPaths) {
      try {
        const chunkBuffer = fs.readFileSync(chunkPath);
        buffers.push(chunkBuffer);
      } catch (readError) {
        console.error(`[Transcribe] Failed to read chunk ${chunkPath}:`, readError.message);
      }
    }

    if (buffers.length === 0) {
      return NextResponse.json(
        { error: 'Failed to read chunk files.' },
        { status: 500 }
      );
    }

    const mergedBuffer = Buffer.concat(buffers);

    // Save the merged file
    let mergedFilePath;
    try {
      mergedFilePath = saveMergedFile(sessionId, questionIndex, mergedBuffer);
    } catch (saveError) {
      console.error('[Transcribe] Failed to save merged file:', saveError.message);
      return NextResponse.json(
        { error: 'Failed to save merged audio file.' },
        { status: 500 }
      );
    }

    // Transcribe the merged audio
    const transcriptionResult = await transcribeAudio(mergedFilePath);

    // Update session response with transcript data
    const responseEntry = session.responses.find(
      (r) => r.questionIndex === questionIndex
    );

    if (responseEntry) {
      responseEntry.transcript = transcriptionResult.transcript || '';
      responseEntry.transcriptConfidence = transcriptionResult.confidence || 0;
      responseEntry.duration = transcriptionResult.duration || 0;
      responseEntry.mergedFile = mergedFilePath;
      responseEntry.status = 'transcribed';
      session.markModified('responses');
      await session.save();
    }

    return NextResponse.json(
      {
        transcript: transcriptionResult.transcript || '',
        confidence: transcriptionResult.confidence || 0,
        duration: transcriptionResult.duration || 0,
        mergedFile: mergedFilePath,
        chunksProcessed: chunkPaths.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Transcribe POST] Error:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid session ID format.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Transcription failed.' },
      { status: 500 }
    );
  }
}
