/**
 * Socket.IO Client — Singleton
 * ─────────────────────────────────────────────────────────────────────────────
 * One socket instance for the entire app lifetime.
 * The JWT is passed in the `auth` block on connect so the server can verify
 * it on the handshake before accepting the connection.
 *
 * Lifecycle:
 *   - getSocket(token)    → creates+connects once; returns the same instance
 *                           on subsequent calls regardless of connection state.
 *   - disconnectSocket()  → disconnects and nullifies; must be called on logout
 *                           so the next login gets a fresh authenticated socket.
 */
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const SOCKET_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace('/api', '') ||
  'http://localhost:5000';

/**
 * Returns the singleton socket, creating it if it doesn't exist yet.
 * Never recreates a live socket — only creates when `socket === null`
 * (i.e. after initial load or after an explicit disconnectSocket() call).
 */
export const getSocket = (token: string): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
  }
  return socket;
};

/**
 * Disconnects and destroys the current socket instance.
 * MUST be called on logout so the next login gets a fresh socket with the
 * new user's JWT in the auth handshake.
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
