'use client';

import { useEffect, useCallback } from 'react';

const modalKeyframes = `
@keyframes modal-fade-in {
  0% {
    opacity: 0;
    transform: scale(0.92) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
@keyframes modal-overlay-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
`;

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) {
  const handleEscape = useCallback(
    (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizeWidths = {
    sm: '420px',
    md: '560px',
    lg: '740px',
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
    animation: 'modal-overlay-in 0.25s ease-out forwards',
  };

  const contentStyle = {
    background: 'rgba(15, 20, 45, 0.85)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    padding: '32px',
    maxWidth: sizeWidths[size] || sizeWidths.md,
    width: '100%',
    maxHeight: '85vh',
    overflowY: 'auto',
    position: 'relative',
    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(218, 164, 100, 0.08)',
    animation: 'modal-fade-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
    color: 'var(--text-primary)',
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: 'var(--text-secondary)',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    lineHeight: 1,
    padding: 0,
  };

  const titleStyle = {
    fontSize: '22px',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #DAA464, #DEC384)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '24px',
    paddingRight: '40px',
    lineHeight: 1.3,
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: modalKeyframes }} />
      <div style={overlayStyle} onClick={handleOverlayClick}>
        <div style={contentStyle}>
          <button
            style={closeButtonStyle}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            aria-label="Close modal"
          >
            ✕
          </button>
          {title && <h2 style={titleStyle}>{title}</h2>}
          <div>{children}</div>
        </div>
      </div>
    </>
  );
}
