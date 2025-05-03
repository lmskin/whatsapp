import axios from 'axios';

// Create axios instance with base URL and default headers
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Messages API
export const getMessages = async () => {
  try {
    const response = await api.get('/messages');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendMessage = async (messageData) => {
  try {
    const response = await api.post('/send', messageData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api; 