/**
 * WebSocket Service (Socket.IO)
 * ─────────────────────────────────────────────────────────────────────────────
 * Singleton wrapper around Socket.IO.
 *
 * Rooms:
 *   - `user:<userId>`   → private channel for each connected user
 *   - `admins`          → shared channel for all Admin-role connections
 *
 * Authentication:
 *   Clients must pass their JWT in the Socket.IO auth object:
 *     { auth: { token: "Bearer <jwt>" } }
 *   The handshake middleware verifies the token before accepting any connection.
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

/** @type {import('socket.io').Server | null} */
let io = null;

/**
 * Initialize the Socket.IO server and attach it to the http server.
 * Should be called once from server.js after the http server is created.
 *
 * @param {import('http').Server} httpServer
 */
const initWebSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // ── JWT Authentication Middleware on the Handshake ─────────────────────────
  io.use((socket, next) => {
    try {
      const raw = socket.handshake.auth?.token || '';
      const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;

      if (!token) {
        return next(new Error('Authentication error: no token'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, role, ... }
      next();
    } catch (err) {
      next(new Error('Authentication error: invalid token'));
    }
  });

  // ── Connection Handler ─────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const { id: userId, role } = socket.user;

    // Every user joins their own private room
    socket.join(`user:${userId}`);

    // Admins also join the shared admins broadcast room
    if (role === 'Admin') {
      socket.join('admins');
    }

    console.log(`🔗 WS connected: userId=${userId} role=${role} socketId=${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`🔌 WS disconnected: socketId=${socket.id}`);
    });
  });

  console.log('✅ Socket.IO initialized');
  return io;
};

/**
 * Emit an event to a specific user's private room.
 *
 * @param {string}  userId   - MongoDB user _id
 * @param {string}  event    - Event name
 * @param {object}  data     - Payload
 */
const emitToUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

/**
 * Emit an event to all connected Admin sockets.
 *
 * @param {string}  event    - Event name
 * @param {object}  data     - Payload
 */
const emitToAdmins = (event, data) => {
  if (!io) return;
  io.to('admins').emit(event, data);
};

module.exports = { initWebSocket, emitToUser, emitToAdmins };
