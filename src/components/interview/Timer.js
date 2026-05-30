'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const timerKeyframes = `
@keyframes timer-pulse {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.4));
  }
  50% {
    transform: scale(1.04);
    filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.7));
  }
}
`;

export default function Timer({
  duration = 60,
  onComplete,
  isRunning = false,
  size = 'lg',
}) {
  const [remaining, setRemaining] = useState(duration);
  const intervalRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setRemaining(duration);
  }, [duration]);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            if (onCompleteRef.current) onCompleteRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, remaining]);

  const sizeConfig = {
    sm: { dimension: 80, strokeWidth: 4, fontSize: 16, labelSize: 10 },
    lg: { dimension: 160, strokeWidth: 6, fontSize: 32, labelSize: 13 },
  };

  const config = sizeConfig[size] || sizeConfig.lg;
  const radius = (config.dimension - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = duration > 0 ? remaining / duration : 0;
  const strokeDashoffset = circumference * (1 - progress);

  const getColor = useCallback(() => {
    if (progress > 0.5) return '#22c55e';
    if (progress > 0.25) return '#f59e0b';
    return '#ef4444';
  }, [progress]);

  const color = getColor();
  const isPulsing = remaining <= 10 && remaining > 0 && isRunning;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const containerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: config.dimension,
    height: config.dimension,
    animation: isPulsing ? 'timer-pulse 1s ease-in-out infinite' : 'none',
  };

  const svgStyle = {
    transform: 'rotate(-90deg)',
    width: config.dimension,
    height: config.dimension,
  };

  const bgCircleStyle = {
    fill: 'none',
    stroke: 'rgba(255, 255, 255, 0.08)',
    strokeWidth: config.strokeWidth,
  };

  const progressCircleStyle = {
    fill: 'none',
    stroke: color,
    strokeWidth: config.strokeWidth,
    strokeLinecap: 'round',
    strokeDasharray: circumference,
    strokeDashoffset: strokeDashoffset,
    transition: 'stroke-dashoffset 0.9s linear, stroke 0.5s ease',
    filter: `drop-shadow(0 0 6px ${color}40)`,
  };

  const center = config.dimension / 2;

  const textContainerStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  };

  const timeStyle = {
    fontSize: config.fontSize,
    fontWeight: 700,
    color: color,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.02em',
    lineHeight: 1,
    transition: 'color 0.5s ease',
  };

  const labelStyle = {
    fontSize: config.labelSize,
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 500,
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: timerKeyframes }} />
      <div style={containerStyle}>
        <svg style={svgStyle}>
          <circle
            style={bgCircleStyle}
            cx={center}
            cy={center}
            r={radius}
          />
          <circle
            style={progressCircleStyle}
            cx={center}
            cy={center}
            r={radius}
          />
        </svg>
        <div style={textContainerStyle}>
          <span style={timeStyle}>{timeDisplay}</span>
          {size === 'lg' && <span style={labelStyle}>remaining</span>}
        </div>
      </div>
    </>
  );
}
