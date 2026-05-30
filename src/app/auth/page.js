'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [role, setRole] = useState('candidate'); // 'candidate' or 'recruiter'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.role === 'recruiter') {
          router.push('/recruiter');
        } else {
          router.push('/candidate');
        }
      } catch { }
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const body = mode === 'register'
        ? { action: 'register', name: name.trim(), email: email.trim().toLowerCase(), password, role }
        : { action: 'login', email: email.trim().toLowerCase(), password };

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store auth data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === 'recruiter') {
        router.push('/recruiter');
      } else {
        router.push('/candidate');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (inputName) => ({
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: focusedInput === inputName
      ? '1px solid #DAA464'
      : '1px solid rgba(255, 255, 255, 0.1)',
    background: focusedInput === inputName
      ? 'rgba(20, 25, 55, 0.7)'
      : 'rgba(15, 20, 45, 0.5)',
    color: '#f8fafc',
    fontSize: '15px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.25s ease',
    boxSizing: 'border-box',
    boxShadow: focusedInput === inputName
      ? '0 0 0 3px rgba(218, 164, 100, 0.2)'
      : 'none',
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050816',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '-10%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(218, 164, 100, 0.08) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        right: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(222, 195, 132, 0.08) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: '480px',
        width: '100%',
        zIndex: 1,
        animation: 'fadeInUp 0.6s ease-out forwards',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '24px',
          }}>
            <span style={{
              width: '14px',
              height: '14px',
              borderRadius: '4px',
              background: 'linear-gradient(135deg, #f4d39c, #DAA464)',
              boxShadow: '0 0 22px rgba(218, 164, 100, 0.5)',
              transform: 'rotate(45deg)',
              display: 'inline-block',
            }} />
            <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.4rem' }}>
              Interview<span style={{ color: '#DAA464' }}>AI</span>
            </span>
          </Link>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#f8fafc',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px',
          }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#94a3b8',
            margin: 0,
          }}>
            {mode === 'login'
              ? 'Sign in to continue to your dashboard'
              : 'Get started with AI-powered interviews'}
          </p>
        </div>

        {/* Main Card */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02) 46%, rgba(9, 14, 34, 0.42))',
          backdropFilter: 'blur(26px) saturate(180%)',
          WebkitBackdropFilter: 'blur(26px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: '36px',
          boxShadow: '0 18px 55px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.22), inset 0 -28px 60px rgba(255, 255, 255, 0.02)',
        }}>
          {/* Mode Toggle */}
          <div style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '28px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '4px',
          }}>
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  transition: 'all 0.25s ease',
                  background: mode === m ? 'linear-gradient(135deg, #DAA464, #DEC384)' : 'transparent',
                  color: mode === m ? '#0a0a1e' : '#94a3b8',
                }}
              >
                {m === 'login' ? '🔑 Sign In' : '✨ Sign Up'}
              </button>
            ))}
          </div>

          {/* Role Selection (only for register) */}
          {mode === 'register' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#f8fafc',
                marginBottom: '10px',
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
              }}>
                I am a...
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[
                  { value: 'candidate', icon: '🎥', label: 'Candidate', desc: 'Taking interviews' },
                  { value: 'recruiter', icon: '💼', label: 'Recruiter', desc: 'Hiring talent' },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    style={{
                      flex: 1,
                      padding: '16px',
                      borderRadius: '14px',
                      border: role === r.value
                        ? '1px solid rgba(218, 164, 100, 0.6)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      background: role === r.value
                        ? 'rgba(218, 164, 100, 0.12)'
                        : 'rgba(15, 20, 45, 0.4)',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      textAlign: 'center',
                      fontFamily: 'inherit',
                      boxShadow: role === r.value
                        ? '0 0 20px rgba(218, 164, 100, 0.15)'
                        : 'none',
                    }}
                  >
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{r.icon}</div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: role === r.value ? '#DAA464' : '#f8fafc',
                      marginBottom: '4px',
                    }}>
                      {r.label}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#94a3b8',
                    }}>
                      {r.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
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
            }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name (register only) */}
            {mode === 'register' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#f8fafc',
                  marginBottom: '8px',
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput(null)}
                  style={getInputStyle('name')}
                />
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#f8fafc',
                marginBottom: '8px',
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                style={getInputStyle('email')}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#f8fafc',
                marginBottom: '8px',
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Min 6 characters' : '••••••••'}
                required
                minLength={6}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                style={getInputStyle('password')}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px 24px',
                borderRadius: '14px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 700,
                fontFamily: 'inherit',
                color: loading ? '#94a3b8' : '#0a0a1e',
                background: loading
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'linear-gradient(135deg, #DAA464, #DEC384)',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.3s ease',
                boxShadow: loading
                  ? 'none'
                  : '0 4px 20px rgba(218, 164, 100, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                letterSpacing: '0.3px',
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    display: 'inline-block',
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    borderTopColor: '#DAA464',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite',
                  }} />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'login' ? '🔑 Sign In' : '🚀 Create Account'
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: '#DAA464',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'opacity 0.2s',
              }}
            >
              {mode === 'login'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '13px',
          color: '#64748b',
        }}>
          <Link href="/" style={{
            color: '#94a3b8',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}>
            ← Back to home
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
