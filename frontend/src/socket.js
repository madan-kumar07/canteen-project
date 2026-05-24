import { io } from 'socket.io-client';

const SOCKET_URL = `http://${window.location.hostname}:5000`;

// Single shared socket instance for the whole app
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 5000,
});

socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
});
socket.on('disconnect', (reason) => {
  console.log('❌ Socket disconnected:', reason);
});
socket.on('connect_error', (err) => {
  console.warn('Socket error (will retry):', err.message);
});

export default socket;
