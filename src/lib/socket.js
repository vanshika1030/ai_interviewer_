'use client';

import { io } from 'socket.io-client';

let socket = null;
let reconnectAttempt = 0;
const MAX_RECONNECT_DELAY = 30000;
const BASE_RECONNECT_DELAY = 1000;

export function getSocket() {
  if (socket && socket.connected) {
    return socket;
  }

  if (socket) {
    return socket;
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  socket = io(origin, {
    path: '/api/socketio',
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: BASE_RECONNECT_DELAY,
    reconnectionDelayMax: MAX_RECONNECT_DELAY,
    randomizationFactor: 0.5,
    timeout: 20000,
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
    reconnectAttempt = 0;
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);

    if (reason === 'io server disconnect') {
      setTimeout(() => {
        socket.connect();
      }, BASE_RECONNECT_DELAY);
    }
  });

  socket.on('reconnect_attempt', (attempt) => {
    reconnectAttempt = attempt;
    const delay = Math.min(BASE_RECONNECT_DELAY * Math.pow(2, attempt - 1), MAX_RECONNECT_DELAY);
    console.log(`🔄 Reconnect attempt ${attempt}, next delay: ${delay}ms`);
  });

  socket.on('reconnect', (attempt) => {
    console.log(`✅ Reconnected after ${attempt} attempt(s)`);
    reconnectAttempt = 0;
  });

  socket.on('reconnect_failed', () => {
    console.error('❌ Reconnection failed after max attempts');
  });

  socket.on('connect_error', (error) => {
    console.error('🔌 Connection error:', error.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    reconnectAttempt = 0;
    console.log('🔌 Socket disconnected and cleaned up');
  }
}
