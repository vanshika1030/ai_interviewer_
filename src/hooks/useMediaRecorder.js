'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

function getSupportedMimeType() {
  const candidates = [
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8',
    'video/webm;codecs=vp9',
    'video/webm',
    'video/mp4;codecs=h264,aac',
    'video/mp4',
  ];

  for (const mime of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }

  return '';
}

export default function useMediaRecorder({ onChunkReady, timeslice = 3000 } = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState(null);
  const [chunkCount, setChunkCount] = useState(0);

  const recorderRef = useRef(null);
  const chunkIndexRef = useRef(0);
  const onChunkReadyRef = useRef(onChunkReady);
  const isCleanedUpRef = useRef(false);

  useEffect(() => {
    onChunkReadyRef.current = onChunkReady;
  }, [onChunkReady]);

  useEffect(() => {
    return () => {
      isCleanedUpRef.current = true;
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        try {
          recorderRef.current.stop();
        } catch (_) {
          /* already stopped */
        }
      }
      recorderRef.current = null;
    };
  }, []);

  const startRecording = useCallback(
    (stream) => {
      if (!stream) {
        setError('No media stream provided');
        return;
      }

      if (typeof MediaRecorder === 'undefined') {
        setError('MediaRecorder API is not supported in this browser');
        return;
      }

      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        try {
          recorderRef.current.stop();
        } catch (_) {
          /* ignore */
        }
      }

      setError(null);
      chunkIndexRef.current = 0;
      setChunkCount(0);

      const mimeType = getSupportedMimeType();

      const options = {};
      if (mimeType) {
        options.mimeType = mimeType;
      }
      options.videoBitsPerSecond = 1500000;
      options.audioBitsPerSecond = 128000;

      let recorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (err) {
        try {
          recorder = new MediaRecorder(stream);
        } catch (fallbackErr) {
          setError(`Failed to create MediaRecorder: ${fallbackErr.message}`);
          return;
        }
      }

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0 && !isCleanedUpRef.current) {
          const currentIndex = chunkIndexRef.current;
          chunkIndexRef.current += 1;
          setChunkCount((prev) => prev + 1);

          if (onChunkReadyRef.current) {
            try {
              onChunkReadyRef.current(event.data, currentIndex);
            } catch (cbError) {
              console.error('[useMediaRecorder] onChunkReady callback error:', cbError);
            }
          }
        }
      };

      recorder.onerror = (event) => {
        const errorMessage =
          event.error?.message || event.error?.name || 'Unknown recording error';
        console.error('[useMediaRecorder] Recording error:', errorMessage);

        if (!isCleanedUpRef.current) {
          setError(errorMessage);
          setIsRecording(false);
          setIsPaused(false);
        }
      };

      recorder.onstop = () => {
        if (!isCleanedUpRef.current) {
          setIsRecording(false);
          setIsPaused(false);
        }
      };

      recorder.onpause = () => {
        if (!isCleanedUpRef.current) {
          setIsPaused(true);
        }
      };

      recorder.onresume = () => {
        if (!isCleanedUpRef.current) {
          setIsPaused(false);
        }
      };

      recorderRef.current = recorder;

      try {
        recorder.start(timeslice);
        setIsRecording(true);
        setIsPaused(false);
      } catch (startError) {
        setError(`Failed to start recording: ${startError.message}`);
        recorderRef.current = null;
      }
    },
    [timeslice]
  );

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder) return;

    if (recorder.state === 'inactive') {
      setIsRecording(false);
      setIsPaused(false);
      return;
    }

    try {
      recorder.stop();
    } catch (err) {
      console.error('[useMediaRecorder] Error stopping recorder:', err);
      setIsRecording(false);
      setIsPaused(false);
    }
  }, []);

  const pauseRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== 'recording') return;

    try {
      recorder.pause();
    } catch (err) {
      console.error('[useMediaRecorder] Error pausing recorder:', err);
    }
  }, []);

  const resumeRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== 'paused') return;

    try {
      recorder.resume();
    } catch (err) {
      console.error('[useMediaRecorder] Error resuming recorder:', err);
    }
  }, []);

  return {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    isRecording,
    isPaused,
    error,
    chunkCount,
  };
}
