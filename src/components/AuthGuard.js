'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * AuthGuard - Client-side route protection component.
 * Wraps pages that require authentication and optionally a specific role.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected page content
 * @param {string} [props.requiredRole] - Optional role required ('recruiter' or 'candidate')
 * @param {Function} [props.onUser] - Optional callback with user data once authenticated
 */
export default function AuthGuard({ children, requiredRole, onUser }) {
  const router = useRouter();
  const [status, setStatus] = useState('loading'); // 'loading' | 'authenticated' | 'redirecting'
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      setStatus('redirecting');
      router.push('/auth');
      return;
    }

    try {
      const parsed = JSON.parse(userData);

      // Check role if required
      if (requiredRole && parsed.role !== requiredRole) {
        setStatus('redirecting');
        // Redirect to their correct dashboard
        if (parsed.role === 'recruiter') {
          router.push('/recruiter');
        } else {
          router.push('/candidate');
        }
        return;
      }

      setUser(parsed);
      if (onUser) onUser(parsed, token);
      setStatus('authenticated');
    } catch {
      // Invalid user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setStatus('redirecting');
      router.push('/auth');
    }
  }, [router, requiredRole, onUser]);

  if (status === 'loading' || status === 'redirecting') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#050816',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255, 255, 255, 0.1)',
          borderTopColor: '#DAA464',
          borderRadius: '50%',
          animation: 'authguard-spin 0.7s linear infinite',
        }} />
        <p style={{
          color: '#94a3b8',
          fontSize: '14px',
          fontWeight: 500,
        }}>
          {status === 'redirecting' ? 'Redirecting...' : 'Loading...'}
        </p>
        <style>{`
          @keyframes authguard-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return children;
}

/**
 * Helper to get stored auth data
 */
export function getStoredAuth() {
  if (typeof window === 'undefined') return { token: null, user: null };

  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');

  if (!token || !userData) return { token: null, user: null };

  try {
    return { token, user: JSON.parse(userData) };
  } catch {
    return { token: null, user: null };
  }
}

/**
 * Logout helper - clears auth and redirects
 */
export function logout(router) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/auth');
}
