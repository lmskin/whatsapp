import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MessageList = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get('/api/messages');
        setMessages(res.data.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return <div className="message-list">Loading messages...</div>;
  }

  return (
    <div className="message-list">
      <h1>Message History</h1>
      
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