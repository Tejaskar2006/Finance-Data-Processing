/**
 * useSocket — React hook for Socket.IO
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns the singleton socket instance and triggers a re-render once the
 * socket object exists (so dependent effects actually fire).
 *
 * Key fix: uses useState instead of useRef so consumers re-render when the
 * socket becomes available, making socket-dependent useEffects work correctly.
 *
 * Usage (in a page/component):
 *   const socket = useSocket(token);
 *   useEffect(() => {
 *     if (!socket) return;
 *     socket.on('some_event', handler);
 *     return () => { socket.off('some_event', handler); };
 *   }, [socket]);
 */
import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { getSocket } from '../services/socket';

export const useSocket = (token: string | null): Socket | null => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      return;
    }

    const s = getSocket(token);
    setSocket(s);

    // Individual hook instances do NOT disconnect the singleton.
    // The socket lifecycle (disconnect on logout) is managed by AuthContext.
  }, [token]);

  return socket;
};
