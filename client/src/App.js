import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import pages
import Dashboard from './pages/Dashboard';
import MessageList from './pages/MessageList';
import SendMessage from './pages/SendMessage';

// Import components
import Navbar from './components/Navbar';

// Import socket service
import { initSocket, disconnectSocket } from './services/socketService';

function App() {
  useEffect(() => {
    // Initialize socket connection
    initSocket();
    
    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/messages" element={<MessageList />} />
            <Route path="/send" element={<SendMessage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App; 