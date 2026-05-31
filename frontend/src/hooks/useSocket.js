import { useEffect, useCallback } from 'react';
import { getSocket } from '../services/socket';

// Generic hook to listen to one or more socket events
export const useSocket = (events = {}) => {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handlers = Object.entries(events);
    handlers.forEach(([event, handler]) => socket.on(event, handler));

    return () => {
      handlers.forEach(([event, handler]) => socket.off(event, handler));
    };
  }, []);
};

// Hook to emit a socket event
export const useSocketEmit = () => {
  const emit = useCallback((event, data) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit(event, data);
      return true;
    }
    return false;
  }, []);
  return emit;
};

// Hook to join/leave a room
export const useSocketRoom = (roomName) => {
  useEffect(() => {
    if (!roomName) return;
    const socket = getSocket();
    if (!socket) return;
    socket.emit('JOIN_ALERT_ROOM', { alertId: roomName });
    return () => socket.emit('LEAVE_ALERT_ROOM', { alertId: roomName });
  }, [roomName]);
};

export default useSocket;
