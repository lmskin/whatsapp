const axios = require('axios');
const whatsappService = require('./whatsappService');
const orderService = require('./orderService');
const messageService = require('./messageService');
const mcpSessionService = require('./mcpSessionService');
const mcpConfig = require('../config/mcp');

// Initialize MCP configuration from config file
const MCP_CONFIG = {
  endpoint: mcpConfig.endpoint,
  apiKey: mcpConfig.apiKey,
  defaultLanguage: mcpConfig.defaultLanguage
};

/**
 * Process incoming WhatsApp messages through MCP server
 * @param {string} phone - User's WhatsApp phone number
 * @param {string} message - The message content
 * @returns {Promise<string>} - The processed response
 */
exports.processMessage = async (phone, message) => {
  try {
    // Get existing session data
    const sessionData = await mcpSessionService.getSession(phone);
    
    // Send message to MCP server for processing
    const mcpResponse = await axios.post(`${MCP_CONFIG.endpoint}/process`, {
      text: message,
      userId: phone,
      language: MCP_CONFIG.defaultLanguage,
      context: {
        platform: 'whatsapp',
        sessionData
      }
    }, {
      headers: {
        'Authorization': `Bearer ${MCP_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Update session with new data if provided
    if (mcpResponse.data && mcpResponse.data.sessionData) {
      await mcpSessionService.updateSession(phone, mcpResponse.data.sessionData);
    }

    if (mcpResponse.data && mcpResponse.data.intent) {
      // Handle different intents from MCP
      const { intent, entities } = mcpResponse.data;
      
      switch (intent) {
        case 'check_order_status':
          return await handleOrderStatusIntent(phone, entities);
        
        case 'create_order':
          return await handleCreateOrderIntent(phone, entities);
          
        case 'greeting':
          return "Hello! How can I assist you today?";
          
        case 'thanks':
          return "You're welcome! Is there anything else I can help with?";
          
        case 'general_inquiry':
          return mcpResponse.data.response || 'How can I help you today?';
          
        default:
          return mcpResponse.data.response || 'I\'m not sure how to help with that.';
      }
    }
    
    return mcpResponse.data.response || 'I didn\'t understand that. Can you please try again?';
  } catch (error) {
    console.error('Error in MCP processing:', error);
    return 'Sorry, I\'m having trouble understanding right now. Please try again later.';
  }
};

/**
 * Handle order status intent
 * @param {string} phone 
 * @param {Object} entities 
 */
async function handleOrderStatusIntent(phone, entities) {
  const orderNumber = entities?.orderNumber || null;
  
  if (!orderNumber) {
    return 'Please provide your order number so I can check the status.';
  }
  
  const order = await orderService.getOrderByNumber(orderNumber);
  
  if (order) {
    return `Your order #${orderNumber} is currently ${order.status}.`;
  } else {
    return `Sorry, I couldn't find order #${orderNumber}. Please verify the number and try again.`;
  }
}

/**
 * Handle create order intent
 * @param {string} phone 
 * @param {Object} entities 
 */
async function handleCreateOrderIntent(phone, entities) {
  // Implementation would depend on your order creation logic
  // This is a simplified version
  
  try {
    // Create a new order with basic information
    const newOrder = await orderService.createOrder({
      customer_phone: phone,
      items: entities?.items || [],
      status: 'pending'
    });
    
    return `Great! I've created order #${newOrder.order_number} for you. You'll receive updates on its status.`;
  } catch (error) {
    console.error('Error creating order:', error);
    return 'Sorry, I couldn\'t create your order at this time. Please try again later.';
  }
}

/**
 * Train MCP server with new examples
 * @param {Array} examples - Training examples
 */
exports.trainMcpServer = async (examples) => {
  try {
    const response = await axios.post(`${MCP_CONFIG.endpoint}/train`, {
      examples,
      language: MCP_CONFIG.defaultLanguage
    }, {
      headers: {
        'Authorization': `Bearer ${MCP_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Log the training result
    await mcpSessionService.logTraining(examples, true, response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error training MCP server:', error);
    
    // Log the failed training
    await mcpSessionService.logTraining(examples, false, { error: error.message });
    
    throw error;
  }
};

/**
 * Initialize MCP server with default examples
 */
exports.initializeWithDefaultExamples = async () => {
  try {
    if (mcpConfig.defaultExamples && mcpConfig.defaultExamples.length > 0) {
      console.log('Initializing MCP server with default examples...');
      await this.trainMcpServer(mcpConfig.defaultExamples);
      console.log('MCP server initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing MCP server:', error);
  }
}; 