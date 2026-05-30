import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Session from '@/models/Session';
import Interview from '@/models/Interview';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const interviewId = searchParams.get('interviewId');
    const status = searchParams.get('status');
    const candidateEmail = searchParams.get('candidateEmail');

    const filter = {};
    if (interviewId) filter.interviewId = interviewId;
    if (status) filter.status = status;
    if (candidateEmail) filter.candidateEmail = candidateEmail.toLowerCase().trim();

    const sessions = await Session.find(filter)
      .populate('interviewId', 'title status questions')
      .sort({ createdAt: -1 })
      .lean();

    const normalizedSessions = sessions.map((session) => ({
      ...session,
      interview: session.interviewId || null,
    }));

    return NextResponse.json(
      { sessions: normalizedSessions, count: normalizedSessions.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Sessions GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { interviewId, candidateName, candidateEmail } = body;

    if (!interviewId) {
      return NextResponse.json(
        { error: 'Interview ID is required.' },
        { status: 400 }
      );
    }

    if (!candidateName || candidateName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Candidate name is required.' },
        { status: 400 }
      );
    }

    if (!candidateEmail || candidateEmail.trim().length === 0) {
      return NextResponse.json(
        { error: 'Candidate email is required.' },
        { status: 400 }
      );
    }

    // Validate the interview exists and is active
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found.' },
        { status: 404 }
      );
    }

    if (interview.status !== 'active') {
      return NextResponse.json(
        { error: `Interview is not active. Current status: ${interview.status}.` },
        { status: 400 }
      );
    }

    // Check if candidate already has an active session for this interview
    const existingSession = await Session.findOne({
      interviewId: interviewId,
      candidateEmail: candidateEmail.toLowerCase().trim(),
      status: { $in: ['pending', 'in_progress'] },
    });

    if (existingSession) {
      // Allow resuming the existing session
      return NextResponse.json(
        {
          message: 'Existing active session found. Resuming.',
          session: existingSession,
          resumed: true,
        },
        { status: 200 }
      );
    }

    // Initialize responses array with one entry per question
    const responses = interview.questions.map((_, index) => ({
      questionIndex: index,
      chunks: [],
      chunksReceived: 0,
      status: 'pending',
    }));

    const session = await Session.create({
      interviewId: interviewId,
      candidateName: candidateName.trim(),
      candidateEmail: candidateEmail.toLowerCase().trim(),
      status: 'pending',
      responses,
      session_data: {
        currentQuestionIndex: 0,
        lastHeartbeat: new Date(),
      },
    });

    // Increment candidate count on the interview
    await Interview.findByIdAndUpdate(interviewId, {
      $inc: { candidateCount: 1 },
    });

    return NextResponse.json(
      {
        message: 'Session created successfully.',
        session,
        resumed: false,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Sessions POST] Error:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid interview ID format.' },
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
      { error: 'Failed to create session.' },
      { status: 500 }
    );
  }
}
