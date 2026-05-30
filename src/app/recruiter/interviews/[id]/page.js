'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';

function InterviewDetailContent() {
  const router = useRouter();
  const params = useParams();
  const interviewId = params.id;

  const [interview, setInterview] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState(null);
  const [evaluating, setEvaluating] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [intRes, sesRes] = await Promise.all([
        fetch(`/api/interviews/${interviewId}`),
        fetch(`/api/sessions?interviewId=${interviewId}`),
      ]);
      const intData = await intRes.json();
      const sesData = await sesRes.json();
      setInterview(intData.interview || intData);
      setSessions(sesData.sessions || []);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  }, [interviewId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEvaluate = async (sessionId) => {
    setEvaluating(sessionId);
    try {
      const res = await fetch(`/api/interviews/${sessionId}/evaluate`, { method: 'POST' });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Evaluation failed:', err);
    } finally {
      setEvaluating(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      in_progress: '#6366f1',
      completed: '#22c55e',
      evaluated: '#a855f7',
      abandoned: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getRiskLevel = (session) => {
    const tabSwitches = session.proctoring?.tabSwitchCount || 0;
    const faceAbsences = session.proctoring?.faceAbsenceCount || 0;
    const total = tabSwitches + faceAbsences;
    if (total >= 6) return { level: 'High', color: '#ef4444' };
    if (total >= 3) return { level: 'Medium', color: '#f59e0b' };
    return { level: 'Low', color: '#22c55e' };
  };

  const getProctoringEvents = (session) => {
    const suspiciousEvents = session.proctoring?.suspiciousEvents || [];
    if (suspiciousEvents.length > 0) return suspiciousEvents;

    return (session.proctoring?.events || []).map((event) => ({
      ...event,
      details: event.details || event.message || '',
    }));
  };

  const getProctoringEventDisplay = (type) => {
    switch (type) {
      case 'tab-switch':
      case 'tab_switch':
      case 'window_blur':
        return { icon: 'ðŸ”€', label: 'Tab or window focus changed', color: '#f59e0b' };
      case 'no-face':
      case 'face_not_detected':
        return { icon: 'ðŸ‘¤', label: 'Face not detected', color: '#ef4444' };
      default:
        return { icon: 'âš ï¸', label: type, color: '#6b7280' };
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'transparent',
      padding: '100px 40px 40px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    backBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      color: '#94a3b8',
      fontSize: '0.9rem',
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      marginBottom: '24px',
      transition: 'color 0.2s ease',
    },
    headerCard: {
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02) 46%, rgba(9, 14, 34, 0.42))',
      backdropFilter: 'blur(26px) saturate(180%)',
      WebkitBackdropFilter: 'blur(26px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: '0 18px 55px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
      borderRadius: '20px',
      padding: '30px',
      marginBottom: '30px',
    },
    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: '16px',
    },
    interviewTitle: {
      fontSize: '1.8rem',
      fontWeight: '700',
      color: '#f8fafc',
      marginBottom: '8px',
    },
    interviewMeta: {
      color: '#94a3b8',
      fontSize: '0.9rem',
      display: 'flex',
      gap: '20px',
      flexWrap: 'wrap',
    },
    badge: (color) => ({
      display: 'inline-block',
      padding: '4px 14px',
      borderRadius: '999px',
      fontSize: '0.8rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      background: `${color}20`,
      color: color,
      border: `1px solid ${color}40`,
    }),
    interviewCode: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      padding: '12px 16px',
      marginTop: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    codeLabel: {
      color: '#94a3b8',
      fontSize: '0.85rem',
    },
    codeValue: {
      color: '#DAA464',
      fontFamily: 'monospace',
      fontSize: '0.9rem',
      letterSpacing: '1px',
    },
    sectionTitle: {
      fontSize: '1.3rem',
      fontWeight: '600',
      color: '#f8fafc',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    sessionCard: (isExpanded) => ({
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.01) 50%, rgba(9, 14, 34, 0.38))',
      border: `1px solid ${isExpanded ? 'rgba(218,164,100,0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
      borderRadius: '18px',
      marginBottom: '16px',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(22px) saturate(160%)',
      WebkitBackdropFilter: 'blur(22px) saturate(160%)',
      boxShadow: isExpanded
        ? '0 16px 48px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.18)'
        : '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    }),
    sessionHeader: {
      padding: '20px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
      transition: 'background 0.2s ease',
    },
    sessionInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    candidateName: {
      color: '#f8fafc',
      fontWeight: '600',
      fontSize: '1.05rem',
    },
    candidateEmail: {
      color: '#94a3b8',
      fontSize: '0.85rem',
    },
    sessionRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    scoreCircle: (score) => ({
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      fontSize: '0.95rem',
      color: '#0a0a1e',
      background: score >= 80 ? '#DEC384' :
                  score >= 60 ? '#f59e0b' :
                  score > 0 ? '#ef4444' :
                   'rgba(255,255,255,0.06)',
    }),
    proctorSummary: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
    },
    proctorBadge: (color) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '0.8rem',
      color: color,
      background: `${color}15`,
      padding: '4px 10px',
      borderRadius: '6px',
    }),
    expandedContent: {
      padding: '0 24px 24px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
    },
    responseCard: {
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '10px',
      padding: '18px',
      marginTop: '16px',
      border: '1px solid rgba(255,255,255,0.08)',
    },
    questionLabel: {
      color: '#94a3b8',
      fontSize: '0.8rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '6px',
    },
    questionText: {
      color: '#f8fafc',
      fontSize: '0.95rem',
      marginBottom: '12px',
    },
    transcript: {
      color: '#94a3b8',
      fontSize: '0.9rem',
      lineHeight: '1.6',
      fontStyle: 'italic',
      padding: '12px 16px',
      background: 'rgba(255, 255, 255, 0.02)',
      borderRadius: '8px',
      borderLeft: '3px solid rgba(218,164,100,0.6)',
    },
    scoreRow: {
      display: 'flex',
      gap: '16px',
      marginTop: '12px',
      flexWrap: 'wrap',
    },
    scorePill: (label, value) => ({
      padding: '6px 14px',
      borderRadius: '8px',
      fontSize: '0.8rem',
      background: 'rgba(15,20,45,0.3)',
      color: '#94a3b8',
      border: '1px solid rgba(255,255,255,0.08)',
    }),
    btn: (variant) => ({
      padding: '8px 18px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.85rem',
      transition: 'all 0.2s ease',
      background: variant === 'primary' || variant === 'evaluate' ? '#DAA464' :
                   'rgba(15,20,45,0.4)',
      color: variant === 'primary' || variant === 'evaluate' ? '#0a0a1e' : '#94a3b8',
    }),
    proctorTimeline: {
      marginTop: '16px',
    },
    eventItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    },
    eventDot: (color) => ({
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: color,
      flexShrink: 0,
    }),
    eventText: {
      color: '#94a3b8',
      fontSize: '0.85rem',
    },
    eventTime: {
      color: '#767F9E',
      fontSize: '0.75rem',
      marginLeft: 'auto',
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#94a3b8',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>
          Loading interview details...
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
          <p style={{ fontSize: '1.1rem' }}>Interview not found</p>
          <button style={{ ...styles.btn('primary'), marginTop: '20px' }} onClick={() => router.push('/recruiter')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => router.push('/recruiter')}>
        ← Back to Dashboard
      </button>

      {/* Interview Header */}
      <div style={styles.headerCard}>
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.interviewTitle}>{interview.title}</h1>
            <div style={styles.interviewMeta}>
              <span>📝 {interview.questions?.length || 0} Questions</span>
              <span>👥 {sessions.length} Candidates</span>
              <span>📅 {new Date(interview.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <span style={styles.badge(getStatusColor(interview.status))}>{interview.status}</span>
        </div>
        {interview.description && (
           <p style={{ color: '#94a3b8', marginTop: '12px', fontSize: '0.95rem' }}>
            {interview.description}
          </p>
        )}
        <div style={styles.interviewCode}>
          <span style={styles.codeLabel}>Interview Code:</span>
          <span style={styles.codeValue}>{interview._id}</span>
          <button
            style={{ ...styles.btn('secondary'), padding: '4px 10px', fontSize: '0.75rem' }}
            onClick={() => navigator.clipboard?.writeText(interview._id)}
          >
            Copy
          </button>
        </div>
      </div>

      {/* Sessions */}
      <h2 style={styles.sectionTitle}>
        <span>👥</span> Candidate Sessions ({sessions.length})
      </h2>

      {sessions.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
          <p>No candidates have started this interview yet.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>Share the interview code above with candidates.</p>
        </div>
      ) : (
        sessions.map((session) => {
          const isExpanded = expandedSession === session._id;
          const risk = getRiskLevel(session);
          const proctoringEvents = getProctoringEvents(session);

          return (
            <div key={session._id} style={styles.sessionCard(isExpanded)}>
              <div
                style={styles.sessionHeader}
                onClick={() => setExpandedSession(isExpanded ? null : session._id)}
              >
                <div style={styles.sessionInfo}>
                  <div style={styles.candidateName}>{session.candidateName}</div>
                  <div style={styles.candidateEmail}>{session.candidateEmail}</div>
                </div>
                <div style={styles.sessionRight}>
                  {(session.proctoring?.tabSwitchCount > 0) && (
                    <span style={styles.proctorBadge('#f59e0b')}>
                      🔀 {session.proctoring.tabSwitchCount} tab switches
                    </span>
                  )}
                  {session.evaluation?.overallScore > 0 && (
                    <div style={styles.scoreCircle(session.evaluation.overallScore)}>
                      {session.evaluation.overallScore}
                    </div>
                  )}
                  <span style={styles.badge(getStatusColor(session.status))}>{session.status?.replace('_', ' ')}</span>
                  {session.status === 'completed' && (
                    <button
                      style={styles.btn('evaluate')}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEvaluate(session._id);
                      }}
                      disabled={evaluating === session._id}
                    >
                      {evaluating === session._id ? '⏳ Evaluating...' : '🤖 Evaluate'}
                    </button>
                  )}
                   <span style={{ color: '#94a3b8', fontSize: '1.2rem' }}>
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div style={styles.expandedContent}>
                  {/* Evaluation Summary */}
                  {session.evaluation?.overallScore > 0 && (
                    <div style={{ ...styles.responseCard, borderLeft: '3px solid #DAA464' }}>
                      <div style={styles.questionLabel}>AI Evaluation Summary</div>
                      <div style={styles.scoreRow}>
                        <span style={styles.scorePill()}>
                          📊 Overall: {session.evaluation.overallScore}/100
                        </span>
                        <span style={styles.scorePill()}>
                          💬 Communication: {session.evaluation.communicationAvg?.toFixed(1)}/10
                        </span>
                        <span style={styles.scorePill()}>
                          🎯 Relevance: {session.evaluation.relevanceAvg?.toFixed(1)}/10
                        </span>
                        <span style={styles.scorePill()}>
                          📚 Depth: {session.evaluation.depthAvg?.toFixed(1)}/10
                        </span>
                        <span style={styles.scorePill()}>
                          💪 Confidence: {session.evaluation.confidenceAvg?.toFixed(1)}/10
                        </span>
                      </div>
                      {session.evaluation.aiSummary && (
                        <p style={{ ...styles.transcript, marginTop: '12px', fontStyle: 'normal' }}>
                          {session.evaluation.aiSummary}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Responses */}
                  {(session.responses || []).map((response, idx) => {
                    const question = interview.questions?.[response.questionIndex || idx];
                    return (
                      <div key={idx} style={styles.responseCard}>
                        <div style={styles.questionLabel}>Question {(response.questionIndex || idx) + 1}</div>
                        <div style={styles.questionText}>{question?.text || 'Question not available'}</div>
                        {response.transcript ? (
                          <div style={styles.transcript}>&ldquo;{response.transcript}&rdquo;</div>
                        ) : (
                           <div style={{ ...styles.transcript, color: '#64748b' }}>
                            No transcript available
                          </div>
                        )}
                        {response.evaluation?.score > 0 && (
                          <div style={styles.scoreRow}>
                            <span style={styles.scorePill()}>Score: {response.evaluation.score}</span>
                            <span style={styles.scorePill()}>Comm: {response.evaluation.communication}/10</span>
                            <span style={styles.scorePill()}>Rel: {response.evaluation.relevance}/10</span>
                            <span style={styles.scorePill()}>Depth: {response.evaluation.depth}/10</span>
                          </div>
                        )}
                        {response.chunks?.length > 0 && (
                           <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '0.8rem' }}>
                            📹 {response.chunks.length} chunks recorded
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Proctoring Timeline */}
                  {proctoringEvents.length > 0 && (
                    <div style={styles.proctorTimeline}>
                      <div style={styles.questionLabel}>Proctoring Events</div>
                      {proctoringEvents.map((event, idx) => {
                        const display = getProctoringEventDisplay(event.type);
                        return (
                        <div key={idx} style={styles.eventItem}>
                          <div style={styles.eventDot(display.color)} />
                          <span style={styles.eventText}>
                            {event.type === 'tab-switch' ? '🔀 Tab switched' :
                             event.type === 'no-face' ? '👤 Face not detected' :
                             event.type}
                            {event.details ? ` — ${event.details}` : ''}
                          </span>
                          <span style={styles.eventTime}>
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// Wrap with AuthGuard requiring recruiter role
export default function InterviewDetailPage() {
  return (
    <AuthGuard requiredRole="recruiter">
      <InterviewDetailContent />
    </AuthGuard>
  );
}
