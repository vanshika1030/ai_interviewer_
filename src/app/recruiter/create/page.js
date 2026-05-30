'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';

const TEMPLATE_QUESTIONS = [
  { text: 'Tell me about yourself and your background.', category: 'general', timeLimit: 120 },
  { text: 'Describe a challenging project you worked on and how you handled it.', category: 'behavioral', timeLimit: 180 },
  { text: 'How do you approach problem-solving when facing an unfamiliar technical challenge?', category: 'technical', timeLimit: 150 },
  { text: 'Where do you see yourself in 5 years?', category: 'general', timeLimit: 120 },
  { text: 'Do you have any questions for us?', category: 'general', timeLimit: 90 },
];

const CATEGORIES = ['general', 'behavioral', 'technical', 'situational'];

const CATEGORY_COLORS = {
  general: '#6b7280',
  behavioral: '#a855f7',
  technical: '#6366f1',
  situational: '#f59e0b',
};

function CreateInterviewContent() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Step 2: Questions
  const [questions, setQuestions] = useState([]);

  // Step 3: Settings
  const [settings, setSettings] = useState({
    maxDuration: 1800,
    proctoringEnabled: true,
    allowResume: true,
  });

  const addQuestion = () => {
    setQuestions([...questions, { text: '', category: 'general', timeLimit: 120 }]);
  };

  const removeQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx, field, value) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: value };
    setQuestions(updated);
  };

  const moveQuestion = (idx, direction) => {
    if ((direction === -1 && idx === 0) || (direction === 1 && idx === questions.length - 1)) return;
    const updated = [...questions];
    const temp = updated[idx];
    updated[idx] = updated[idx + direction];
    updated[idx + direction] = temp;
    setQuestions(updated);
  };

  const loadTemplate = () => {
    setQuestions([...TEMPLATE_QUESTIONS]);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return title.trim().length > 0;
      case 2: return questions.length > 0 && questions.every((q) => q.text.trim().length > 0);
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const orderedQuestions = questions.map((q, i) => ({ ...q, order: i }));
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, questions: orderedQuestions, settings }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create interview');
      }

      setSuccess(true);
      setTimeout(() => router.push('/recruiter'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'transparent',
      padding: '100px 40px 40px',
      maxWidth: '900px',
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
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#f8fafc',
      marginBottom: '32px',
    },
    stepper: {
      display: 'flex',
      justifyContent: 'center',
      gap: '8px',
      marginBottom: '40px',
    },
    stepItem: (isActive, isCompleted) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }),
    stepCircle: (isActive, isCompleted) => ({
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      fontSize: '0.85rem',
      transition: 'all 0.3s ease',
      background: isCompleted ? '#22c55e' : isActive ? '#DAA464' : 'rgba(255,255,255,0.06)',
      color: isActive || isCompleted ? '#0a0a1e' : '#94a3b8',
      border: isActive ? '2px solid #DEC384' : '2px solid transparent',
    }),
    stepLabel: (isActive) => ({
      color: isActive ? '#f8fafc' : '#94a3b8',
      fontSize: '0.85rem',
      fontWeight: isActive ? '600' : '400',
    }),
    stepLine: {
      width: '40px',
      height: '2px',
      background: 'rgba(255,255,255,0.06)',
      margin: '0 4px',
      alignSelf: 'center',
    },
    card: {
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02) 46%, rgba(9, 14, 34, 0.42))',
      backdropFilter: 'blur(26px) saturate(180%)',
      WebkitBackdropFilter: 'blur(26px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: '0 18px 55px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
      borderRadius: '20px',
      padding: '32px',
      marginBottom: '24px',
    },
    label: {
      color: '#f8fafc',
      fontSize: '0.9rem',
      fontWeight: '600',
      marginBottom: '8px',
      display: 'block',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '10px',
      border: '1px solid rgba(255,255,255,0.15)',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      color: '#f8fafc',
      fontSize: '1rem',
      outline: 'none',
      marginBottom: '20px',
      transition: 'border-color 0.2s ease',
      boxSizing: 'border-box',
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '10px',
      border: '1px solid rgba(255,255,255,0.15)',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      color: '#f8fafc',
      fontSize: '1rem',
      outline: 'none',
      marginBottom: '20px',
      minHeight: '100px',
      resize: 'vertical',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
    },
    select: {
      padding: '10px 14px',
      borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.15)',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      color: '#f8fafc',
      fontSize: '0.9rem',
      outline: 'none',
      cursor: 'pointer',
    },
    questionCard: {
      background: 'rgba(255, 255, 255, 0.02)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
    },
    questionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
    },
    questionNum: {
      color: '#94a3b8',
      fontSize: '0.85rem',
      fontWeight: '600',
    },
    questionActions: {
      display: 'flex',
      gap: '6px',
    },
    iconBtn: {
      width: '30px',
      height: '30px',
      borderRadius: '6px',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(15,20,45,0.4)',
      color: '#94a3b8',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.85rem',
      transition: 'all 0.2s ease',
    },
    questionFields: {
      display: 'grid',
      gridTemplateColumns: '1fr auto auto',
      gap: '12px',
      alignItems: 'end',
    },
    rangeContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    range: {
      flex: 1,
      accentColor: '#6366f1',
    },
    rangeValue: {
      color: '#94a3b8',
      fontSize: '0.85rem',
      minWidth: '40px',
      textAlign: 'right',
    },
    templateBtn: {
      padding: '10px 20px',
      borderRadius: '10px',
      border: '1px dashed rgba(218,164,100,0.6)',
      background: 'rgba(218,164,100,0.1)',
      color: '#DAA464',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.9rem',
      marginBottom: '16px',
      transition: 'all 0.2s ease',
    },
    addBtn: {
      width: '100%',
      padding: '14px',
      borderRadius: '10px',
      border: '1px dashed rgba(255,255,255,0.15)',
      background: 'transparent',
      color: '#94a3b8',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.95rem',
      transition: 'all 0.2s ease',
    },
    toggleRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 0',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    toggleLabel: {
      color: '#f8fafc',
      fontWeight: '500',
    },
    toggleDesc: {
      color: '#94a3b8',
      fontSize: '0.85rem',
      marginTop: '4px',
    },
    toggle: (enabled) => ({
      width: '48px',
      height: '26px',
      borderRadius: '13px',
      background: enabled ? '#DAA464' : 'rgba(255,255,255,0.1)',
      cursor: 'pointer',
      position: 'relative',
      transition: 'background 0.3s ease',
      border: 'none',
      flexShrink: 0,
    }),
    toggleDot: (enabled) => ({
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      background: 'white',
      position: 'absolute',
      top: '3px',
      left: enabled ? '25px' : '3px',
      transition: 'left 0.3s ease',
    }),
    navBtns: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '16px',
      marginTop: '24px',
    },
    btn: (variant) => ({
      padding: '12px 28px',
      borderRadius: '10px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '700',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      background: variant === 'primary' ? '#DAA464' :
                  variant === 'success' ? '#22c55e' :
                  'rgba(255,255,255,0.06)',
      color: variant === 'primary' || variant === 'success' ? '#0a0a1e' : '#94a3b8',
      boxShadow: variant === 'primary' ? '0 4px 20px rgba(218,164,100,0.4)' : 'none',
    }),
    reviewSection: {
      marginBottom: '20px',
    },
    reviewLabel: {
      color: '#94a3b8',
      fontSize: '0.8rem',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '6px',
    },
    reviewValue: {
      color: '#f8fafc',
      fontSize: '1rem',
    },
    reviewQuestion: {
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start',
      padding: '12px 0',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    reviewBadge: (color) => ({
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '999px',
      fontSize: '0.7rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      background: `${color}20`,
      color: color,
      border: `1px solid ${color}40`,
      flexShrink: 0,
    }),
    errorBox: {
      background: 'rgba(239,68,68,0.1)',
      border: '1px solid rgba(239,68,68,0.3)',
      borderRadius: '8px',
      padding: '12px 16px',
      color: '#ef4444',
      fontSize: '0.9rem',
      marginBottom: '16px',
    },
    successOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(10,10,30,0.6)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    successCard: {
      background: 'rgba(15,20,45,0.85)',
      backdropFilter: 'blur(30px)',
      borderRadius: '20px',
      padding: '50px',
      textAlign: 'center',
      border: '1px solid rgba(34,197,94,0.3)',
    },
    successIcon: {
      fontSize: '4rem',
      marginBottom: '16px',
    },
    successText: {
      color: '#f8fafc',
      fontSize: '1.5rem',
      fontWeight: '700',
    },
    successSub: {
      color: '#94a3b8',
      marginTop: '8px',
    },
  };

  const stepLabels = ['Basic Info', 'Questions', 'Settings', 'Review'];

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => router.push('/recruiter')}>
        ← Back to Dashboard
      </button>

      <h1 style={styles.title}>Create New Interview</h1>

      {/* Stepper */}
      <div style={styles.stepper}>
        {stepLabels.map((label, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={styles.stepItem(step === idx + 1, step > idx + 1)}>
              <div style={styles.stepCircle(step === idx + 1, step > idx + 1)}>
                {step > idx + 1 ? '✓' : idx + 1}
              </div>
              <span style={styles.stepLabel(step === idx + 1)}>{label}</span>
            </div>
            {idx < 3 && <div style={styles.stepLine} />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div style={styles.card}>
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div>
            <label style={styles.label}>Interview Title *</label>
            <input
              style={styles.input}
              placeholder="e.g., Senior React Developer - Round 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = '#DAA464')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
            <label style={styles.label}>Description</label>
            <textarea
              style={styles.textarea}
              placeholder="Describe the interview purpose and what you're evaluating..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = '#DAA464')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>
        )}

        {/* Step 2: Questions */}
        {step === 2 && (
          <div>
            {questions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 0 30px' }}>
                <button style={styles.templateBtn} onClick={loadTemplate}>
                  📋 Load Template Questions (5 questions)
                </button>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  or add custom questions below
                </p>
              </div>
            )}

            {questions.map((q, idx) => (
              <div key={idx} style={styles.questionCard}>
                <div style={styles.questionHeader}>
                  <span style={styles.questionNum}>Question {idx + 1}</span>
                  <div style={styles.questionActions}>
                    <button style={styles.iconBtn} onClick={() => moveQuestion(idx, -1)} title="Move up">↑</button>
                    <button style={styles.iconBtn} onClick={() => moveQuestion(idx, 1)} title="Move down">↓</button>
                    <button
                      style={{ ...styles.iconBtn, borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}
                      onClick={() => removeQuestion(idx)}
                      title="Remove"
                    >✕</button>
                  </div>
                </div>
                <input
                  style={{ ...styles.input, marginBottom: '12px' }}
                  placeholder="Enter your question..."
                  value={q.text}
                  onChange={(e) => updateQuestion(idx, 'text', e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = '#DAA464')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginRight: '8px' }}>Category:</span>
                    <select
                      style={styles.select}
                      value={q.category}
                      onChange={(e) => updateQuestion(idx, 'category', e.target.value)}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.rangeContainer}>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Time:</span>
                    <input
                      type="range"
                      min="30"
                      max="300"
                      step="30"
                      value={q.timeLimit}
                      onChange={(e) => updateQuestion(idx, 'timeLimit', parseInt(e.target.value))}
                      style={styles.range}
                    />
                    <span style={styles.rangeValue}>{q.timeLimit}s</span>
                  </div>
                </div>
              </div>
            ))}

            <button style={styles.addBtn} onClick={addQuestion}>
              + Add Question
            </button>
          </div>
        )}

        {/* Step 3: Settings */}
        {step === 3 && (
          <div>
            <div style={styles.toggleRow}>
              <div>
                <div style={styles.toggleLabel}>🛡️ Enable Proctoring</div>
                <div style={styles.toggleDesc}>Monitor tab switching and face presence during interview</div>
              </div>
              <button
                style={styles.toggle(settings.proctoringEnabled)}
                onClick={() => setSettings({ ...settings, proctoringEnabled: !settings.proctoringEnabled })}
              >
                <div style={styles.toggleDot(settings.proctoringEnabled)} />
              </button>
            </div>
            <div style={styles.toggleRow}>
              <div>
                <div style={styles.toggleLabel}>🔄 Allow Resume</div>
                <div style={styles.toggleDesc}>Let candidates resume if they disconnect during the interview</div>
              </div>
              <button
                style={styles.toggle(settings.allowResume)}
                onClick={() => setSettings({ ...settings, allowResume: !settings.allowResume })}
              >
                <div style={styles.toggleDot(settings.allowResume)} />
              </button>
            </div>
            <div style={{ ...styles.toggleRow, borderBottom: 'none' }}>
              <div>
                <div style={styles.toggleLabel}>⏱️ Maximum Duration</div>
                <div style={styles.toggleDesc}>Total time limit for the entire interview</div>
              </div>
              <div style={styles.rangeContainer}>
                <input
                  type="range"
                  min="600"
                  max="3600"
                  step="300"
                  value={settings.maxDuration}
                  onChange={(e) => setSettings({ ...settings, maxDuration: parseInt(e.target.value) })}
                  style={styles.range}
                />
                <span style={styles.rangeValue}>{Math.round(settings.maxDuration / 60)}m</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div>
            <div style={styles.reviewSection}>
              <div style={styles.reviewLabel}>Title</div>
              <div style={styles.reviewValue}>{title}</div>
            </div>
            {description && (
              <div style={styles.reviewSection}>
                <div style={styles.reviewLabel}>Description</div>
                <div style={{ ...styles.reviewValue, color: '#94a3b8' }}>{description}</div>
              </div>
            )}
            <div style={styles.reviewSection}>
              <div style={styles.reviewLabel}>Questions ({questions.length})</div>
              {questions.map((q, idx) => (
                <div key={idx} style={styles.reviewQuestion}>
                  <span style={{ color: '#94a3b8', fontWeight: '600', width: '24px' }}>{idx + 1}.</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#f8fafc', marginBottom: '4px' }}>{q.text}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={styles.reviewBadge(CATEGORY_COLORS[q.category])}>{q.category}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{q.timeLimit}s</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.reviewSection}>
              <div style={styles.reviewLabel}>Settings</div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  🛡️ Proctoring: {settings.proctoringEnabled ? '✅ On' : '❌ Off'}
                </span>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  🔄 Resume: {settings.allowResume ? '✅ On' : '❌ Off'}
                </span>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  ⏱️ Max: {Math.round(settings.maxDuration / 60)} minutes
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {/* Navigation */}
      <div style={styles.navBtns}>
        <button
          style={styles.btn('secondary')}
          onClick={() => step > 1 ? setStep(step - 1) : router.push('/recruiter')}
        >
          {step > 1 ? '← Back' : '← Cancel'}
        </button>
        {step < 4 ? (
          <button
            style={{
              ...styles.btn('primary'),
              opacity: canProceed() ? 1 : 0.5,
              cursor: canProceed() ? 'pointer' : 'not-allowed',
            }}
            onClick={() => canProceed() && setStep(step + 1)}
            disabled={!canProceed()}
          >
            Next →
          </button>
        ) : (
          <button
            style={{
              ...styles.btn('success'),
              opacity: submitting ? 0.7 : 1,
            }}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? '⏳ Creating...' : '✓ Create Interview'}
          </button>
        )}
      </div>

      {/* Success Overlay */}
      {success && (
        <div style={styles.successOverlay}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>🎉</div>
            <div style={styles.successText}>Interview Created!</div>
            <p style={styles.successSub}>Redirecting to dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap with AuthGuard requiring recruiter role
export default function CreateInterviewPage() {
  return (
    <AuthGuard requiredRole="recruiter">
      <CreateInterviewContent />
    </AuthGuard>
  );
}
