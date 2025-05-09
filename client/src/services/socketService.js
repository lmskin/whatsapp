import { io } from 'socket.io-client';

// Define the socket endpoint
const SOCKET_ENDPOINT = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create a socket instance
let socket;

// Initialize the socket connection
export const initSocket = () => {
  socket = io(SOCKET_ENDPOINT, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
};

// Get the socket instance
export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

// Subscribe to new messages
export const subscribeToNewMessages = (callback) => {
  if (!socket) {
    initSocket();
  }
  
  socket.on('new-message', (message) => {
    callback(message);
  });
};

// Subscribe to message status updates
export const subscribeToStatusUpdates = (callback) => {
  if (!socket) {
    initSocket();
  }
  
  socket.on('message-status-update', (statusUpdate) => {
    callback(statusUpdate);
  });
}; 