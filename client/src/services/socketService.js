import { io } from 'socket.io-client';

// Define the socket endpoint
const SOCKET_ENDPOINT = process.env.REACT_APP_API_URL || 'http://localhost:3001';
console.log('Socket endpoint configured as:', SOCKET_ENDPOINT);

// Create a socket instance
let socket;
let isInitialized = false;

// Initialize the socket connection
export const initSocket = () => {
  if (isInitialized && socket) {
    console.log('Socket already initialized, reusing existing socket');
    return socket;
  }
  
  console.log('Initializing socket connection to:', SOCKET_ENDPOINT);
  
  socket = io(SOCKET_ENDPOINT, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    timeout: 20000,
    autoConnect: true,
    forceNew: false
  });

  socket.on('connect', () => {
    console.log('Socket connected successfully with ID:', socket.id);
    isInitialized = true;
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    console.log('Attempting to reconnect...');
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected. Reason:', reason);
    isInitialized = false;
    
    // Automatically attempt to reconnect after a timeout
    if (reason === 'io server disconnect') {
      // If the server disconnected us, we need to manually reconnect
      setTimeout(() => {
        console.log('Attempting manual reconnection after server disconnect');
        socket.connect();
      }, 3000);
    }
  });
  
  // Listen for reconnection attempts
  socket.io.on('reconnect_attempt', (attempt) => {
    console.log(`Socket reconnection attempt #${attempt}`);
  });
  
  socket.io.on('reconnect', (attempt) => {
    console.log(`Socket reconnected after ${attempt} attempts`);
    isInitialized = true;
  });
  
  socket.io.on('reconnect_error', (error) => {
    console.error('Socket reconnection error:', error);
  });
  
  socket.io.on('reconnect_failed', () => {
    console.error('Socket failed to reconnect after all attempts');
    isInitialized = false;
  });

  return socket;
};

// Get the socket instance
export const getSocket = () => {
  if (!socket || !isInitialized) {
    return initSocket();
  }
  return socket;
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    console.log('Manually disconnecting socket');
    socket.disconnect();
    isInitialized = false;
  }
};

// Subscribe to new messages
export const subscribeToNewMessages = (callback) => {
  console.log('Subscribing to new-message events');
  
  const currentSocket = getSocket();
  
  // Remove any existing listener to prevent duplicates
  currentSocket.off('new-message');
  
  // Add new listener
  currentSocket.on('new-message', (message) => {
    console.log('Received new-message event:', message);
    callback(message);
  });
};

// Subscribe to message status updates
export const subscribeToStatusUpdates = (callback) => {
  console.log('Subscribing to message-status-update events');
  
  const currentSocket = getSocket();
  
  // Remove any existing listener to prevent duplicates
  currentSocket.off('message-status-update');
  
  // Add new listener
  currentSocket.on('message-status-update', (statusUpdate) => {
    console.log('Received message-status-update event:', statusUpdate);
    callback(statusUpdate);
  });
}; 