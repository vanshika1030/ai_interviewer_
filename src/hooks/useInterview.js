'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export default function useInterview(sessionId) {
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sessionIdRef = useRef(sessionId);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Fetch session data on mount
  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      setError('No session ID provided');
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchSession = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/sessions/${sessionId}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to load session (${res.status})`);
        }

        const data = await res.json();
        const sessionData = data.session || data;

        setSession(sessionData);

        // Extract questions from the populated interview or directly
        const interviewQuestions =
          sessionData.interview?.questions ||
          sessionData.questions ||
          [];

        // Sort by order field
        const sortedQuestions = [...interviewQuestions].sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        );
        setQuestions(sortedQuestions);

        // Restore state from session_data if resuming
        const savedIndex = sessionData.session_data?.currentQuestionIndex || 0;
        setCurrentQuestionIndex(savedIndex);

        // Check if already completed
        if (sessionData.status === 'completed' || sessionData.status === 'evaluated') {
          setIsComplete(true);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('[useInterview] Failed to fetch session:', err);
        setError(err.message);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchSession();

    return () => {
      controller.abort();
    };
  }, [sessionId]);

  // Persist session state to server
  const updateSessionState = useCallback(
    async (updates) => {
      if (!sessionIdRef.current) return;

      try {
        const res = await fetch(`/api/sessions/${sessionIdRef.current}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error('[useInterview] Failed to update session:', errorData.error);
        } else {
          const data = await res.json();
          const updatedSession = data.session || data;
          setSession(updatedSession);
        }
      } catch (err) {
        console.error('[useInterview] Error updating session:', err);
      }
    },
    []
  );

  const startAnswer = useCallback(() => {
    setIsAnswering(true);

    updateSessionState({
      status: 'in_progress',
      session_data: {
        currentQuestionIndex: currentQuestionIndex,
        startedAt: session?.session_data?.startedAt || new Date().toISOString(),
      },
      response: {
        questionIndex: currentQuestionIndex,
        status: 'recording',
        startedAt: new Date().toISOString(),
      },
    });
  }, [currentQuestionIndex, session, updateSessionState]);

  const submitAnswer = useCallback(
    async (transcript = '') => {
      setIsAnswering(false);

      await updateSessionState({
        response: {
          questionIndex: currentQuestionIndex,
          transcript: transcript,
          status: 'uploaded',
          completedAt: new Date().toISOString(),
        },
      });
    },
    [currentQuestionIndex, updateSessionState]
  );

  const completeInterview = useCallback(async () => {
    setIsComplete(true);
    setIsAnswering(false);

    await updateSessionState({
      status: 'completed',
      session_data: {
        currentQuestionIndex: currentQuestionIndex,
        completedAt: new Date().toISOString(),
      },
    });
  }, [currentQuestionIndex, updateSessionState]);

  const nextQuestion = useCallback(async () => {
    const nextIdx = currentQuestionIndex + 1;

    if (nextIdx >= questions.length) {
      await completeInterview();
      return;
    }

    setIsTransitioning(true);

    try {
      setCurrentQuestionIndex(nextIdx);

      await updateSessionState({
        session_data: {
          currentQuestionIndex: nextIdx,
        },
      });

      // Small delay for transition animation
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      console.error('[useInterview] Error advancing to next question:', err);
    } finally {
      setIsTransitioning(false);
    }
  }, [completeInterview, currentQuestionIndex, questions.length, updateSessionState]);

  const resumeInterview = useCallback(async () => {
    if (!session) return;

    const savedIndex = session.session_data?.currentQuestionIndex || 0;
    setCurrentQuestionIndex(savedIndex);
    setIsComplete(false);
    setIsAnswering(false);
    setIsTransitioning(false);

    // Check which questions already have responses
    const responses = session.responses || [];
    const lastAnsweredIndex = responses.reduce((max, r) => {
      if (
        r.status === 'uploaded' ||
        r.status === 'transcribed' ||
        r.status === 'evaluated'
      ) {
        return Math.max(max, r.questionIndex);
      }
      return max;
    }, -1);

    // Resume from next unanswered question
    const resumeIndex = Math.max(savedIndex, lastAnsweredIndex + 1);
    const clampedIndex = Math.min(resumeIndex, questions.length - 1);

    setCurrentQuestionIndex(clampedIndex);

    await updateSessionState({
      status: 'in_progress',
      session_data: {
        currentQuestionIndex: clampedIndex,
      },
    });
  }, [session, questions.length, updateSessionState]);

  return {
    session,
    questions,
    currentQuestionIndex,
    currentQuestion: questions[currentQuestionIndex] || null,
    isAnswering,
    isTransitioning,
    isComplete,
    loading,
    error,
    totalQuestions: questions.length,
    progress:
      questions.length > 0
        ? Math.round((currentQuestionIndex / questions.length) * 100)
        : 0,
    startAnswer,
    submitAnswer,
    nextQuestion,
    completeInterview,
    resumeInterview,
  };
}
