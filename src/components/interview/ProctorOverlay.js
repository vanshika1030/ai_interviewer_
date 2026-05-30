'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const proctorKeyframes = `
@keyframes proctor-slide-down {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
@keyframes proctor-slide-up {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-100%);
    opacity: 0;
  }
}
`;

const warningConfig = {
  'tab-switch': {
    icon: '⚠',
    label: 'Tab Switch Detected',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  'no-face': {
    icon: '👤',
    label: 'No Face Detected',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  'multiple-faces': {
    icon: '👥',
    label: 'Multiple Faces Detected',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
};

function WarningItem({ warning, onDismiss }) {
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(warning.id), 400);
    }, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [warning.id, onDismiss]);

  const config = warningConfig[warning.type] || warningConfig['tab-switch'];

  const itemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    background: config.bgColor,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${config.borderColor}`,
    borderRadius: '12px',
    animation: isExiting
      ? 'proctor-slide-up 0.4s ease-in forwards'
      : 'proctor-slide-down 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  };

  const iconStyle = {
    fontSize: '16px',
    flexShrink: 0,
  };

  const textStyle = {
    flex: 1,
    color: config.color,
    fontSize: '13px',
    fontWeight: 600,
    lineHeight: 1.3,
  };

  const messageStyle = {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '12px',
    fontWeight: 400,
    marginTop: '2px',
  };

  return (
    <div style={itemStyle}>
      <span style={iconStyle}>{config.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={textStyle}>{config.label}</div>
        {warning.message && <div style={messageStyle}>{warning.message}</div>}
      </div>
    </div>
  );
}

export default function ProctorOverlay({
  warnings = [],
  isActive = true,
}) {
  const [visibleWarnings, setVisibleWarnings] = useState([]);
  const processedIdsRef = useRef(new Set());
  const warningCountRef = useRef({});

  useEffect(() => {
    if (!isActive) return;

    const newWarnings = warnings.filter((w) => {
      const id = `${w.type}-${w.timestamp}`;
      if (processedIdsRef.current.has(id)) return false;
      processedIdsRef.current.add(id);
      return true;
    });

    if (newWarnings.length > 0) {
      const warningsWithId = newWarnings.map((w) => ({
        ...w,
        id: `${w.type}-${w.timestamp}-${Math.random().toString(36).slice(2, 8)}`,
      }));

      warningsWithId.forEach((w) => {
        warningCountRef.current[w.type] = (warningCountRef.current[w.type] || 0) + 1;
      });

      setVisibleWarnings((prev) => [...prev, ...warningsWithId]);
    }
  }, [warnings, isActive]);

  const dismissWarning = useCallback((id) => {
    setVisibleWarnings((prev) => prev.filter((w) => w.id !== id));
  }, []);

  if (!isActive || visibleWarnings.length === 0) return null;

  const typeCounts = {};
  visibleWarnings.forEach((w) => {
    typeCounts[w.type] = (typeCounts[w.type] || 0) + 1;
  });

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9000,
    pointerEvents: 'none',
    padding: '12px 16px',
  };

  const innerStyle = {
    maxWidth: '400px',
    marginLeft: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    pointerEvents: 'auto',
  };

  const counterBarStyle = {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
    marginBottom: '4px',
  };

  const countBadgeStyle = (color) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px',
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${color}30`,
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: 600,
    color: color,
  });

  const totalCounts = warningCountRef.current;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: proctorKeyframes }} />
      <div style={overlayStyle}>
        <div style={innerStyle}>
          {Object.keys(totalCounts).length > 0 && (
            <div style={counterBarStyle}>
              {Object.entries(totalCounts).map(([type, count]) => {
                const cfg = warningConfig[type];
                if (!cfg) return null;
                return (
                  <span key={type} style={countBadgeStyle(cfg.color)}>
                    {cfg.icon} {count}
                  </span>
                );
              })}
            </div>
          )}
          {visibleWarnings.slice(-5).map((warning) => (
            <WarningItem
              key={warning.id}
              warning={warning}
              onDismiss={dismissWarning}
            />
          ))}
        </div>
      </div>
    </>
  );
}
