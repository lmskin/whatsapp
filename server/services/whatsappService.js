const axios = require('axios');

// Send a message via WhatsApp Cloud API
exports.sendMessage = async (to, message) => {
  try {
    const url = `https://graph.facebook.com/${process.env.WA_API_VERSION}/${process.env.WA_PHONE_NUMBER_ID}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'text',
      text: {
        preview_url: false,
        body: message
      }
    };
    
    const headers = {
      'Authorization': `Bearer ${process.env.WA_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    };
    
    const response = await axios.post(url, payload, { headers });
    
    return response.data;
  } catch (error) {
    console.error('Error in WhatsApp sendMessage service:', error.response?.data || error.message);
    throw error;
  }
};

// Send a template message via WhatsApp Cloud API
exports.sendTemplateMessage = async (to, templateName, templateLanguage, components = []) => {
  try {
    const url = `https://graph.facebook.com/${process.env.WA_API_VERSION}/${process.env.WA_PHONE_NUMBER_ID}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: templateLanguage || 'en_US'
        },
        components: components
      }
    };
    
    const headers = {
      'Authorization': `Bearer ${process.env.WA_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    };
    
    const response = await axios.post(url, payload, { headers });
    
    return response.data;
  } catch (error) {
    console.error('Error in WhatsApp sendTemplateMessage service:', error.response?.data || error.message);
    throw error;
  }
};

// Send an interactive message (buttons or list) via WhatsApp Cloud API
exports.sendInteractiveMessage = async (to, bodyText, interactiveData) => {
  try {
    const url = `https://graph.facebook.com/${process.env.WA_API_VERSION}/${process.env.WA_PHONE_NUMBER_ID}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'interactive',
      interactive: {
        type: interactiveData.type,
        body: {
          text: bodyText
        },
        ...interactiveData
      }
    };
    
    const headers = {
      'Authorization': `Bearer ${process.env.WA_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    };
    
    const response = await axios.post(url, payload, { headers });
    
    return response.data;
  } catch (error) {
    console.error('Error in WhatsApp sendInteractiveMessage service:', error.response?.data || error.message);
    throw error;
  }
};

// Mark a message as read
exports.markMessageAsRead = async (messageId) => {
  try {
    const url = `https://graph.facebook.com/${process.env.WA_API_VERSION}/${process.env.WA_PHONE_NUMBER_ID}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId
    };
    
    const headers = {
      'Authorization': `Bearer ${process.env.WA_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    };
    
    const response = await axios.post(url, payload, { headers });
    
    return response.data;
  } catch (error) {
    console.error('Error in WhatsApp markMessageAsRead service:', error.response?.data || error.message);
    throw error;
  }
};

// Get WhatsApp user info
exports.getUserInfo = async (userId) => {
  try {
    const url = `https://graph.facebook.com/${process.env.WA_API_VERSION}/${userId}`;
    
    const headers = {
      'Authorization': `Bearer ${process.env.WA_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    };
    
    const response = await axios.get(url, { headers });
    
    return response.data;
  } catch (error) {
    console.error('Error in WhatsApp getUserInfo service:', error.response?.data || error.message);
    throw error;
  }
}; 