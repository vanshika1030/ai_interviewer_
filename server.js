const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    path: '/api/socketio',
  });

  // Store active sessions for proctoring
  const activeSessions = new Map();

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join interview session room
    socket.on('join-session', ({ sessionId, role }) => {
      socket.join(`session:${sessionId}`);
      activeSessions.set(socket.id, { sessionId, role });
      console.log(`[Socket.IO] ${role} joined session: ${sessionId}`);

      // Notify room about new participant
      io.to(`session:${sessionId}`).emit('participant-joined', {
        socketId: socket.id,
        role,
        timestamp: new Date().toISOString(),
      });
    });

    // Proctoring events from candidate
    socket.on('proctoring-event', (data) => {
      const session = activeSessions.get(socket.id);
      if (session) {
        // Broadcast to recruiters watching this session
        io.to(`session:${session.sessionId}`).emit('proctoring-alert', {
          ...data,
          socketId: socket.id,
          timestamp: new Date().toISOString(),
        });
        console.log(`[Proctoring] ${data.type} in session ${session.sessionId}`);
      }
    });

    // Interview state updates
    socket.on('interview-state', (data) => {
      const session = activeSessions.get(socket.id);
      if (session) {
        io.to(`session:${session.sessionId}`).emit('state-update', {
          ...data,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Heartbeat for connection monitoring
    socket.on('heartbeat', (data) => {
      const session = activeSessions.get(socket.id);
      if (session) {
        socket.emit('heartbeat-ack', {
          serverTime: new Date().toISOString(),
        });
      }
    });

    socket.on('disconnect', (reason) => {
      const session = activeSessions.get(socket.id);
      if (session) {
        io.to(`session:${session.sessionId}`).emit('participant-left', {
          socketId: socket.id,
          role: session.role,
          reason,
          timestamp: new Date().toISOString(),
        });
        activeSessions.delete(socket.id);
      }
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  // Make io accessible to API routes via global
  global.io = io;

  server.listen(port, () => {
    console.log(`
    ╔══════════════════════════════════════════════╗
    ║   AI Video Interview System                  ║
    ║   Ready on http://${hostname}:${port}              ║
    ║   Mode: ${dev ? 'Development' : 'Production'}                       ║
    ╚══════════════════════════════════════════════╝
    `);
  });
});
