import { NextResponse } from 'next/server';
import fs from 'fs';
import { getMergedFilePath } from '@/lib/storage';

export async function GET(request, { params }) {
  try {
    const { sessionId } = params;
    const { searchParams } = new URL(request.url);
    const questionIndex = parseInt(searchParams.get('questionIndex'), 10);

    if (isNaN(questionIndex) || questionIndex < 0) {
      return NextResponse.json(
        { error: 'Valid questionIndex query parameter is required.' },
        { status: 400 }
      );
    }

    // Get the merged file path
    const filePath = getMergedFilePath(sessionId, questionIndex);

    if (!filePath) {
      return NextResponse.json(
        { error: 'Media file not found.' },
        { status: 404 }
      );
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    // ─── Range request support for video seeking ───────────────
    const rangeHeader = request.headers.get('range');

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize || start > end) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            'Content-Range': `bytes */${fileSize}`,
          },
        });
      }

      const chunkSize = end - start + 1;
      const fileBuffer = Buffer.alloc(chunkSize);
      const fd = fs.openSync(filePath, 'r');
      fs.readSync(fd, fileBuffer, 0, chunkSize, start);
      fs.closeSync(fd);

      return new NextResponse(fileBuffer, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(chunkSize),
          'Content-Type': 'video/webm',
          'Content-Disposition': `inline; filename="session_${sessionId}_q${questionIndex}.webm"`,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // ─── Full file response ────────────────────────────────────
    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/webm',
        'Content-Length': String(fileSize),
        'Content-Disposition': `inline; filename="session_${sessionId}_q${questionIndex}.webm"`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[Media GET] Error:', error);

    if (error.code === 'ENOENT') {
      return NextResponse.json(
        { error: 'Media file not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to serve media file.' },
      { status: 500 }
    );
  }
}
