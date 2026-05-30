'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function HardwareCheckContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('sessionId');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  const [cameraStatus, setCameraStatus] = useState('pending');
  const [micStatus, setMicStatus] = useState('pending');
  const [speakerStatus, setSpeakerStatus] = useState('pending');
  const [cameraName, setCameraName] = useState('');
  const [micName, setMicName] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState('');

  const allPassed = cameraStatus === 'passed' && micStatus === 'passed' && speakerStatus === 'passed';

  // Microphone test
  const testMicrophone = useCallback((stream) => {
    setMicStatus('testing');
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let peakDetected = false;

      const checkLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
        const normalizedLevel = Math.min(avg / 128, 1);
        setAudioLevel(normalizedLevel);

        if (normalizedLevel > 0.05 && !peakDetected) {
          peakDetected = true;
          setMicStatus('passed');
        }

        animFrameRef.current = requestAnimationFrame(checkLevel);
      };

      checkLevel();
    } catch (err) {
      setMicStatus('failed');
      setError(`Microphone error: ${err.message}`);
    }
  }, []);

  // Camera test
  const testCamera = useCallback(async () => {
    setCameraStatus('testing');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: true,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      setCameraName(videoTrack?.label || 'Camera detected');
      setMicName(audioTrack?.label || 'Microphone detected');
      setCameraStatus('passed');

      // Start mic test automatically
      testMicrophone(stream);
    } catch (err) {
      setCameraStatus('failed');
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions and refresh.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera.');
      } else {
        setError(`Camera error: ${err.message}`);
      }
    }
  }, [testMicrophone]);

  // Speaker test
  const testSpeaker = useCallback(() => {
    setSpeakerStatus('testing');
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 440;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;

      oscillator.start();

      // Fade out
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.5);

      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 1500);
    } catch (err) {
      setError(`Speaker error: ${err.message}`);
    }
  }, []);

  const confirmSpeaker = useCallback(() => {
    setSpeakerStatus('passed');
  }, []);

  useEffect(() => {
    testCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [testCamera]);

  const handleContinue = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    router.push(`/candidate/interview/${sessionId}`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'testing': return '🔄';
      case 'passed': return '✅';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed': return '#22c55e';
      case 'failed': return '#ef4444';
      case 'testing': return '#DAA464';
      default: return '#94a3b8';
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '100px 20px 40px',
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '700',
      color: '#f8fafc',
      marginBottom: '12px',
    },
    subtitle: {
      color: '#94a3b8',
      fontSize: '1.1rem',
    },
    content: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '30px',
      maxWidth: '1000px',
      width: '100%',
    },
    videoSection: {
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02) 46%, rgba(9, 14, 34, 0.42))',
      backdropFilter: 'blur(26px) saturate(180%)',
      WebkitBackdropFilter: 'blur(26px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '20px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      boxShadow: '0 18px 55px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
    },
    video: {
      width: '100%',
      borderRadius: '12px',
      background: '#000',
      aspectRatio: '16/9',
      objectFit: 'cover',
      transform: 'scaleX(-1)',
    },
    checksSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    checkCard: (status) => ({
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.01) 50%, rgba(9, 14, 34, 0.38))',
      backdropFilter: 'blur(22px) saturate(160%)',
      WebkitBackdropFilter: 'blur(22px) saturate(160%)',
      border: `1px solid ${status === 'passed' ? 'rgba(34,197,94,0.3)' : status === 'failed' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.12)'}`,
      borderRadius: '16px',
      padding: '20px',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
    }),
    checkHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '8px',
    },
    checkTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      color: '#f8fafc',
      fontWeight: '600',
      fontSize: '1.05rem',
    },
    statusText: (status) => ({
      fontSize: '0.85rem',
      color: getStatusColor(status),
      fontWeight: '500',
    }),
    checkDetail: {
      color: '#94a3b8',
      fontSize: '0.85rem',
      marginTop: '4px',
    },
    audioMeter: {
      height: '8px',
      background: 'rgba(255, 255, 255, 0.06)',
      borderRadius: '4px',
      marginTop: '10px',
      overflow: 'hidden',
    },
    audioFill: (level) => ({
      height: '100%',
      width: `${level * 100}%`,
      background: '#22c55e',
      borderRadius: '4px',
      transition: 'width 0.1s ease',
    }),
    speakerActions: {
      display: 'flex',
      gap: '10px',
      marginTop: '10px',
    },
    btn: (variant) => ({
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.85rem',
      transition: 'all 0.2s ease',
      background: variant === 'primary'
        ? '#DAA464'
        : 'rgba(255, 255, 255, 0.08)',
      color: variant === 'primary' ? '#0a0a1e' : '#f8fafc',
    }),
    tipsCard: {
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01) 50%, rgba(9, 14, 34, 0.32))',
      backdropFilter: 'blur(18px) saturate(150%)',
      WebkitBackdropFilter: 'blur(18px) saturate(150%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 6px 24px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    },
    tipsTitle: {
      color: '#f8fafc',
      fontWeight: '600',
      marginBottom: '12px',
      fontSize: '0.95rem',
    },
    tip: {
      color: '#94a3b8',
      fontSize: '0.85rem',
      padding: '4px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    continueBtn: {
      marginTop: '30px',
      padding: '14px 40px',
      borderRadius: '12px',
      border: 'none',
      cursor: allPassed ? 'pointer' : 'not-allowed',
      fontWeight: '700',
      fontSize: '1.1rem',
      background: allPassed
        ? '#DAA464'
        : 'rgba(255, 255, 255, 0.05)',
      color: allPassed ? '#0a0a1e' : '#94a3b8',
      transition: 'all 0.3s ease',
      transform: allPassed ? 'scale(1)' : 'scale(0.98)',
      boxShadow: allPassed ? '0 4px 20px rgba(218, 164, 100, 0.4)' : 'none',
    },
    errorBox: {
      background: 'rgba(239,68,68,0.1)',
      border: '1px solid rgba(239,68,68,0.3)',
      borderRadius: '8px',
      padding: '12px 16px',
      color: '#ef4444',
      fontSize: '0.9rem',
      marginTop: '12px',
    },
  };

  if (!sessionId) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>No session ID provided. Please go back and start the interview process.</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Hardware Check</h1>
        <p style={styles.subtitle}>Let&apos;s make sure your camera, microphone, and speakers are working properly</p>
      </div>

      <div style={styles.content}>
        <div style={styles.videoSection}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={styles.video}
          />
          {cameraName && (
            <p style={styles.checkDetail}>📷 {cameraName}</p>
          )}
          {micName && (
            <p style={styles.checkDetail}>🎤 {micName}</p>
          )}
        </div>

        <div style={styles.checksSection}>
          {/* Camera Check */}
          <div style={styles.checkCard(cameraStatus)}>
            <div style={styles.checkHeader}>
              <div style={styles.checkTitle}>
                <span>{getStatusIcon(cameraStatus)}</span>
                <span>Camera</span>
              </div>
              <span style={styles.statusText(cameraStatus)}>
                {cameraStatus === 'passed' ? 'Working' : cameraStatus === 'testing' ? 'Testing...' : cameraStatus === 'failed' ? 'Failed' : 'Waiting'}
              </span>
            </div>
            <p style={styles.checkDetail}>
              {cameraStatus === 'passed' ? 'Camera is active and ready.' : 'Checking camera access...'}
            </p>
          </div>

          {/* Microphone Check */}
          <div style={styles.checkCard(micStatus)}>
            <div style={styles.checkHeader}>
              <div style={styles.checkTitle}>
                <span>{getStatusIcon(micStatus)}</span>
                <span>Microphone</span>
              </div>
              <span style={styles.statusText(micStatus)}>
                {micStatus === 'passed' ? 'Working' : micStatus === 'testing' ? 'Speak to test...' : micStatus === 'failed' ? 'Failed' : 'Waiting'}
              </span>
            </div>
            <p style={styles.checkDetail}>
              {micStatus === 'testing' ? 'Say something to verify your microphone.' : micStatus === 'passed' ? 'Microphone detected audio input.' : 'Waiting for camera...'}
            </p>
            {(micStatus === 'testing' || micStatus === 'passed') && (
              <div style={styles.audioMeter}>
                <div style={styles.audioFill(audioLevel)} />
              </div>
            )}
          </div>

          {/* Speaker Check */}
          <div style={styles.checkCard(speakerStatus)}>
            <div style={styles.checkHeader}>
              <div style={styles.checkTitle}>
                <span>{getStatusIcon(speakerStatus)}</span>
                <span>Speakers</span>
              </div>
              <span style={styles.statusText(speakerStatus)}>
                {speakerStatus === 'passed' ? 'Confirmed' : speakerStatus === 'testing' ? 'Playing...' : 'Ready to test'}
              </span>
            </div>
            <p style={styles.checkDetail}>
              Click the button to play a test sound, then confirm you heard it.
            </p>
            {speakerStatus !== 'passed' && (
              <div style={styles.speakerActions}>
                <button style={styles.btn('secondary')} onClick={testSpeaker}>
                  🔊 Play Test Sound
                </button>
                <button style={styles.btn('primary')} onClick={confirmSpeaker}>
                  ✓ I Heard It
                </button>
              </div>
            )}
          </div>

          {/* Tips */}
          <div style={styles.tipsCard}>
            <div style={styles.tipsTitle}>💡 Tips for Best Experience</div>
            <div style={styles.tip}>🔇 Use a quiet room with minimal background noise</div>
            <div style={styles.tip}>💡 Ensure good lighting on your face</div>
            <div style={styles.tip}>🪟 Close other browser tabs to avoid distractions</div>
            <div style={styles.tip}>🔋 Ensure your device is charged or plugged in</div>
          </div>
        </div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <button
        style={styles.continueBtn}
        onClick={handleContinue}
        disabled={!allPassed}
      >
        {allPassed ? '→ Continue to Interview' : 'Complete all checks to continue'}
      </button>
    </div>
  );
}

export default function HardwareCheckPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#f8fafc' }}>Loading...</div>
      </div>
    }>
      <HardwareCheckContent />
    </Suspense>
  );
}
