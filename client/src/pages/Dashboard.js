import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { subscribeToNewMessages, initSocket, disconnectSocket } from '../services/socketService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const knownUsers = useRef(new Set());
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch stats from the dedicated endpoint
        const statsResponse = await axios.get('/api/stats');
        const statsData = statsResponse.data || { totalMessages: 0, totalUsers: 0 };
        
        setStats(statsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to counting messages manually if stats endpoint fails
        try {
          const messagesResponse = await axios.get('/api/messages');
          const messagesData = messagesResponse.data || [];
          
          // Count unique users
          messagesData.forEach(message => {
            if (message.wa_user_id) {
              knownUsers.current.add(message.wa_user_id);
            }
          });
          
          setStats({
            totalMessages: messagesData.length || 0,
            totalUsers: knownUsers.current.size || 0
          });
        } catch (err) {
          console.error('Fallback fetch failed too:', err);
        }
        setLoading(false);
      }
    };

    fetchStats();

    // Initialize socket for real-time updates
    initSocket();
    
    // Listen for new messages to update stats in real-time
    subscribeToNewMessages((newMessage) => {
      setStats(prevStats => {
        let isNewUser = false;
        
        if (newMessage.wa_user_id && !knownUsers.current.has(newMessage.wa_user_id)) {
          knownUsers.current.add(newMessage.wa_user_id);
          isNewUser = true;
        }
        
        return {
          totalMessages: prevStats.totalMessages + 1,
          totalUsers: isNewUser ? prevStats.totalUsers + 1 : prevStats.totalUsers
        };
      });
    });

    // Cleanup
    return () => {
      disconnectSocket();
    };
  }, []);

  if (loading) {
    return <div className="dashboard">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>Welcome to the WhatsApp Integration Dashboard</p>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Messages</h3>
          <p className="stat-number">{stats.totalMessages}</p>
        </div>
        
        <div className="stat-card">
          <h3>Unique Users</h3>
          <p className="stat-number">{stats.totalUsers}</p>
        </div>
      </div>
      
      <div className="dashboard-actions">
        <a href="/messages" className="btn btn-primary">View Messages</a>
        <a href="/send" className="btn btn-dark">Send New Message</a>
      </div>
    </div>
  );
};

export default Dashboard; 