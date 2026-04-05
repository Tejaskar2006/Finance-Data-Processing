/**
 * useSocket — React hook for Socket.IO
 * ─────────────────────────────────────────────────────────────────────────────
 * Connects the singleton socket when a token is available and cleans it up
 * when the component unmounts or the token is cleared.
 *
 * Usage (in a page/component):
 *   const socket = useSocket(token);
 *   useEffect(() => {
 *     if (!socket) return;
 *     socket.on('some_event', handler);
 *     return () => { socket.off('some_event', handler); };
 *   }, [socket]);
 */
import { useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import { getSocket } from '../services/socket';

export const useSocket = (token: string | null): Socket | null => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const s = getSocket(token);
    socketRef.current = s;

    return () => {
      // Individual hook instances do NOT disconnect the singleton —
      // that is only done explicitly on logout via disconnectSocket().
    };
  }, [token]);

  return token ? socketRef.current : null;
};
