import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Session from '@/models/Session';
import Interview from '@/models/Interview';
import { evaluateResponse, evaluateInterview } from '@/lib/evaluator';

export async function POST(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // id here refers to a session ID
    const session = await Session.findById(id);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found.' },
        { status: 404 }
      );
    }

    // Fetch the parent interview to get question texts
    const interview = await Interview.findById(session.interviewId);
    if (!interview) {
      return NextResponse.json(
        { error: 'Associated interview not found.' },
        { status: 404 }
      );
    }

    // Evaluate each response that has a transcript
    const evaluationResults = [];

    for (let i = 0; i < session.responses.length; i++) {
      const response = session.responses[i];
      const questionIndex = response.questionIndex;
      const question = interview.questions[questionIndex];

      if (!question) {
        evaluationResults.push({
          questionIndex,
          score: 0,
          feedback: 'Question not found in interview definition.',
        });
        continue;
      }

      const transcript = response.transcript || '';

      const evaluation = await evaluateResponse(question.text, transcript);

      // Update the response evaluation in the session
      session.responses[i].evaluation = {
        score: evaluation.score,
        communication: evaluation.communication || 0,
        relevance: evaluation.relevance || 0,
        depth: evaluation.depth || 0,
        confidence: evaluation.confidence || 0,
        feedback: evaluation.feedback,
      };

      if (transcript.length > 0) {
        session.responses[i].status = 'evaluated';
      }

      evaluationResults.push({
        questionIndex,
        questionText: question.text,
        ...evaluation,
      });
    }

    // Compute overall interview evaluation
    const overallEval = evaluateInterview(session.responses);

    // Determine recommendation based on overall score
    let recommendation = 'pending';
    if (overallEval.overallScore >= 85) recommendation = 'strong_hire';
    else if (overallEval.overallScore >= 70) recommendation = 'hire';
    else if (overallEval.overallScore >= 55) recommendation = 'maybe';
    else if (overallEval.overallScore >= 40) recommendation = 'no_hire';
    else recommendation = 'strong_no_hire';

    session.evaluation = {
      overallScore: overallEval.overallScore,
      communicationAvg: overallEval.communicationAvg,
      relevanceAvg: overallEval.relevanceAvg,
      depthAvg: overallEval.depthAvg,
      confidenceAvg: overallEval.confidenceAvg,
      aiSummary: overallEval.aiSummary || '',
      strengths: overallEval.strengths || [],
      improvements: overallEval.improvements || [],
      evaluatedAt: new Date(),
    };

    session.status = 'evaluated';

    await session.save();

    return NextResponse.json(
      {
        message: 'Evaluation completed successfully.',
        sessionId: session._id,
        evaluation: session.evaluation,
        responseEvaluations: evaluationResults,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Evaluate Route] Error:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid session ID format.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to evaluate session.' },
      { status: 500 }
    );
  }
}
