'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const toastKeyframes = `
@keyframes toast-slide-in {
  0% {
    transform: translateX(120%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
@keyframes toast-slide-out {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(120%);
    opacity: 0;
  }
}
`;

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

function ToastItem({ toast, onRemove }) {
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, 3000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, onRemove]);

  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const typeConfig = {
    success: {
      icon: '✓',
      bgColor: 'rgba(34, 197, 94, 0.12)',
      borderColor: 'rgba(34, 197, 94, 0.3)',
      iconBg: 'rgba(34, 197, 94, 0.2)',
      iconColor: '#22c55e',
    },
    error: {
      icon: '✗',
      bgColor: 'rgba(239, 68, 68, 0.12)',
      borderColor: 'rgba(239, 68, 68, 0.3)',
      iconBg: 'rgba(239, 68, 68, 0.2)',
      iconColor: '#ef4444',
    },
    warning: {
      icon: '⚠',
      bgColor: 'rgba(245, 158, 11, 0.12)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      iconBg: 'rgba(245, 158, 11, 0.2)',
      iconColor: '#f59e0b',
    },
    info: {
      icon: 'ℹ',
      bgColor: 'rgba(99, 102, 241, 0.12)',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      iconBg: 'rgba(99, 102, 241, 0.2)',
      iconColor: '#818cf8',
    },
  };

  const config = typeConfig[toast.type] || typeConfig.info;

  const toastStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 18px',
    background: config.bgColor,
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    border: `1px solid ${config.borderColor}`,
    borderRadius: '14px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 0, 0, 0.2)',
    minWidth: '300px',
    maxWidth: '420px',
    animation: isExiting
      ? 'toast-slide-out 0.3s ease-in forwards'
      : 'toast-slide-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
    pointerEvents: 'all',
  };

  const iconContainerStyle = {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    background: config.iconBg,
    color: config.iconColor,
    fontSize: '15px',
    fontWeight: 700,
    flexShrink: 0,
  };

  const messageStyle = {
    flex: 1,
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 1.4,
  };

  const closeStyle = {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'none',
    borderRadius: '8px',
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '14px',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.2s ease',
    padding: 0,
    fontFamily: 'inherit',
  };

  return (
    <div style={toastStyle}>
      <span style={iconContainerStyle}>{config.icon}</span>
      <span style={messageStyle}>{toast.message}</span>
      <button
        style={closeStyle}
        onClick={handleClose}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
        }}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idCounter = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = ++idCounter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const containerStyle = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 10000,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    pointerEvents: 'none',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <style dangerouslySetInnerHTML={{ __html: toastKeyframes }} />
      {children}
      <div style={containerStyle}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
