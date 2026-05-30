'use client';

import { useState } from 'react';

export default function Card({
  children,
  className = '',
  style: externalStyle = {},
  hover = false,
  glow = false,
  padding = '24px',
}) {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyle = {
    background: 'rgba(15, 20, 45, 0.5)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: glow && isHovered
      ? '1px solid rgba(218, 164, 100, 0.8)'
      : '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: padding,
    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: hover && isHovered ? 'translateY(-4px)' : 'translateY(0)',
    boxShadow: glow && isHovered
      ? '0 8px 40px rgba(218, 164, 100, 0.2), 0 0 30px rgba(222, 195, 132, 0.15), 0 4px 20px rgba(0, 0, 0, 0.2)'
      : hover && isHovered
        ? '0 12px 40px rgba(0, 0, 0, 0.3)'
        : '0 4px 20px rgba(0, 0, 0, 0.2)',
    position: 'relative',
    overflow: 'hidden',
    ...externalStyle,
  };

  return (
    <div
      className={className}
      style={baseStyle}
      onMouseEnter={() => {
        if (hover || glow) setIsHovered(true);
      }}
      onMouseLeave={() => {
        if (hover || glow) setIsHovered(false);
      }}
    >
      {children}
    </div>
  );
}
