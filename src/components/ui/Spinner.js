'use client';

const spinKeyframes = `
@keyframes spinner-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

export default function Spinner({
  size = 'md',
  color = '#6366f1',
}) {
  const sizeMap = {
    sm: { dimension: 20, borderWidth: 2 },
    md: { dimension: 36, borderWidth: 3 },
    lg: { dimension: 56, borderWidth: 4 },
  };

  const current = sizeMap[size] || sizeMap.md;

  const spinnerStyle = {
    display: 'inline-block',
    width: current.dimension,
    height: current.dimension,
    border: `${current.borderWidth}px solid rgba(255, 255, 255, 0.1)`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'spinner-rotate 0.7s linear infinite',
    flexShrink: 0,
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: spinKeyframes }} />
      <span style={spinnerStyle} role="status" aria-label="Loading" />
    </>
  );
}
