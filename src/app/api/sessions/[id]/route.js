import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Session from '@/models/Session';

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    const session = await Session.findById(id)
      .populate('interviewId', 'title description questions settings status')
      .lean();

    // Map populated interviewId to 'interview' for frontend compatibility
    if (session && session.interviewId) {
      session.interview = session.interviewId;
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ session }, { status: 200 });
  } catch (error) {
    console.error('[Session GET] Error:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid session ID format.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch session.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, context) {
  return PUT(request, context);
}

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const body = await request.json();

    const session = await Session.findById(id);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found.' },
        { status: 404 }
      );
    }

    // ─── Handle flat dot-notation keys (from interview room) ─────
    const dotKeys = Object.keys(body).filter((k) => k.includes('.'));
    if (dotKeys.length > 0) {
      const setObj = {};
      dotKeys.forEach((k) => {
        setObj[k] = body[k];
      });
      await Session.findByIdAndUpdate(id, { $set: setObj });
      // Also handle non-dot keys if present
      const nonDotBody = {};
      Object.keys(body).filter((k) => !k.includes('.')).forEach((k) => {
        nonDotBody[k] = body[k];
      });
      if (Object.keys(nonDotBody).length === 0) {
        const updated = await Session.findById(id).lean();
        return NextResponse.json({ message: 'Session updated.', session: updated }, { status: 200 });
      }
      // Continue with non-dot keys
      Object.assign(body, nonDotBody);
    }

    // ─── Update top-level status ───────────────────────────────
    if (body.status) {
      session.status = body.status;

      // If completing, set completedAt
      if (body.status === 'completed' && !session.session_data.completedAt) {
        session.session_data.completedAt = new Date();

        // Calculate total duration if startedAt exists
        if (session.session_data.startedAt) {
          session.session_data.totalDuration = Math.round(
            (new Date() - new Date(session.session_data.startedAt)) / 1000
          );
        }
      }

      // If starting, set startedAt
      if (body.status === 'in_progress' && !session.session_data.startedAt) {
        session.session_data.startedAt = new Date();
      }
    }

    // ─── Update session_data (merge, don't overwrite) ──────────
    if (body.session_data) {
      if (body.session_data.currentQuestionIndex !== undefined) {
        session.session_data.currentQuestionIndex = body.session_data.currentQuestionIndex;
      }
      if (body.session_data.lastHeartbeat) {
        session.session_data.lastHeartbeat = new Date(body.session_data.lastHeartbeat);
      }
      if (body.session_data.userAgent) {
        session.session_data.userAgent = body.session_data.userAgent;
      }
      if (body.session_data.ipAddress) {
        session.session_data.ipAddress = body.session_data.ipAddress;
      }
    }

    // ─── Add proctoring events (push, don't overwrite) ─────────
    if (body.proctoring) {
      if (body.proctoring.event) {
        const eventType = body.proctoring.event.type;
        const eventMessage = body.proctoring.event.message || body.proctoring.event.details || '';
        const eventTimestamp = body.proctoring.event.timestamp || new Date();

        session.proctoring.events.push({
          type: eventType,
          message: eventMessage,
          severity: body.proctoring.event.severity || 'medium',
          timestamp: eventTimestamp,
          metadata: body.proctoring.event.metadata || {},
        });

        session.proctoring.suspiciousEvents.push({
          type: eventType,
          details: eventMessage,
          timestamp: eventTimestamp,
        });

        session.proctoring.warningCount = (session.proctoring.warningCount || 0) + 1;

        if (eventType === 'tab_switch' || eventType === 'window_blur') {
          session.proctoring.tabSwitchCount = (session.proctoring.tabSwitchCount || 0) + 1;
        }

        if (eventType === 'face_not_detected') {
          session.proctoring.faceAbsenceCount = (session.proctoring.faceAbsenceCount || 0) + 1;
        }
      }

      if (body.proctoring.warningCount !== undefined) {
        session.proctoring.warningCount = body.proctoring.warningCount;
      }
      if (body.proctoring.terminated !== undefined) {
        session.proctoring.terminated = body.proctoring.terminated;
      }
      if (body.proctoring.terminationReason) {
        session.proctoring.terminationReason = body.proctoring.terminationReason;
      }
      if (body.proctoring.faceDetectionRate !== undefined) {
        session.proctoring.faceDetectionRate = body.proctoring.faceDetectionRate;
      }
      if (body.proctoring.tabSwitchCount !== undefined) {
        session.proctoring.tabSwitchCount = body.proctoring.tabSwitchCount;
      }
    }

    // ─── Update response data ──────────────────────────────────
    if (body.response) {
      const { questionIndex, ...responseData } = body.response;

      if (questionIndex !== undefined && questionIndex >= 0) {
        // Find or create the response entry
        let responseEntry = session.responses.find(
          (r) => r.questionIndex === questionIndex
        );

        if (!responseEntry) {
          session.responses.push({
            questionIndex,
            chunks: [],
            chunksReceived: 0,
            status: 'pending',
          });
          responseEntry = session.responses[session.responses.length - 1];
        }

        // Merge response fields
        if (responseData.status) {
          responseEntry.status = responseData.status;
        }
        if (responseData.transcript !== undefined) {
          responseEntry.transcript = responseData.transcript;
        }
        if (responseData.transcriptConfidence !== undefined) {
          responseEntry.transcriptConfidence = responseData.transcriptConfidence;
        }
        if (responseData.duration !== undefined) {
          responseEntry.duration = responseData.duration;
        }
        if (responseData.startedAt) {
          responseEntry.startedAt = new Date(responseData.startedAt);
        }

        // Handle completion
        if (responseData.status === 'uploaded' || responseData.completedAt) {
          responseEntry.completedAt = responseData.completedAt
            ? new Date(responseData.completedAt)
            : new Date();
        }
      }
    }

    // Mark nested paths as modified so Mongoose saves them
    session.markModified('session_data');
    session.markModified('proctoring');
    session.markModified('responses');

    await session.save();

    return NextResponse.json(
      { message: 'Session updated successfully.', session },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Session PUT] Error:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid session ID format.' },
        { status: 400 }
      );
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json(
        { error: 'Validation failed.', details: messages },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update session.' },
      { status: 500 }
    );
  }
}
