'use client';

import { useState, useEffect } from 'react';
import Badge from '../ui/Badge';

const questionCardKeyframes = `
@keyframes question-enter {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes active-border-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.15), 0 4px 30px rgba(0, 0, 0, 0.3);
  }
  50% {
    box-shadow: 0 0 35px rgba(99, 102, 241, 0.25), 0 4px 30px rgba(0, 0, 0, 0.3);
  }
}
`;

const categoryMap = {
  technical: { variant: 'info', label: 'Technical' },
  behavioral: { variant: 'info', label: 'Behavioral', customColor: 'rgba(168, 85, 247, 0.15)', customText: '#c084fc', customBorder: 'rgba(168, 85, 247, 0.3)' },
  situational: { variant: 'warning', label: 'Situational' },
  general: { variant: 'neutral', label: 'General' },
};

export default function QuestionCard({
  question = {},
  currentIndex = 0,
  totalQuestions = 1,
  isActive = false,
}) {
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    setHasEntered(false);
    const raf = requestAnimationFrame(() => setHasEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [question?.text, currentIndex]);

  const category = question?.category?.toLowerCase() || 'general';
  const catConfig = categoryMap[category] || categoryMap.general;

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: isActive
      ? '1px solid rgba(99, 102, 241, 0.4)'
      : '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '32px',
    animation: hasEntered
      ? `question-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards${isActive ? ', active-border-glow 3s ease-in-out infinite' : ''}`
      : 'none',
    opacity: hasEntered ? 1 : 0,
    position: 'relative',
    overflow: 'hidden',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '10px',
  };

  const questionNumberStyle = {
    fontSize: '13px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: '0.04em',
  };

  const questionNumberHighlight = {
    color: '#818cf8',
    fontWeight: 700,
  };

  const questionTextStyle = {
    fontSize: '20px',
    fontWeight: 600,
    color: '#ffffff',
    lineHeight: 1.6,
    letterSpacing: '-0.01em',
  };

  const timeLimitStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.35)',
  };

  const timeLimitIcon = {
    fontSize: '14px',
  };

  const behavioralBadgeStyle = category === 'behavioral'
    ? {
        background: catConfig.customColor,
        color: catConfig.customText,
        border: `1px solid ${catConfig.customBorder}`,
        display: 'inline-flex',
        alignItems: 'center',
        padding: '5px 14px',
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        borderRadius: '999px',
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }
    : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: questionCardKeyframes }} />
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span style={questionNumberStyle}>
            <span style={questionNumberHighlight}>Q{currentIndex + 1}</span> of {totalQuestions}
          </span>
          {behavioralBadgeStyle ? (
            <span style={behavioralBadgeStyle}>{catConfig.label}</span>
          ) : (
            <Badge variant={catConfig.variant} size="sm">
              {catConfig.label}
            </Badge>
          )}
        </div>

        <p style={questionTextStyle}>
          {question?.text || 'No question available'}
        </p>

        {question?.timeLimit && (
          <div style={timeLimitStyle}>
            <span style={timeLimitIcon}>⏱</span>
            <span>{question.timeLimit} seconds to answer</span>
          </div>
        )}
      </div>
    </>
  );
}
