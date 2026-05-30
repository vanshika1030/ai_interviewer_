import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Interview from '@/models/Interview';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const createdBy = searchParams.get('createdBy');

    const filter = {};
    if (status) filter.status = status;
    if (createdBy) filter.createdBy = createdBy;

    const interviews = await Interview.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { interviews, count: interviews.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Interviews GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { title, description, questions, settings } = body;

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Interview title is required.' },
        { status: 400 }
      );
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'At least one question is required.' },
        { status: 400 }
      );
    }

    // Validate each question has text
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text || questions[i].text.trim().length === 0) {
        return NextResponse.json(
          { error: `Question ${i + 1} must have text content.` },
          { status: 400 }
        );
      }
    }

    // Assign order to questions if not set
    const orderedQuestions = questions.map((q, index) => ({
      ...q,
      order: q.order ?? index,
    }));

    const interview = await Interview.create({
      title: title.trim(),
      description: description?.trim() || '',
      questions: orderedQuestions,
      settings: settings || {},
    });

    return NextResponse.json(
      { message: 'Interview created successfully.', interview },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Interviews POST] Error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json(
        { error: 'Validation failed: ' + messages.join(', '), details: messages },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create interview.' },
      { status: 500 }
    );
  }
}
