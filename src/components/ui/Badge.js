'use client';

const dotPulseKeyframes = `
@keyframes badge-dot-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.75);
  }
}
`;

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
}) {
  const variantColors = {
    success: {
      background: 'rgba(34, 197, 94, 0.15)',
      color: '#22c55e',
      borderColor: 'rgba(34, 197, 94, 0.3)',
      dotColor: '#22c55e',
    },
    warning: {
      background: 'rgba(245, 158, 11, 0.15)',
      color: '#f59e0b',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      dotColor: '#f59e0b',
    },
    danger: {
      background: 'rgba(239, 68, 68, 0.15)',
      color: '#ef4444',
      borderColor: 'rgba(239, 68, 68, 0.3)',
      dotColor: '#ef4444',
    },
    info: {
      background: 'rgba(99, 102, 241, 0.15)',
      color: '#818cf8',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      dotColor: '#818cf8',
    },
    neutral: {
      background: 'rgba(255, 255, 255, 0.08)',
      color: 'rgba(255, 255, 255, 0.6)',
      borderColor: 'rgba(255, 255, 255, 0.12)',
      dotColor: 'rgba(255, 255, 255, 0.5)',
    },
  };

  const sizeStyles = {
    sm: {
      padding: dot ? '3px 10px 3px 8px' : '3px 10px',
      fontSize: '11px',
      gap: '5px',
      dotSize: 6,
    },
    md: {
      padding: dot ? '5px 14px 5px 10px' : '5px 14px',
      fontSize: '12px',
      gap: '6px',
      dotSize: 8,
    },
  };

  const colors = variantColors[variant] || variantColors.neutral;
  const sizing = sizeStyles[size] || sizeStyles.md;

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: sizing.gap,
    padding: sizing.padding,
    fontSize: sizing.fontSize,
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    borderRadius: '999px',
    background: colors.background,
    color: colors.color,
    border: `1px solid ${colors.borderColor}`,
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
    userSelect: 'none',
  };

  const dotStyle = {
    width: sizing.dotSize,
    height: sizing.dotSize,
    borderRadius: '50%',
    backgroundColor: colors.dotColor,
    flexShrink: 0,
    animation: 'badge-dot-pulse 1.5s ease-in-out infinite',
  };

  return (
    <>
      {dot && <style dangerouslySetInnerHTML={{ __html: dotPulseKeyframes }} />}
      <span style={badgeStyle}>
        {dot && <span style={dotStyle} />}
        {children}
      </span>
    </>
  );
}
