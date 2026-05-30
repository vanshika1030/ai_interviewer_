'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket, disconnectSocket } from '@/lib/socket';

export default function useSocket(sessionId) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const heartbeatRef = useRef(null);
  const listenersRef = useRef(new Map());
  const sessionIdRef = useRef(sessionId);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Connect and join session
  useEffect(() => {
    if (!sessionId) return;

    const socket = getSocket();
    const listeners = listenersRef.current;
    socketRef.current = socket;

    const handleConnect = () => {
      setIsConnected(true);

      // Join the session room
      socket.emit('join-session', {
        sessionId: sessionIdRef.current,
        role: 'candidate',
      });

      // Start heartbeat
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      heartbeatRef.current = setInterval(() => {
        if (socket.connected) {
          socket.emit('heartbeat', {
            sessionId: sessionIdRef.current,
            timestamp: new Date().toISOString(),
          });
        }
      }, 10000);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };

    const handleReconnect = () => {
      setIsConnected(true);
      // Rejoin session room after reconnection
      socket.emit('join-session', {
        sessionId: sessionIdRef.current,
        role: 'candidate',
      });
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect);

    // If socket is already connected
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect', handleReconnect);

      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }

      // Clean up all custom listeners
      listeners.forEach((handler, event) => {
        socket.off(event, handler);
      });
      listeners.clear();

      disconnectSocket();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [sessionId]);

  const emit = useCallback((event, data) => {
    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit(event, data);
    } else {
      console.warn(`[useSocket] Cannot emit "${event}" - socket not connected`);
    }
  }, []);

  const on = useCallback((event, handler) => {
    const socket = socketRef.current;
    if (!socket) return;

    // Remove previous handler for this event if exists
    const prevHandler = listenersRef.current.get(event);
    if (prevHandler) {
      socket.off(event, prevHandler);
    }

    socket.on(event, handler);
    listenersRef.current.set(event, handler);
  }, []);

  const off = useCallback((event, handler) => {
    const socket = socketRef.current;
    if (!socket) return;

    if (handler) {
      socket.off(event, handler);
    } else {
      const storedHandler = listenersRef.current.get(event);
      if (storedHandler) {
        socket.off(event, storedHandler);
      }
    }
    listenersRef.current.delete(event);
  }, []);

  const emitProctoringEvent = useCallback(
    (data) => {
      emit('proctoring-event', {
        sessionId: sessionIdRef.current,
        ...data,
      });
    },
    [emit]
  );

  const emitInterviewState = useCallback(
    (data) => {
      emit('interview-state', {
        sessionId: sessionIdRef.current,
        ...data,
      });
    },
    [emit]
  );

  const emitHeartbeat = useCallback(() => {
    emit('heartbeat', {
      sessionId: sessionIdRef.current,
      timestamp: new Date().toISOString(),
    });
  }, [emit]);

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off,
    emitProctoringEvent,
    emitInterviewState,
    emitHeartbeat,
  };
}
