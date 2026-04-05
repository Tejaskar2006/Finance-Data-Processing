/**
 * Socket.IO Client — Singleton
 * ─────────────────────────────────────────────────────────────────────────────
 * Maintains a single socket connection across the entire app lifetime.
 * The JWT is passed in the `auth` object on connect so the server can
 * verify it on the handshake before accepting the connection.
 *
 * Usage:
 *   import { getSocket, disconnectSocket } from './socket';
 *   const socket = getSocket(token);
 */
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Returns the existing socket or creates a new one with the given token.
 * If the token changes (e.g. after login), call disconnectSocket() first.
 */
export const getSocket = (token: string): Socket => {
  if (!socket || !socket.connected) {
    socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
      autoConnect: true,
    });
  }
  return socket;
};

/**
 * Disconnects and destroys the current socket instance.
 * Should be called on logout.
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
