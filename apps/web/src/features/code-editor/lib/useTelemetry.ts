import { useState, useRef, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { TelemetryMetrics, TelemetrySocketPayload } from '../model/telemetry.types';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function useTelemetry(userId: string, taskId: string) {
  const [metrics, setMetrics] = useState<TelemetryMetrics>({
    wpm: 0,
    lastPauseMs: 0,
    deleteCount: 0,
    pasteEvents: 0,
    totalKeystrokes: 0,
  });

  const socketRef = useRef<Socket | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const lastKeyTimeRef = useRef<number>(Date.now());
  const startTimeRef = useRef<number>(Date.now());
  const keystrokeCountRef = useRef<number>(0);
  const deleteCountRef = useRef<number>(0);
  const pasteEventsRef = useRef<number>(0);

  // Initialize Socket.io connection to /telemetry namespace
  useEffect(() => {
    if (!userId || !taskId) return;

    const socket = io(`${SOCKET_URL}/telemetry`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_session', { userId, taskId });
    });

    socket.on('session_joined', (data: { sessionId: string }) => {
      sessionIdRef.current = data.sessionId;
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, taskId]);

  // Handle keypress & telemetry tracking
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent | KeyboardEvent) => {
      const now = Date.now();
      const pauseDuration = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      keystrokeCountRef.current += 1;

      if (e.key === 'Backspace' || e.key === 'Delete') {
        deleteCountRef.current += 1;
      }

      // Calculate WPM: (characters / 5) / elapsed minutes
      const elapsedMinutes = (now - startTimeRef.current) / 60000;
      const calculatedWpm =
        elapsedMinutes > 0 ? Math.round(keystrokeCountRef.current / 5 / elapsedMinutes) : 0;

      const currentMetrics: TelemetryMetrics = {
        wpm: Math.min(250, calculatedWpm),
        lastPauseMs: pauseDuration < 30000 ? pauseDuration : 0,
        deleteCount: deleteCountRef.current,
        pasteEvents: pasteEventsRef.current,
        totalKeystrokes: keystrokeCountRef.current,
      };

      setMetrics(currentMetrics);

      // Emit telemetry snapshot to server via WebSocket
      if (socketRef.current && socketRef.current.connected) {
        const payload: TelemetrySocketPayload = {
          sessionId: sessionIdRef.current || undefined,
          userId,
          taskId,
          keystrokePauseMs: currentMetrics.lastPauseMs,
          wpm: currentMetrics.wpm,
          deleteCount: currentMetrics.deleteCount,
          pasteEvents: currentMetrics.pasteEvents,
        };

        socketRef.current.emit('telemetry_data', payload);
      }
    },
    [userId, taskId],
  );

  const handlePaste = useCallback(() => {
    pasteEventsRef.current += 1;
    setMetrics((prev) => ({ ...prev, pasteEvents: pasteEventsRef.current }));
  }, []);

  return {
    metrics,
    handleKeyDown,
    handlePaste,
  };
}
