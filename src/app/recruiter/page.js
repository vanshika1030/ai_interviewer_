'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard, { getStoredAuth, logout } from '@/components/AuthGuard';

function RecruiterDashboardContent() {
  const router = useRouter();
  const { user } = getStoredAuth();
  const [interviews, setInterviews] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [animatedStats, setAnimatedStats] = useState({ total: 0, active: 0, completed: 0, avgScore: 0 });

  const fetchData = useCallback(async () => {
    try {
      const [intRes, sesRes] = await Promise.all([
        fetch('/api/interviews'),
        fetch('/api/sessions'),
      ]);
      const intData = await intRes.json();
      const sesData = await sesRes.json();
      setInterviews(intData.interviews || []);
      setSessions(sesData.sessions || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Animate stats on load
  useEffect(() => {
    if (loading) return;
    const totalInterviews = interviews.length;
    const activeSessions = sessions.filter((s) => s.status === 'in_progress').length;
    const completedSessions = sessions.filter((s) => ['completed', 'evaluated'].includes(s.status)).length;
    const evaluated = sessions.filter((s) => s.evaluation?.overallScore);
    const avgScore = evaluated.length > 0
      ? Math.round(evaluated.reduce((sum, s) => sum + (s.evaluation?.overallScore || 0), 0) / evaluated.length)
      : 0;

    const targets = { total: totalInterviews, active: activeSessions, completed: completedSessions, avgScore };
    const duration = 1000;
    const steps = 30;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setAnimatedStats({
        total: Math.round(targets.total * progress),
        active: Math.round(targets.active * progress),
        completed: Math.round(targets.completed * progress),
        avgScore: Math.round(targets.avgScore * progress),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [loading, interviews, sessions]);

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch = interview.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getSessionsForInterview = (interviewId) => {
    return sessions.filter((s) => s.interviewId === interviewId || s.interviewId?._id === interviewId);
  };

  const handleEvaluate = async (sessionId) => {
    try {
      const res = await fetch(`/api/interviews/${sessionId}/evaluate`, { method: 'POST' });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Evaluation failed:', err);
    }
  };

  const handleDeleteInterview = async (interview) => {
    const confirmed = window.confirm(
      `Delete "${interview.title}" and all candidate sessions for this interview? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(interview._id);
      setActionError('');

      const res = await fetch(`/api/interviews/${interview._id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete interview');
      }

      await fetchData();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'transparent',
      padding: '100px 40px 40px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '40px',
      flexWrap: 'wrap',
      gap: '16px',
    },
    title: {
      fontSize: '2.2rem',
      fontWeight: '700',
      color: '#f8fafc',
    },
    createBtn: {
      padding: '12px 28px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '700',
      fontSize: '1rem',
      background: '#DAA464',
      color: '#0a0a1e',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 20px rgba(218,164,100,0.4)',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '20px',
      marginBottom: '40px',
    },
    statCard: (color) => ({
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02) 46%, rgba(9, 14, 34, 0.42))',
      backdropFilter: 'blur(26px) saturate(180%)',
      WebkitBackdropFilter: 'blur(26px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: '0 18px 55px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
      borderRadius: '20px',
      padding: '28px',
      borderLeft: `4px solid ${color}`,
      transition: 'all 0.3s ease',
    }),
    statValue: (color) => ({
      fontSize: '2.5rem',
      fontWeight: '700',
      color: color,
      lineHeight: '1',
    }),
    statLabel: {
      color: '#94a3b8',
      fontSize: '0.9rem',
      marginTop: '8px',
    },
    filterBar: {
      display: 'flex',
      gap: '16px',
      marginBottom: '24px',
      flexWrap: 'wrap',
    },
    searchInput: {
      flex: '1',
      minWidth: '250px',
      padding: '12px 16px',
      borderRadius: '10px',
      border: '1px solid rgba(255,255,255,0.15)',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      color: '#f8fafc',
      fontSize: '0.95rem',
      outline: 'none',
    },
    filterSelect: {
      padding: '12px 16px',
      borderRadius: '10px',
      border: '1px solid rgba(255,255,255,0.15)',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      color: '#f8fafc',
      fontSize: '0.95rem',
      outline: 'none',
      cursor: 'pointer',
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: '0 8px',
    },
    th: {
      textAlign: 'left',
      padding: '12px 20px',
      color: '#94a3b8',
      fontSize: '0.8rem',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      fontWeight: '600',
    },
    tr: {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    td: {
      padding: '16px 20px',
      color: '#f8fafc',
      fontSize: '0.95rem',
      background: 'rgba(255, 255, 255, 0.03)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
    },
    tdFirst: {
      borderLeft: '1px solid rgba(255,255,255,0.08)',
      borderTopLeftRadius: '12px',
      borderBottomLeftRadius: '12px',
    },
    tdLast: {
      borderRight: '1px solid rgba(255,255,255,0.08)',
      borderTopRightRadius: '12px',
      borderBottomRightRadius: '12px',
    },
    badge: (color) => ({
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      background: `${color}20`,
      color: color,
      border: `1px solid ${color}40`,
    }),
    actionBtn: (variant) => ({
      padding: '6px 14px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.8rem',
      marginRight: '8px',
      transition: 'all 0.2s ease',
      background: variant === 'danger'
        ? 'rgba(239,68,68,0.14)'
        : variant === 'primary'
          ? 'rgba(218,164,100,0.2)'
          : 'rgba(15,20,45,0.4)',
      color: variant === 'danger' ? '#f87171' : variant === 'primary' ? '#DAA464' : '#94a3b8',
      border: variant === 'danger'
        ? '1px solid rgba(239,68,68,0.3)'
        : variant === 'primary'
          ? '1px solid rgba(218,164,100,0.3)'
          : '1px solid rgba(255,255,255,0.08)',
    }),
    errorBox: {
      background: 'rgba(239,68,68,0.12)',
      border: '1px solid rgba(239,68,68,0.32)',
      borderRadius: '10px',
      padding: '12px 16px',
      color: '#fca5a5',
      fontSize: '0.9rem',
      marginBottom: '18px',
    },
    emptyState: {
      textAlign: 'center',
      padding: '80px 20px',
      color: '#94a3b8',
    },
    emptyIcon: {
      fontSize: '4rem',
      marginBottom: '16px',
    },
    emptyText: {
      fontSize: '1.2rem',
      marginBottom: '8px',
      color: '#f8fafc',
    },
    skeleton: {
      background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: '8px',
      height: '20px',
    },
  };

  const statusColors = {
    active: '#22c55e',
    draft: '#f59e0b',
    archived: '#6b7280',
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Recruiter Dashboard</h1>
        </div>
        <div style={styles.statsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ ...styles.statCard('#333'), padding: '30px' }}>
              <div style={{ ...styles.skeleton, width: '60%', height: '40px', marginBottom: '12px' }} />
              <div style={{ ...styles.skeleton, width: '80%' }} />
            </div>
          ))}
        </div>
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      </div>
    );
  }

  return (
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
            👤 {user?.name || user?.email || 'Recruiter'}
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

      <div style={styles.header}>
        <h1 style={styles.title}>Recruiter Dashboard</h1>
        <button style={styles.createBtn} onClick={() => router.push('/recruiter/create')}>
          + Create Interview
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard('#DAA464')}>
          <div style={styles.statValue('#DAA464')}>{animatedStats.total}</div>
          <div style={styles.statLabel}>Total Interviews</div>
        </div>
        <div style={styles.statCard('#DEC384')}>
          <div style={styles.statValue('#DEC384')}>{animatedStats.active}</div>
          <div style={styles.statLabel}>Active Sessions</div>
        </div>
        <div style={styles.statCard('#22c55e')}>
          <div style={styles.statValue('#22c55e')}>{animatedStats.completed}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        <div style={styles.statCard('#767F9E')}>
          <div style={styles.statValue('#767F9E')}>{animatedStats.avgScore || '—'}</div>
          <div style={styles.statLabel}>Average Score</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={styles.filterBar}>
        <input
          style={styles.searchInput}
          placeholder="🔍 Search interviews..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select style={styles.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {actionError && <div style={styles.errorBox}>{actionError}</div>}

      {/* Table */}
      {filteredInterviews.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📋</div>
          <div style={styles.emptyText}>No interviews found</div>
          <p style={{ color: '#94a3b8' }}>Create your first interview to get started</p>
          <button
            style={{ ...styles.createBtn, marginTop: '20px' }}
            onClick={() => router.push('/recruiter/create')}
          >
            + Create Interview
          </button>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Questions</th>
              <th style={styles.th}>Candidates</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Created</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInterviews.map((interview) => {
              const interviewSessions = getSessionsForInterview(interview._id);
              return (
                <tr
                  key={interview._id}
                  style={styles.tr}
                  onClick={() => router.push(`/recruiter/interviews/${interview._id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.querySelectorAll('td').forEach((td) => {
                      td.style.background = 'rgba(15,20,45,0.6)';
                    });
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.querySelectorAll('td').forEach((td) => {
                      td.style.background = 'rgba(15,20,45,0.4)';
                    });
                  }}
                >
                  <td style={{ ...styles.td, ...styles.tdFirst, fontWeight: '600', color: '#f8fafc' }}>
                    {interview.title}
                  </td>
                  <td style={styles.td}>{interview.questions?.length || 0}</td>
                  <td style={styles.td}>{interview.candidateCount || interviewSessions.length}</td>
                  <td style={styles.td}>
                    <span style={styles.badge(statusColors[interview.status] || '#6b7280')}>
                      {interview.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {new Date(interview.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td style={{ ...styles.td, ...styles.tdLast }} onClick={(e) => e.stopPropagation()}>
                    <button
                      style={styles.actionBtn('primary')}
                      onClick={() => router.push(`/recruiter/interviews/${interview._id}`)}
                    >
                      View
                    </button>
                    <button
                      style={{
                        ...styles.actionBtn('danger'),
                        opacity: deletingId === interview._id ? 0.65 : 1,
                        cursor: deletingId === interview._id ? 'not-allowed' : 'pointer',
                      }}
                      onClick={() => handleDeleteInterview(interview)}
                      disabled={deletingId === interview._id}
                    >
                      {deletingId === interview._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}

// Wrap with AuthGuard requiring recruiter role
export default function RecruiterDashboard() {
  return (
    <AuthGuard requiredRole="recruiter">
      <RecruiterDashboardContent />
    </AuthGuard>
  );
}
