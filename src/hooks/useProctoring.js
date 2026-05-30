'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export default function useProctoring({ videoRef, enabled = true, onViolation } = {}) {
  const [violations, setViolations] = useState({
    tabSwitchCount: 0,
    faceAbsenceCount: 0,
    events: [],
  });
  const [isMonitoring, setIsMonitoring] = useState(false);

  const onViolationRef = useRef(onViolation);
  const canvasRef = useRef(null);
  const analyzeIntervalRef = useRef(null);
  const enabledRef = useRef(enabled);
  const consecutiveAbsenceRef = useRef(0);
  const ABSENCE_THRESHOLD = 2;

  useEffect(() => {
    onViolationRef.current = onViolation;
  }, [onViolation]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const addViolation = useCallback((type, details) => {
    const event = {
      type,
      details,
      timestamp: new Date().toISOString(),
    };

    setViolations((prev) => {
      const updated = {
        ...prev,
        events: [...prev.events, event],
      };

      if (type === 'tab_switch') {
        updated.tabSwitchCount = prev.tabSwitchCount + 1;
      } else if (type === 'face_not_detected') {
        updated.faceAbsenceCount = prev.faceAbsenceCount + 1;
      }

      return updated;
    });

    if (onViolationRef.current) {
      try {
        onViolationRef.current(event);
      } catch (err) {
        console.error('[useProctoring] onViolation callback error:', err);
      }
    }
  }, []);

  // Tab visibility detection
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden && enabledRef.current) {
        addViolation('tab_switch', 'Candidate switched away from the interview tab');
      }
    };

    const handleWindowBlur = () => {
      if (enabledRef.current) {
        addViolation('tab_switch', 'Interview window lost focus');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [enabled, addViolation]);

  // Frame analysis for face/camera detection
  useEffect(() => {
    if (!enabled) {
      setIsMonitoring(false);
      return;
    }

    const video = videoRef?.current;
    if (!video) {
      setIsMonitoring(false);
      return;
    }

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const analyzeFrame = () => {
      if (!enabledRef.current) return;

      const currentVideo = videoRef?.current;
      if (
        !currentVideo ||
        currentVideo.readyState < 2 ||
        currentVideo.videoWidth === 0 ||
        currentVideo.videoHeight === 0
      ) {
        return;
      }

      const sampleWidth = 160;
      const sampleHeight = 120;
      canvas.width = sampleWidth;
      canvas.height = sampleHeight;

      try {
        ctx.drawImage(currentVideo, 0, 0, sampleWidth, sampleHeight);
      } catch (err) {
        return;
      }

      // Analyze the center region for brightness and variance
      const centerX = Math.floor(sampleWidth * 0.25);
      const centerY = Math.floor(sampleHeight * 0.2);
      const centerW = Math.floor(sampleWidth * 0.5);
      const centerH = Math.floor(sampleHeight * 0.6);

      let imageData;
      try {
        imageData = ctx.getImageData(centerX, centerY, centerW, centerH);
      } catch (err) {
        return;
      }

      const data = imageData.data;
      const pixelCount = data.length / 4;

      let totalBrightness = 0;
      let brightnesses = [];

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        totalBrightness += brightness;
        brightnesses.push(brightness);
      }

      const avgBrightness = totalBrightness / pixelCount;

      let varianceSum = 0;
      for (let i = 0; i < brightnesses.length; i++) {
        const diff = brightnesses[i] - avgBrightness;
        varianceSum += diff * diff;
      }
      const variance = varianceSum / pixelCount;
      const stdDev = Math.sqrt(variance);

      // Camera covered: very dark image with low variance
      const isCameraCovered = avgBrightness < 15 && stdDev < 8;

      // Completely uniform frame: either blocked or no face
      const isUniformFrame = stdDev < 5 && (avgBrightness < 20 || avgBrightness > 240);

      if (isCameraCovered || isUniformFrame) {
        consecutiveAbsenceRef.current += 1;

        if (consecutiveAbsenceRef.current >= ABSENCE_THRESHOLD) {
          addViolation(
            'face_not_detected',
            isCameraCovered
              ? 'Camera appears to be covered or blocked'
              : 'No face detected - camera may be obstructed or candidate may have left'
          );
          consecutiveAbsenceRef.current = 0;
        }
      } else {
        consecutiveAbsenceRef.current = 0;
      }
    };

    setIsMonitoring(true);
    analyzeIntervalRef.current = setInterval(analyzeFrame, 3000);

    return () => {
      if (analyzeIntervalRef.current) {
        clearInterval(analyzeIntervalRef.current);
        analyzeIntervalRef.current = null;
      }
      setIsMonitoring(false);
    };
  }, [enabled, videoRef, addViolation]);

  // Cleanup canvas on unmount
  useEffect(() => {
    return () => {
      canvasRef.current = null;
      if (analyzeIntervalRef.current) {
        clearInterval(analyzeIntervalRef.current);
      }
    };
  }, []);

  return {
    violations,
    isMonitoring,
  };
}
