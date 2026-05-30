import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Interview from '@/models/Interview';
import Session from '@/models/Session';

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    const interview = await Interview.findById(id)
      .populate('createdBy', 'name email')
      .lean();

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found.' },
        { status: 404 }
      );
    }

    // Fetch associated sessions with limited fields
    const sessions = await Session.find({ interviewId: id })
      .select('candidateName candidateEmail status evaluation.overallScore createdAt session_data.startedAt session_data.completedAt')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { interview: { ...interview, sessions } },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Interview GET] Error:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid interview ID format.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch interview.' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const body = await request.json();

    // Prevent updating immutable fields
    delete body._id;
    delete body.createdAt;
    delete body.updatedAt;

    const interview = await Interview.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Interview updated successfully.', interview },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Interview PUT] Error:', error);

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
      { error: 'Failed to update interview.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    const interview = await Interview.findById(id);
    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found.' },
        { status: 404 }
      );
    }

    // Delete all associated sessions first
    const deleteResult = await Session.deleteMany({ interviewId: id });

    // Delete the interview
    await Interview.findByIdAndDelete(id);

    return NextResponse.json(
      {
        message: 'Interview and associated sessions deleted successfully.',
        deletedSessions: deleteResult.deletedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Interview DELETE] Error:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid interview ID format.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete interview.' },
      { status: 500 }
    );
  }
}
