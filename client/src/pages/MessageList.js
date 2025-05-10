import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { initSocket, subscribeToNewMessages, disconnectSocket, getSocket } from '../services/socketService';

const MessageList = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socketStatus, setSocketStatus] = useState('Disconnected');

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        const res = await axios.get('/api/messages');
        console.log('Initial messages loaded:', res.data?.length || 0);
        setMessages(res.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setLoading(false);
      }
    };

    fetchMessages();

    // Initialize socket connection and subscribe to new messages
    const socket = initSocket();
    setSocketStatus('Connecting...');
    
    socket.on('connect', () => {
      console.log('Socket connected with ID:', socket.id);
      setSocketStatus('Connected');
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setSocketStatus('Error: ' + error.message);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected. Reason:', reason);
      setSocketStatus('Disconnected: ' + reason);
    });
    
    // Test event handler
    socket.on('test-event', (data) => {
      console.log('Received test event:', data);
    });
    
    subscribeToNewMessages((newMessage) => {
      console.log('New message received via socket:', newMessage);
      setMessages((prevMessages) => {
        // Check if message already exists
        const exists = prevMessages.some(msg => msg.id === newMessage.id);
        if (exists) {
          console.log('Message already exists, not adding duplicate');
          return prevMessages;
        }
        // Add new message to the top of the list
        console.log('Adding new message to list');
        return [newMessage, ...prevMessages];
      });
    });

    // Cleanup function to disconnect socket
    return () => {
      console.log('MessageList component unmounting, disconnecting socket');
      disconnectSocket();
    };
  }, []);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Function to manually test socket connection
  const testSocketConnection = () => {
    const socket = getSocket();
    if (socket && socket.connected) {
      console.log('Manually testing socket - fetching test message');
      fetch('/test-socket')
        .then(response => response.text())
        .then(data => console.log('Test response:', data))
        .catch(error => console.error('Error testing socket:', error));
    } else {
      console.error('Socket not connected');
      setSocketStatus('Not connected');
    }
  };

  if (loading) {
    return <div className="message-list">Loading messages...</div>;
  }

  return (
    <div className="message-list">
      <h1>Message History</h1>
      <div className="socket-status">
        Socket Status: {socketStatus}
        <button onClick={testSocketConnection} className="test-socket-btn">
          Test Socket
        </button>
      </div>
      
      {messages.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        messages.map(message => (
          <div 
            key={message.id} 
            className={`message ${message.is_outgoing ? 'outgoing' : ''}`}
          >
            <div className="message-header">
              <span className="message-sender">
                {message.is_outgoing ? 'You' : message.wa_user_id}
              </span>
              <span className="message-time">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
            <div className="message-content">{message.content}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default MessageList; 