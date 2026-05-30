'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';

/* ───────────────────── keyframe animations ───────────────────── */
const keyframes = `
@keyframes avatar-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(218,164,100,0.3), 0 0 80px rgba(222,195,132,0.15); }
  50% { transform: scale(1.07); box-shadow: 0 0 60px rgba(218,164,100,0.5), 0 0 120px rgba(222,195,132,0.25); }
}
@keyframes avatar-speaking {
  0%   { transform: scale(1); }
  25%  { transform: scale(1.12); }
  50%  { transform: scale(0.97); }
  75%  { transform: scale(1.08); }
  100% { transform: scale(1); }
}
@keyframes fade-in { 0% { opacity:0; transform:translateY(16px); } 100% { opacity:1; transform:translateY(0); } }
@keyframes slide-up { 0% { opacity:0; transform:translateY(40px) scale(0.96); } 100% { opacity:1; transform:translateY(0) scale(1); } }
@keyframes recording-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
  50%      { box-shadow: 0 0 0 12px rgba(239,68,68,0); }
}
@keyframes timer-glow {
  0%, 100% { filter: drop-shadow(0 0 6px rgba(218,164,100,0.4)); }
  50%      { filter: drop-shadow(0 0 14px rgba(222,195,132,0.6)); }
}
@keyframes warning-flash {
  0%, 100% { opacity:1; }
  50%      { opacity:0.5; }
}
@keyframes progress-fill { 0% { width:0%; } 100% { width:100%; } }
@keyframes confetti-drop {
  0%   { transform: translateY(-20px) rotate(0deg); opacity:1; }
  100% { transform: translateY(120vh) rotate(720deg); opacity:0; }
}
@keyframes completion-glow {
  0%, 100% { box-shadow: 0 0 60px rgba(34,197,94,0.2); }
  50%      { box-shadow: 0 0 100px rgba(34,197,94,0.4); }
}
@keyframes countdown-num {
  0%   { transform: scale(0.5); opacity:0; }
  50%  { transform: scale(1.3); }
  100% { transform: scale(1); opacity:1; }
}
`;

/* ───────────────── helper: circular-timer SVG ────────────────── */
function CircularTimer({ seconds, total }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, seconds / total);
  const offset = circumference * (1 - pct);
  const isLow = seconds <= 15;
  const strokeColor = isLow ? '#ef4444' : seconds <= 30 ? '#DAA464' : '#f8fafc';
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div style={{ position: 'relative', width: 110, height: 110, animation: 'timer-glow 3s ease-in-out infinite' }}>
      <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="55" cy="55" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
        <circle
          cx="55" cy="55" r={radius} fill="none"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.4s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
      
        <span style={{ fontSize: 26, fontWeight: 700, color: strokeColor, fontVariantNumeric: 'tabular-nums', transition: 'color 0.4s' }}>
          {mm}:{ss}
        </span>
        <span style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>remaining</span>
      </div>
    </div>
  );
}

/* ─────────────── helper: proctoring-overlay banner ───────────── */
function ProctorOverlay({ warnings }) {
  if (!warnings.length) return null;
  const latest = warnings[warnings.length - 1];
  const bgMap = {
    tab_switch: 'rgba(245,158,11,0.2)',
    window_blur: 'rgba(245,158,11,0.2)',
    face_not_detected: 'rgba(239,68,68,0.2)',
    multiple_faces: 'rgba(239,68,68,0.2)',
  };
  const colorMap = {
    tab_switch: '#f59e0b',
    window_blur: '#f59e0b',
    face_not_detected: '#ef4444',
    multiple_faces: '#ef4444',
  };
  return (
    <div style={{
      position: 'fixed', top: 70, left: '50%', transform: 'translateX(-50%)',
      padding: '12px 28px', borderRadius: 14,
      background: bgMap[latest.type] || 'rgba(239,68,68,0.18)',
      border: `1px solid ${colorMap[latest.type] || 'rgba(239,68,68,0.4)'}`,
      color: colorMap[latest.type] || '#ef4444',
      fontWeight: 600, fontSize: 14, zIndex: 1000,
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      animation: 'warning-flash 1s ease-in-out 3',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      ⚠ {latest.message}
    </div>
  );
}

/* ═══════════════════════ MAIN COMPONENT ══════════════════════ */
function InterviewRoomContent() {
  const { sessionId } = useParams();
  const router = useRouter();

  /* ── state ── */
  const [session, setSession] = useState(null);
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [phase, setPhase] = useState('loading'); // loading | getReady | question | transition | completed | error
  const [countdown, setCountdown] = useState(5);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [proctoringWarnings, setProctoringWarnings] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  /* ── refs ── */
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const startRecordingRef = useRef(null);
  const chunkIndexRef = useRef(0);
  const timerRef = useRef(null);
  const socketRef = useRef(null);
  const isMountedRef = useRef(true);
  const isAdvancingRef = useRef(false);
  const proctoringEnabled = interview?.settings?.proctoringEnabled !== false;

  /* ══════════ 1. Fetch session data ══════════ */
  useEffect(() => {
    isMountedRef.current = true;
    let cancelled = false;

    async function fetchSession() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Failed to load session');
        }
        const data = await res.json();
        if (cancelled) return;

        setSession(data.session || data);
        const iv = data.session?.interview || data.interview;
        setInterview(iv);

        // session recovery
        const startIdx = data.session?.session_data?.currentQuestionIndex || 0;
        setCurrentQIdx(startIdx);

        setLoading(false);
        setPhase('getReady');
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
          setPhase('error');
        }
      }
    }
    fetchSession();

    return () => { cancelled = true; isMountedRef.current = false; };
  }, [sessionId]);

  /* ══════════ 2. Camera initialisation ══════════ */
  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraReady(true);
      } catch (err) {
        console.error('Camera access denied:', err);
        setCameraReady(false);
      }
    }
    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  /* ══════════ 3. Socket connection ══════════ */
  useEffect(() => {
    let sock = null;
    try {
      const { getSocket } = require('@/lib/socket');
      sock = getSocket();
      socketRef.current = sock;

      sock.on('connect', () => setSocketConnected(true));
      sock.on('disconnect', () => setSocketConnected(false));

      if (sock.connected) setSocketConnected(true);

      sock.emit('join-session', { sessionId, role: 'candidate' });
    } catch (e) {
      console.warn('Socket init skipped:', e.message);
    }

    return () => {
      if (sock) {
        sock.off('connect');
        sock.off('disconnect');
      }
    };
  }, [sessionId]);

  const reportProctoringEvent = useCallback((type, message) => {
    if (!proctoringEnabled) return;

    const event = {
      type,
      message,
      severity: type === 'face_not_detected' || type === 'multiple_faces' ? 'high' : 'medium',
      timestamp: new Date().toISOString(),
      metadata: { questionIndex: currentQIdx },
    };

    if (socketRef.current) {
      socketRef.current.emit('proctoring-event', {
        sessionId,
        questionIndex: currentQIdx,
        ...event,
      });
    }

    fetch(`/api/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proctoring: { event } }),
    }).catch((err) => {
      console.error('Failed to persist proctoring event:', err);
    });
  }, [currentQIdx, proctoringEnabled, sessionId]);

  /* ══════════ 4. Proctoring (tab switch / visibility) ══════════ */
  useEffect(() => {
    function handleVisibility() {
      if (document.hidden && phase === 'question' && proctoringEnabled) {
        const warn = { type: 'tab_switch', message: 'Tab switch detected – please stay on this page', ts: Date.now() };
        setProctoringWarnings((p) => [...p, warn]);
        reportProctoringEvent(warn.type, warn.message);
        // auto-clear after 4s
        setTimeout(() => setProctoringWarnings((p) => p.filter((w) => w.ts !== warn.ts)), 4000);
      }
    }

    function handleBlur() {
      if (phase === 'question' && proctoringEnabled) {
        const warn = { type: 'window_blur', message: 'Window lost focus – activity is being monitored', ts: Date.now() };
        setProctoringWarnings((p) => [...p, warn]);
        reportProctoringEvent(warn.type, warn.message);
        setTimeout(() => setProctoringWarnings((p) => p.filter((w) => w.ts !== warn.ts)), 4000);
      }
    }

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
    };
  }, [phase, proctoringEnabled, reportProctoringEvent]);

  /* ══════════ 5. "Get Ready" countdown ══════════ */
  useEffect(() => {
    if (phase !== 'getReady') return;
    if (countdown <= 0) {
      setPhase('question');
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  /* ══════════ 6. Speak question via TTS ══════════ */
  const speakQuestion = useCallback((text) => {
    try {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.95;
      utter.pitch = 1;
      utter.volume = 1;

      // try to pick a good English voice
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find((v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
        || voices.find((v) => v.lang.startsWith('en'))
        || voices[0];
      if (preferred) utter.voice = preferred;

      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => { setIsSpeaking(false); startRecordingRef.current?.(); };
      utter.onerror = () => { setIsSpeaking(false); startRecordingRef.current?.(); };
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn('TTS error:', e);
      setIsSpeaking(false);
      startRecordingRef.current?.();
    }
  }, []);

  /* ══════════ 7. Recording helpers ══════════ */
  const startRecording = useCallback(() => {
    if (!streamRef.current || isRecording) return;
    try {
      chunkIndexRef.current = 0;

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
          ? 'video/webm;codecs=vp8,opus'
          : 'video/webm';

      const mr = new MediaRecorder(streamRef.current, { mimeType, videoBitsPerSecond: 1_500_000 });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = async (e) => {
        if (e.data && e.data.size > 0) {
          const idx = chunkIndexRef.current++;
          const fd = new FormData();
          fd.append('chunk', e.data, `chunk_${idx}.webm`);
          fd.append('questionIndex', String(currentQIdx));
          fd.append('chunkIndex', String(idx));
          try {
            await fetch(`/api/sessions/${sessionId}/chunks`, { method: 'POST', body: fd });
          } catch (err) {
            console.error('Chunk upload failed:', err);
          }
        }
      };

      mr.start(5000); // chunk every 5s
      setIsRecording(true);
    } catch (e) {
      console.error('MediaRecorder error:', e);
    }
  }, [currentQIdx, isRecording, sessionId]);
  startRecordingRef.current = startRecording;

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== 'inactive') {
        mr.onstop = () => { setIsRecording(false); resolve(); };
        mr.stop();
      } else {
        setIsRecording(false);
        resolve();
      }
    });
  }, []);

  /* ══════════ 8. Question timer ══════════ */
  useEffect(() => {
    if (phase !== 'question' || isSpeaking) return;
    if (!interview) return;

    const q = interview.questions?.[currentQIdx];
    const limit = q?.timeLimit || q?.duration || 120;

    // Initialise time-left to full limit when question changes (unless already counting)
    setTimeLeft(limit);

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          handleAdvance();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = id;
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentQIdx, isSpeaking, interview]);

  /* ══════════ 9. Start TTS when phase=question changes ══════════ */
  useEffect(() => {
    if (phase !== 'question' || !interview) return;
    const q = interview.questions?.[currentQIdx];
    if (q) speakQuestion(q.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentQIdx, interview]);

  /* ══════════ 10. Advance to next question / complete ══════════ */
  const handleAdvance = useCallback(async () => {
    if (isAdvancingRef.current) return;
    isAdvancingRef.current = true;

    if (timerRef.current) clearInterval(timerRef.current);
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (_) { /* */ }
    setIsSpeaking(false);

    await stopRecording();

    // trigger transcription in background
    try {
      fetch(`/api/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, questionIndex: currentQIdx }),
      }).catch(() => {});
    } catch (_) { /* fire-and-forget */ }

    // update session progress
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'session_data.currentQuestionIndex': currentQIdx + 1 }),
      });
    } catch (_) { /* */ }

    const totalQs = interview?.questions?.length || 0;
    if (currentQIdx + 1 >= totalQs) {
      // all done
      setPhase('transition');
      setTimeout(async () => {
        try {
          await fetch(`/api/sessions/${sessionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'completed', 'session_data.completedAt': new Date().toISOString() }),
          });
        } catch (_) { /* */ }
        setPhase('completed');
        isAdvancingRef.current = false;
      }, 1200);
    } else {
      setPhase('transition');
      setTimeout(() => {
        setCurrentQIdx((i) => i + 1);
        setPhase('question');
        isAdvancingRef.current = false;
      }, 1200);
    }
  }, [currentQIdx, interview, sessionId, stopRecording]);

  const handleEndInterview = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (_) { /* */ }
    setIsSpeaking(false);
    await stopRecording();

    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', 'session_data.completedAt': new Date().toISOString() }),
      });
    } catch (_) { /* */ }
    setPhase('completed');
  }, [sessionId, stopRecording]);

  /* ═══════════════════ computed values ═══════════════════ */
  const questions = interview?.questions || [];
  const currentQ = questions[currentQIdx] || null;
  const totalQ = questions.length;
  const progressPct = totalQ > 0 ? ((currentQIdx + 1) / totalQ) * 100 : 0;

  /* ═══════════════════ render phases ═══════════════════ */

  /* ── loading ── */
  if (phase === 'loading' || loading) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: keyframes }} />
        <div style={{ minHeight: '100vh', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#DAA464', borderRadius: '50%', animation: 'avatar-pulse 1.2s ease infinite' }} />
          <span style={{ color: '#f8fafc', fontSize: 15 }}>Loading interview session…</span>
        </div>
      </>
    );
  }

  /* ── error ── */
  if (phase === 'error') {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: keyframes }} />
        <div style={{ minHeight: '100vh', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>✕</div>
          <h2 style={{ color: '#ef4444', fontSize: 22, fontWeight: 700, margin: 0 }}>Session Error</h2>
          <p style={{ color: '#94a3b8', maxWidth: 400, textAlign: 'center', fontSize: 14 }}>{error || 'Unable to load the interview session.'}</p>
          <button
            onClick={() => router.push('/')}
            style={{
              marginTop: 12, padding: '12px 28px', borderRadius: 12,
              background: '#DAA464', color: '#0a0a1e',
              border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Return Home
          </button>
        </div>
      </>
    );
  }

  /* ── get-ready countdown ── */
  if (phase === 'getReady') {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: keyframes }} />
        <div style={{ minHeight: '100vh', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30 }}>
          {/* hidden video so camera stays active */}
          <video ref={videoRef} autoPlay playsInline muted style={{ width: 1, height: 1, opacity: 0, position: 'absolute' }} />

          <div style={{
            width: 140, height: 140, borderRadius: '50%',
            background: '#DAA464',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'avatar-pulse 2s ease-in-out infinite',
          }}>
            <span style={{ fontSize: 60, fontWeight: 800, color: '#0a0a1e', animation: 'countdown-num 0.5s ease-out', key: countdown }}>{countdown || '🎬'}</span>
          </div>
          <h1 style={{ color: '#f8fafc', fontSize: 32, fontWeight: 800, margin: 0, animation: 'fade-in 0.6s ease-out' }}>Get Ready</h1>
          <p style={{ color: '#94a3b8', fontSize: 16, margin: 0, maxWidth: 380, textAlign: 'center' }}>
            Your interview is about to begin. Make sure your camera and microphone are working.
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: cameraReady ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${cameraReady ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: cameraReady ? '#22c55e' : '#ef4444' }} />
              <span style={{ color: cameraReady ? '#22c55e' : '#ef4444', fontSize: 13, fontWeight: 600 }}>{cameraReady ? 'Camera Ready' : 'Camera Off'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: socketConnected ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)', border: `1px solid ${socketConnected ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: socketConnected ? '#22c55e' : '#f59e0b' }} />
              <span style={{ color: socketConnected ? '#22c55e' : '#f59e0b', fontSize: 13, fontWeight: 600 }}>{socketConnected ? 'Connected' : 'Connecting…'}</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ── completion screen ── */
  if (phase === 'completed') {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: keyframes }} />
        <div style={{ minHeight: '100vh', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 40 }}>
          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            background: 'linear-gradient(135deg,#22c55e,#16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'completion-glow 3s ease-in-out infinite', boxShadow: '0 0 60px rgba(34,197,94,0.25)',
          }}>
            <span style={{ fontSize: 54, color: '#fff' }}>✓</span>
          </div>
          <h1 style={{ color: '#f8fafc', fontSize: 34, fontWeight: 800, margin: 0, animation: 'fade-in 0.6s ease-out' }}>Interview Complete!</h1>
          <p style={{ color: '#94a3b8', fontSize: 16, maxWidth: 440, textAlign: 'center', lineHeight: 1.6 }}>
            Thank you for completing the interview. Your responses have been recorded and will be reviewed by the recruiter.
          </p>

          <div style={{
            background: 'rgba(15, 20, 45, 0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '24px 36px', display: 'flex', gap: 40, marginTop: 8,
            animation: 'slide-up 0.8s ease-out 0.3s both',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#DAA464' }}>{totalQ}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Questions</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#DAA464' }}>{totalQ}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Answered</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#22c55e' }}>✓</div>
              <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Submitted</div>
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            style={{
              marginTop: 16, padding: '14px 36px', borderRadius: 14,
              background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff',
              border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(99,102,241,0.3)',
              animation: 'slide-up 0.8s ease-out 0.6s both',
            }}
          >
            Return Home
          </button>
        </div>
      </>
    );
  }

  /* ═══════════════ main interview UI (question + transition) ═══════════════ */
  const isTransition = phase === 'transition';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      <ProctorOverlay warnings={proctoringWarnings} />

      <div style={{
        minHeight: '100vh', background: '#0a0a0f', display: 'flex', flexDirection: 'column', fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      }}>

        {/* ─── TOP BAR ─── */}
        <div style={{
          height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px',
          background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)', zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg,#6366f1,#a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 800, color: '#fff',
            }}>AI</div>
            <span style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>{interview?.title || 'Interview'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* progress pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 10,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Question</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#818cf8' }}>{currentQIdx + 1}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>of</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{totalQ}</span>
            </div>

            {/* recording badge */}
            {isRecording && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 10,
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'recording-pulse 1.5s ease infinite' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recording</span>
              </div>
            )}

            {/* socket status */}
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: socketConnected ? '#22c55e' : '#f59e0b',
              boxShadow: socketConnected ? '0 0 8px rgba(34,197,94,0.5)' : '0 0 8px rgba(245,158,11,0.5)',
            }}
              title={socketConnected ? 'Connected' : 'Reconnecting…'}
            />

            {/* proctoring badge */}
            <div style={{
              padding: '5px 12px', borderRadius: 8,
              background: proctoringEnabled ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${proctoringEnabled ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'}`,
              fontSize: 11, fontWeight: 600, color: proctoringEnabled ? '#22c55e' : 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {proctoringEnabled ? '🛡 Proctored' : 'Unproctored'}
            </div>
          </div>
        </div>

        {/* ─── MAIN CONTENT AREA ─── */}
        <div style={{ flex: 1, display: 'flex', padding: 16, gap: 16, overflow: 'hidden' }}>

          {/* ── LEFT: Video Preview (60%) ── */}
          <div style={{
            flex: '0 0 60%', position: 'relative', borderRadius: 20,
            background: '#12121a', overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          }}>
            <video
              ref={videoRef}
              autoPlay playsInline muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />

            {/* overlay gradient at bottom */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              pointerEvents: 'none',
            }} />

            {/* candidate name overlay */}
            <div style={{
              position: 'absolute', bottom: 16, left: 20,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{
                padding: '6px 14px', borderRadius: 10,
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{session?.candidateName || 'Candidate'}</span>
              </div>
            </div>

            {/* camera-off fallback */}
            {!cameraReady && (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 12,
                background: 'rgba(0,0,0,0.8)',
              }}>
                <div style={{ fontSize: 48, opacity: 0.3 }}>📷</div>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Camera unavailable</span>
              </div>
            )}

            {/* transition overlay */}
            {isTransition && (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
              }}>
                <div style={{
                  width: 56, height: 56, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1',
                  borderRadius: '50%', animation: 'avatar-pulse 0.8s linear infinite',
                }} />
              </div>
            )}
          </div>

          {/* ── RIGHT: AI Panel (40%) ── */}
          <div style={{
            flex: '0 0 calc(40% - 16px)', display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            {/* AI Avatar area */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02) 46%, rgba(9, 14, 34, 0.42))',
              backdropFilter: 'blur(26px) saturate(180%)',
              WebkitBackdropFilter: 'blur(26px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 18px 55px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
              borderRadius: 20,
              padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
              flex: '0 0 auto',
            }}>
              {/* animated avatar */}
              <div style={{
                width: 90, height: 90, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #a855f7, #c084fc, #818cf8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: isSpeaking ? 'avatar-speaking 0.6s ease-in-out infinite' : 'avatar-pulse 3s ease-in-out infinite',
                boxShadow: '0 0 40px rgba(99,102,241,0.3)',
                position: 'relative',
              }}>
                <span style={{ fontSize: 36, color: '#fff', fontWeight: 800 }}>AI</span>
                {isSpeaking && (
                  <div style={{
                    position: 'absolute', bottom: -6, right: -6,
                    width: 24, height: 24, borderRadius: '50%',
                    background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #0a0a0f', fontSize: 12,
                  }}>🔊</div>
                )}
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>AI Interviewer</div>
                <div style={{ fontSize: 12, color: isSpeaking ? '#22c55e' : 'rgba(255,255,255,0.4)', marginTop: 4, fontWeight: 500 }}>
                  {isSpeaking ? 'Speaking…' : isRecording ? 'Listening to your response…' : 'Ready'}
                </div>
              </div>
            </div>

            {/* Question text */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.01) 50%, rgba(9, 14, 34, 0.38))',
              backdropFilter: 'blur(22px) saturate(160%)',
              WebkitBackdropFilter: 'blur(22px) saturate(160%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
              borderRadius: 20,
              padding: 24, flex: 1, display: 'flex', flexDirection: 'column', gap: 16,
              animation: phase === 'question' ? 'fade-in 0.5s ease-out' : undefined,
            }}>
              {/* category badge */}
              {currentQ && (
                <div style={{
                  alignSelf: 'flex-start', padding: '4px 12px', borderRadius: 8,
                  background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)',
                  fontSize: 11, fontWeight: 600, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  {currentQ.category || 'general'}
                </div>
              )}

              <p style={{
                color: '#fff', fontSize: 18, fontWeight: 600, lineHeight: 1.6, margin: 0, flex: 1,
              }}>
                {isTransition ? 'Preparing next question…' : (currentQ?.text || 'Loading question…')}
              </p>

              {/* progress bar */}
              <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Progress</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{Math.round(progressPct)}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 4,
                    background: 'linear-gradient(90deg,#6366f1,#a855f7)',
                    width: `${progressPct}%`, transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            </div>

            {/* Timer */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01) 50%, rgba(9, 14, 34, 0.32))',
              backdropFilter: 'blur(18px) saturate(150%)',
              WebkitBackdropFilter: 'blur(18px) saturate(150%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 6px 24px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              borderRadius: 20,
              padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flex: '0 0 auto',
            }}>
              <CircularTimer seconds={timeLeft} total={currentQ?.timeLimit || currentQ?.duration || 120} />
            </div>
          </div>
        </div>

        {/* ─── BOTTOM BAR ─── */}
        <div style={{
          height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
          padding: '0 24px',
          background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
        }}>
          {/* Record/Stop toggle */}
          <button
            onClick={() => isRecording ? stopRecording() : startRecording()}
            style={{
              width: 52, height: 52, borderRadius: '50%',
              background: isRecording ? '#ef4444' : 'rgba(255,255,255,0.08)',
              border: isRecording ? '3px solid rgba(239,68,68,0.4)' : '2px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.3s ease',
              animation: isRecording ? 'recording-pulse 1.5s ease infinite' : 'none',
            }}
            title={isRecording ? 'Stop Recording' : 'Start Recording'}
          >
            {isRecording
              ? <div style={{ width: 18, height: 18, borderRadius: 3, background: '#fff' }} />
              : <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#ef4444' }} />
            }
          </button>

          {/* Next Question */}
          <button
            onClick={handleAdvance}
            disabled={isTransition || isSpeaking}
            style={{
              padding: '12px 32px', borderRadius: 14,
              background: (isTransition || isSpeaking)
                ? 'rgba(255,255,255,0.05)'
                : 'linear-gradient(135deg,#6366f1,#a855f7)',
              color: '#fff', border: 'none',
              fontSize: 15, fontWeight: 700, cursor: (isTransition || isSpeaking) ? 'not-allowed' : 'pointer',
              opacity: (isTransition || isSpeaking) ? 0.5 : 1,
              boxShadow: (isTransition || isSpeaking) ? 'none' : '0 6px 24px rgba(99,102,241,0.3)',
              transition: 'all 0.3s ease',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            {currentQIdx + 1 >= totalQ ? 'Finish Interview' : 'Next Question'}
            <span style={{ fontSize: 18 }}>→</span>
          </button>

          {/* End Interview */}
          <button
            onClick={handleEndInterview}
            style={{
              padding: '12px 24px', borderRadius: 14,
              background: 'rgba(239,68,68,0.12)',
              color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            End Interview
          </button>
        </div>
      </div>
    </>
  );
}

// Wrap with AuthGuard requiring candidate role
export default function InterviewRoom() {
  return (
    <AuthGuard requiredRole="candidate">
      <InterviewRoomContent />
    </AuthGuard>
  );
}
