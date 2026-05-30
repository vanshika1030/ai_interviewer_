'use client';

import { useState } from 'react';

const spinnerKeyframes = `
@keyframes button-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  style: externalStyle = {},
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const sizeStyles = {
    sm: {
      padding: '8px 16px',
      fontSize: '13px',
      borderRadius: '8px',
      gap: '6px',
      spinnerSize: 14,
    },
    md: {
      padding: '12px 24px',
      fontSize: '15px',
      borderRadius: '12px',
      gap: '8px',
      spinnerSize: 18,
    },
    lg: {
      padding: '16px 32px',
      fontSize: '17px',
      borderRadius: '14px',
      gap: '10px',
      spinnerSize: 22,
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #DAA464, #DEC384)',
      color: '#0a0a1e',
      border: 'none',
      boxShadow: isHovered && !disabled
        ? '0 8px 30px rgba(218, 164, 100, 0.4), 0 0 20px rgba(222, 195, 132, 0.2)'
        : '0 4px 15px rgba(218, 164, 100, 0.2)',
    },
    secondary: {
      background: 'rgba(15, 20, 45, 0.5)',
      color: 'var(--text-primary)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(20px)',
      boxShadow: isHovered && !disabled
        ? '0 8px 30px rgba(255, 255, 255, 0.05), 0 0 15px rgba(255, 255, 255, 0.03)'
        : 'none',
    },
    danger: {
      background: '#ef4444',
      color: 'var(--text-primary)',
      border: 'none',
      boxShadow: isHovered && !disabled
        ? '0 8px 30px rgba(239, 68, 68, 0.4), 0 0 20px rgba(239, 68, 68, 0.2)'
        : '0 4px 15px rgba(239, 68, 68, 0.2)',
    },
    ghost: {
      background: isHovered && !disabled ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid transparent',
      boxShadow: 'none',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.primary;

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: currentSize.gap,
    padding: currentSize.padding,
    fontSize: currentSize.fontSize,
    fontWeight: 600,
    fontFamily: 'inherit',
    lineHeight: 1.4,
    borderRadius: currentSize.borderRadius,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: isPressed && !disabled
      ? 'scale(0.97)'
      : isHovered && !disabled
        ? 'scale(1.03)'
        : 'scale(1)',
    width: fullWidth ? '100%' : 'auto',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    outline: 'none',
    letterSpacing: '0.01em',
    position: 'relative',
    overflow: 'hidden',
    ...currentVariant,
    ...externalStyle,
  };

  const spinnerStyle = {
    width: currentSize.spinnerSize,
    height: currentSize.spinnerSize,
    border: `2px solid rgba(255, 255, 255, 0.2)`,
    borderTopColor: '#DAA464',
    borderRadius: '50%',
    animation: 'button-spin 0.6s linear infinite',
    flexShrink: 0,
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: spinnerKeyframes }} />
      <button
        type={type}
        onClick={disabled || loading ? undefined : onClick}
        disabled={disabled || loading}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        style={baseStyle}
      >
        {loading && <span style={spinnerStyle} />}
        <span style={{ opacity: loading ? 0.8 : 1 }}>
          {children}
        </span>
      </button>
    </>
  );
}
