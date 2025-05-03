import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In a real app, you would have an API endpoint for stats
        const messages = await axios.get('/api/messages');
        
        // Count unique users
        const uniqueUsers = new Set();
        messages.data.data.forEach(message => {
          uniqueUsers.add(message.wa_user_id);
        });
        
        setStats({
          totalMessages: messages.data.data.length || 0,
          totalUsers: uniqueUsers.size || 0
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchStats();
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