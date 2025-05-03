import React, { useState } from 'react';
import axios from 'axios';

const SendMessage = () => {
  const [formData, setFormData] = useState({
    to: '',
    message: ''
  });
  
  const [status, setStatus] = useState({
    submitting: false,
    success: null,
    error: null
  });

  const { to, message } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    // Validate phone number
    if (!to.match(/^\d+$/)) {
      setStatus({
        submitting: false,
        success: null,
        error: 'Please enter a valid phone number (numbers only)'
      });
      return;
    }
    
    // Validate message content
    if (!message) {
      setStatus({
        submitting: false, 
        success: null,
        error: 'Message cannot be empty'
      });
      return;
    }

    setStatus({ submitting: true, success: null, error: null });

    try {
      const res = await axios.post('/api/send', { to, message });
      
      setStatus({
        submitting: false,
        success: 'Message sent successfully!',
        error: null
      });
      
      // Clear form data after successful submission
      setFormData({
        to: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending message:', error);
      
      setStatus({
        submitting: false,
        success: null,
        error: error.response?.data?.error || 'Failed to send message. Please try again.'
      });
    }
  };

  return (
    <div className="send-message-container">
      <h1>Send WhatsApp Message</h1>
      
      {status.success && (
        <div className="alert alert-success">
          {status.success}
        </div>
      )}
      
      {status.error && (
        <div className="alert alert-danger">
          {status.error}
        </div>
      )}
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="to">Phone Number (with country code)</label>
          <input
            type="text"
            name="to"
            id="to"
            value={to}
            onChange={onChange}
            placeholder="e.g. 447123456789"
            required
          />
          <small className="form-text">
            Enter the full phone number with country code (no spaces or special characters)
          </small>
        </div>
        
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            name="message"
            id="message"
            value={message}
            onChange={onChange}
            rows="5"
            placeholder="Type your message here..."
            required
          ></textarea>
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={status.submitting}
        >
          {status.submitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};

export default SendMessage; 