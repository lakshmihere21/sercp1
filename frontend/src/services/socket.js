import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const initSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => console.log('🔌 Socket connected:', socket.id));
  socket.on('disconnect', (reason) => console.log('⚡ Socket disconnected:', reason));
  socket.on('connect_error', (err) => console.error('Socket error:', err.message));

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinAlertRoom = (alertId) => {
  socket?.emit('JOIN_ALERT_ROOM', { alertId });
};

export const leaveAlertRoom = (alertId) => {
  socket?.emit('LEAVE_ALERT_ROOM', { alertId });
};

export const emitLocationUpdate = (data) => {
  socket?.emit('LOCATION_UPDATE', data);
};

export const emitSendMessage = (data) => {
  socket?.emit('SEND_MESSAGE', data);
};

export const emitTyping = (alertId, isTyping) => {
  socket?.emit('TYPING', { alertId, isTyping });
};

export const emitStatusUpdate = (alertId, status, description) => {
  socket?.emit('STATUS_UPDATE', { alertId, status, description });
};

export const emitResponderStatus = (availability) => {
  socket?.emit('RESPONDER_STATUS', { availability });
};

export default { initSocket, getSocket, disconnectSocket, joinAlertRoom, leaveAlertRoom, emitLocationUpdate, emitSendMessage, emitTyping, emitStatusUpdate, emitResponderStatus };
