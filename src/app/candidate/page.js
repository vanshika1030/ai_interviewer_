'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard, { getStoredAuth, logout } from '@/components/AuthGuard';

const keyframes = `
@keyframes candidateFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes candidatePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
@keyframes candidateFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
@keyframes candidateGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(218, 164, 100, 0.2); }
  50% { box-shadow: 0 0 40px rgba(218, 164, 100, 0.4), 0 0 60px rgba(222, 195, 132, 0.2); }
}
@keyframes candidateSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes candidateShimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

const styles = {
  page: {
    minHeight: '100vh',
    background: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    position: 'relative',
    overflow: 'hidden',
  },
  bgOrb1: {
    position: 'absolute',
    top: '-20%',
    left: '-10%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(218, 164, 100, 0.08) 0%, transparent 70%)',
    filter: 'blur(60px)',
    pointerEvents: 'none',
    animation: 'candidateFloat 8s ease-in-out infinite',
  },
  bgOrb2: {
    position: 'absolute',
    bottom: '-20%',
    right: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(222, 195, 132, 0.08) 0%, transparent 70%)',
    filter: 'blur(60px)',
    pointerEvents: 'none',
    animation: 'candidateFloat 10s ease-in-out infinite 2s',
  },
  container: {
    maxWidth: '520px',
    width: '100%',
    zIndex: 1,
    animation: 'candidateFadeIn 0.6s ease-out',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logo: {
    fontSize: '40px',
    marginBottom: '12px',
    animation: 'candidateFloat 4s ease-in-out infinite',
    display: 'inline-block',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#f8fafc',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#94a3b8',
    margin: 0,
    fontWeight: 400,
  },
  card: {
    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02) 46%, rgba(9, 14, 34, 0.42))',
    backdropFilter: 'blur(26px) saturate(180%)',
    WebkitBackdropFilter: 'blur(26px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '24px',
    padding: '36px',
    boxShadow: '0 18px 55px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.22), inset 0 -28px 60px rgba(255, 255, 255, 0.02)',
  },
  tabContainer: {
    display: 'flex',
    gap: '4px',
    marginBottom: '28px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '4px',
  },
  tab: (active) => ({
    flex: 1,
    padding: '10px 16px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: 'inherit',
    transition: 'all 0.25s ease',
    background: active
      ? '#DAA464'
      : 'transparent',
    color: active ? '#0a0a1e' : '#94a3b8',
  }),
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#f8fafc',
    marginBottom: '8px',
    letterSpacing: '0.3px',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(15, 20, 45, 0.5)',
    color: '#f8fafc',
    fontSize: '15px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.25s ease',
    boxSizing: 'border-box',
  },
  inputFocus: {
    borderColor: '#DAA464',
    boxShadow: '0 0 0 3px rgba(218, 164, 100, 0.2)',
    background: 'rgba(20, 25, 55, 0.7)',
  },
  interviewDetails: {
    background: 'rgba(218, 164, 100, 0.1)',
    border: '1px solid rgba(218, 164, 100, 0.3)',
    borderRadius: '14px',
    padding: '20px',
    marginBottom: '24px',
    animation: 'candidateFadeIn 0.4s ease-out',
  },
  detailTitle: {
    fontSize: '17px',
    fontWeight: 700,
    color: '#f8fafc',
    margin: '0 0 6px 0',
  },
  detailDesc: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: '0 0 14px 0',
    lineHeight: 1.5,
  },
  detailMeta: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#94a3b8',
  },
  metaIcon: {
    fontSize: '16px',
  },
  metaValue: {
    color: '#DAA464',
    fontWeight: 600,
  },
  button: (disabled) => ({
    width: '100%',
    padding: '16px 24px',
    borderRadius: '14px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: 'inherit',
    color: disabled ? '#94a3b8' : '#0a0a1e',
    background: disabled
      ? 'rgba(255, 255, 255, 0.05)'
      : '#DAA464',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.3s ease',
    boxShadow: disabled
      ? 'none'
      : '0 4px 20px rgba(218, 164, 100, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    letterSpacing: '0.3px',
  }),
  errorBox: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    padding: '14px 16px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: '#fca5a5',
    animation: 'candidateFadeIn 0.3s ease-out',
  },
  spinner: {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderTopColor: '#DAA464',
    borderRadius: '50%',
    animation: 'candidateSpin 0.6s linear infinite',
    flexShrink: 0,
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    margin: '24px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255, 255, 255, 0.06)',
  },
  dividerText: {
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  resumeSection: {
    animation: 'candidateFadeIn 0.5s ease-out',
  },
  sessionList: {
    maxHeight: '200px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '16px',
  },
  sessionItem: {
    background: 'rgba(15, 20, 45, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '14px 16px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionItemHover: {
    background: 'rgba(218, 164, 100, 0.15)',
    borderColor: 'rgba(218, 164, 100, 0.5)',
  },
  sessionName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#f8fafc',
    margin: '0 0 4px 0',
  },
  sessionStatus: (status) => {
    const colors = {
      pending: '#DAA464',
      in_progress: '#DAA464',
      completed: '#22c55e',
      evaluated: '#22c55e',
    };
    return {
      fontSize: '12px',
      fontWeight: 600,
      color: colors[status] || '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    };
  },
  resumeArrow: {
    fontSize: '18px',
    color: '#DAA464',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '13px',
    color: '#94a3b8',
  },
};

function CandidatePageContent() {
  const router = useRouter();
  const { user } = getStoredAuth();
  const [activeTab, setActiveTab] = useState('new');

  // New interview state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [interviewCode, setInterviewCode] = useState('');
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [fetchingInterview, setFetchingInterview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Resume state
  const [resumeEmail, setResumeEmail] = useState('');
  const [searchingSessions, setSearchingSessions] = useState(false);
  const [existingSessions, setExistingSessions] = useState([]);
  const [resumeError, setResumeError] = useState('');

  // Input focus tracking
  const [focusedInput, setFocusedInput] = useState(null);
  const [hoveredSession, setHoveredSession] = useState(null);
  const fetchTimeoutRef = useRef(null);

  // Debounced fetch of interview details when code changes
  useEffect(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    if (!interviewCode || interviewCode.trim().length < 10) {
      setInterviewDetails(null);
      setError('');
      return;
    }

    fetchTimeoutRef.current = setTimeout(() => {
      fetchInterviewDetails(interviewCode.trim());
    }, 600);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [interviewCode]);

  const fetchInterviewDetails = async (code) => {
    try {
      setFetchingInterview(true);
      setError('');
      setInterviewDetails(null);

      const res = await fetch(`/api/interviews/${code}`);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Invalid interview code');
      }

      const data = await res.json();
      const interview = data.interview || data;

      if (interview.status !== 'active') {
        throw new Error('This interview is not currently accepting responses');
      }

      setInterviewDetails(interview);
    } catch (err) {
      setError(err.message);
      setInterviewDetails(null);
    } finally {
      setFetchingInterview(false);
    }
  };

  const handleStartInterview = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!interviewDetails) {
      setError('Please enter a valid interview code');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId: interviewDetails._id,
          candidateName: name.trim(),
          candidateEmail: email.trim().toLowerCase(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create session');
      }

      const data = await res.json();
      const sessionId = data.session?._id || data._id || data.sessionId;

      if (!sessionId) {
        throw new Error('No session ID returned from server');
      }

      router.push(`/candidate/hardware-check?sessionId=${sessionId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchSessions = async () => {
    if (!resumeEmail.trim() || !resumeEmail.includes('@')) {
      setResumeError('Please enter a valid email address');
      return;
    }

    try {
      setSearchingSessions(true);
      setResumeError('');
      setExistingSessions([]);

      const res = await fetch(
        `/api/sessions?candidateEmail=${encodeURIComponent(resumeEmail.trim().toLowerCase())}`
      );

      if (!res.ok) {
        throw new Error('Failed to search for sessions');
      }

      const data = await res.json();
      const sessions = data.sessions || data || [];
      const resumable = Array.isArray(sessions)
        ? sessions.filter(
            (s) =>
              s.status === 'pending' ||
              s.status === 'in_progress'
          )
        : [];

      if (resumable.length === 0) {
        setResumeError('No active sessions found for this email');
      } else {
        setExistingSessions(resumable);
      }
    } catch (err) {
      setResumeError(err.message);
    } finally {
      setSearchingSessions(false);
    }
  };

  const handleResumeSession = (sessionId) => {
    router.push(`/candidate/hardware-check?sessionId=${sessionId}`);
  };

  const getInputStyle = (inputName) => ({
    ...styles.input,
    ...(focusedInput === inputName ? styles.inputFocus : {}),
  });

  const estimatedDuration = interviewDetails
    ? Math.ceil(
        interviewDetails.questions.reduce(
          (sum, q) => sum + (q.timeLimit || q.duration || 120),
          0
        ) / 60
      )
    : 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      <div style={styles.page}>
        <div style={styles.bgOrb1} />
        <div style={styles.bgOrb2} />

         <div style={styles.container}>
          {/* Navbar */}
          <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            padding: '16px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(9, 14, 34, 0.6))',
            backdropFilter: 'blur(20px) saturate(160%)',
            WebkitBackdropFilter: 'blur(20px) saturate(160%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
          }}>
            <button onClick={() => router.push('/')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <span style={{
                width: '12px', height: '12px', borderRadius: '3px',
                background: 'linear-gradient(135deg, #f4d39c, #DAA464)',
                boxShadow: '0 0 16px rgba(218, 164, 100, 0.5)',
                transform: 'rotate(45deg)', display: 'inline-block',
              }} />
              <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.2rem' }}>
                Interview<span style={{ color: '#DAA464' }}>AI</span>
              </span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{
                fontSize: '13px', color: '#94a3b8',
                padding: '6px 14px', borderRadius: '10px',
                background: 'rgba(218, 164, 100, 0.1)',
                border: '1px solid rgba(218, 164, 100, 0.2)',
              }}>
                🎥 {user?.name || user?.email || 'Candidate'}
              </span>
              <button onClick={() => logout(router)} style={{
                padding: '8px 18px', borderRadius: '10px',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                background: 'rgba(239, 68, 68, 0.08)',
                color: '#f87171', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.2s ease',
              }}>
                Logout
              </button>
            </div>
          </nav>

          {/* Header */}
          <div style={styles.header}>
            <div style={styles.logo}>🎥</div>
            <h1 style={styles.title}>AI Video Interview</h1>
            <p style={styles.subtitle}>
              Enter your details to begin your interview session
            </p>
          </div>

          {/* Main Card */}
          <div style={styles.card}>
            {/* Tabs */}
            <div style={styles.tabContainer}>
              <button
                style={styles.tab(activeTab === 'new')}
                onClick={() => {
                  setActiveTab('new');
                  setResumeError('');
                }}
              >
                ✨ New Interview
              </button>
              <button
                style={styles.tab(activeTab === 'resume')}
                onClick={() => {
                  setActiveTab('resume');
                  setError('');
                }}
              >
                🔄 Resume Session
              </button>
            </div>

            {activeTab === 'new' && (
              <form onSubmit={handleStartInterview}>
                {/* Name */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedInput('name')}
                    onBlur={() => setFocusedInput(null)}
                    style={getInputStyle('name')}
                    required
                    autoComplete="name"
                  />
                </div>

                {/* Email */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    style={getInputStyle('email')}
                    required
                    autoComplete="email"
                  />
                </div>

                {/* Interview Code */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Interview Code</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Paste the interview ID provided to you"
                      value={interviewCode}
                      onChange={(e) => setInterviewCode(e.target.value)}
                      onFocus={() => setFocusedInput('code')}
                      onBlur={() => setFocusedInput(null)}
                      style={{
                        ...getInputStyle('code'),
                        paddingRight: fetchingInterview ? '44px' : '16px',
                      }}
                      required
                    />
                    {fetchingInterview && (
                      <div
                        style={{
                          position: 'absolute',
                          right: '14px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                        }}
                      >
                        <span style={styles.spinner} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Interview Details */}
                {interviewDetails && (
                  <div style={styles.interviewDetails}>
                    <h3 style={styles.detailTitle}>
                      {interviewDetails.title}
                    </h3>
                    {interviewDetails.description && (
                      <p style={styles.detailDesc}>
                        {interviewDetails.description}
                      </p>
                    )}
                    <div style={styles.detailMeta}>
                      <div style={styles.metaItem}>
                        <span style={styles.metaIcon}>📝</span>
                        <span style={styles.metaValue}>
                          {interviewDetails.questions?.length || 0}
                        </span>
                        Questions
                      </div>
                      <div style={styles.metaItem}>
                        <span style={styles.metaIcon}>⏱️</span>
                        <span style={styles.metaValue}>
                          ~{estimatedDuration}
                        </span>
                        min
                      </div>
                      <div style={styles.metaItem}>
                        <span style={styles.metaIcon}>🎯</span>
                        <span
                          style={{
                            ...styles.metaValue,
                            color: '#22c55e',
                          }}
                        >
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div style={styles.errorBox}>
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !interviewDetails ||
                    !name.trim() ||
                    !email.trim()
                  }
                  style={styles.button(
                    submitting ||
                      !interviewDetails ||
                      !name.trim() ||
                      !email.trim()
                  )}
                >
                  {submitting ? (
                    <>
                      <span style={styles.spinner} />
                      Creating Session...
                    </>
                  ) : (
                    <>
                      🚀 Start Interview
                    </>
                  )}
                </button>
              </form>
            )}

            {activeTab === 'resume' && (
              <div style={styles.resumeSection}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Email Address Used Previously
                  </label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={resumeEmail}
                    onChange={(e) => setResumeEmail(e.target.value)}
                    onFocus={() => setFocusedInput('resumeEmail')}
                    onBlur={() => setFocusedInput(null)}
                    style={getInputStyle('resumeEmail')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearchSessions();
                      }
                    }}
                  />
                </div>

                {resumeError && (
                  <div style={styles.errorBox}>
                    <span>⚠️</span>
                    <span>{resumeError}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSearchSessions}
                  disabled={
                    searchingSessions ||
                    !resumeEmail.trim()
                  }
                  style={styles.button(
                    searchingSessions || !resumeEmail.trim()
                  )}
                >
                  {searchingSessions ? (
                    <>
                      <span style={styles.spinner} />
                      Searching...
                    </>
                  ) : (
                    <>🔍 Find My Sessions</>
                  )}
                </button>

                {/* Session List */}
                {existingSessions.length > 0 && (
                  <div style={styles.sessionList}>
                    {existingSessions.map((sess) => (
                      <div
                        key={sess._id}
                        style={{
                          ...styles.sessionItem,
                          ...(hoveredSession === sess._id
                            ? styles.sessionItemHover
                            : {}),
                        }}
                        onClick={() => handleResumeSession(sess._id)}
                        onMouseEnter={() =>
                          setHoveredSession(sess._id)
                        }
                        onMouseLeave={() =>
                          setHoveredSession(null)
                        }
                      >
                        <div>
                          <p style={styles.sessionName}>
                            {sess.interview?.title ||
                              'Interview Session'}
                          </p>
                          <span
                            style={styles.sessionStatus(
                              sess.status
                            )}
                          >
                            {sess.status === 'in_progress'
                              ? '● In Progress'
                              : sess.status === 'pending'
                                ? '○ Pending'
                                : sess.status}
                          </span>
                          <span
                            style={{
                              fontSize: '12px',
                              color: 'rgba(148,163,184,0.6)',
                              marginLeft: '12px',
                            }}
                          >
                            {new Date(
                              sess.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <span style={styles.resumeArrow}>→</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <p style={{ margin: 0 }}>
              Powered by AI Interview Platform • Secure & Private
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// Wrap with AuthGuard requiring candidate role
export default function CandidatePage() {
  return (
    <AuthGuard requiredRole="candidate">
      <CandidatePageContent />
    </AuthGuard>
  );
}
