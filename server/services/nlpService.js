const db = require('./dbService');

// Intent categories
const INTENTS = {
  ORDER_STATUS: 'order_status',
  PRODUCT_INQUIRY: 'product_inquiry',
  HELP: 'help',
  GREETING: 'greeting',
  UNKNOWN: 'unknown'
};

// Action types
const ACTIONS = {
  QUERY_ORDER: 'query_order',
  LIST_PRODUCTS: 'list_products',
  SHOW_HELP: 'show_help',
  RESPOND_GREETING: 'respond_greeting',
  DEFAULT_RESPONSE: 'default_response'
};

/**
 * Process natural language message and determine intent
 * @param {string} message - The user's message
 * @returns {Object} Intent and metadata
 */
exports.processMessage = async (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Simple keyword-based intent classification
  if (lowerMessage.includes('order') && (lowerMessage.includes('status') || lowerMessage.includes('track'))) {
    const orderNumber = extractOrderNumber(lowerMessage);
    return {
      intent: INTENTS.ORDER_STATUS,
      confidence: 0.9,
      action: ACTIONS.QUERY_ORDER,
      metadata: { orderNumber }
    };
  }
  
  if (lowerMessage.includes('product') || lowerMessage.includes('item') || lowerMessage.includes('price')) {
    const productName = extractProductName(lowerMessage);
    return {
      intent: INTENTS.PRODUCT_INQUIRY,
      confidence: 0.8,
      action: ACTIONS.LIST_PRODUCTS,
      metadata: { productName }
    };
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('assist')) {
    return {
      intent: INTENTS.HELP,
      confidence: 0.85,
      action: ACTIONS.SHOW_HELP,
      metadata: {}
    };
  }
  
  if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
    return {
      intent: INTENTS.GREETING,
      confidence: 0.95,
      action: ACTIONS.RESPOND_GREETING,
      metadata: {}
    };
  }
  
  return {
    intent: INTENTS.UNKNOWN,
    confidence: 0.4,
    action: ACTIONS.DEFAULT_RESPONSE,
    metadata: {}
  };
};

/**
 * Execute the appropriate action based on the intent
 * @param {Object} intentData - Intent analysis data
 * @returns {string} Response message
 */
exports.executeAction = async (intentData) => {
  switch (intentData.action) {
    case ACTIONS.QUERY_ORDER:
      return await queryOrderStatus(intentData.metadata.orderNumber);
    
    case ACTIONS.LIST_PRODUCTS:
      return await getProductInfo(intentData.metadata.productName);
    
    case ACTIONS.SHOW_HELP:
      return getHelpMessage();
    
    case ACTIONS.RESPOND_GREETING:
      return getGreetingResponse();
    
    case ACTIONS.DEFAULT_RESPONSE:
    default:
      return getDefaultResponse();
  }
};

/**
 * Save the intent detection in the database
 * @param {string} waUserId - WhatsApp user ID
 * @param {Object} intentData - Intent analysis data
 * @param {number} messageId - Message ID in the database
 */
exports.saveIntent = async (waUserId, intentData, messageId) => {
  try {
    await db.query(
      `INSERT INTO user_intents(wa_user_id, intent, confidence, metadata, message_id)
       VALUES($1, $2, $3, $4, $5)`,
      [
        waUserId,
        intentData.intent,
        intentData.confidence,
        JSON.stringify(intentData.metadata),
        messageId
      ]
    );
  } catch (error) {
    console.error('Error saving intent:', error);
    // Non-critical error, so we don't throw
  }
};

// Helper functions
async function queryOrderStatus(orderNumber) {
  if (!orderNumber) {
    return "Please provide an order number so I can check its status.";
  }
  
  try {
    const result = await db.query(
      'SELECT status, created_at FROM orders WHERE order_number = $1',
      [orderNumber]
    );
    
    if (result.rows.length > 0) {
      const order = result.rows[0];
      return `Your order #${orderNumber} is currently ${order.status}. It was placed on ${new Date(order.created_at).toLocaleDateString()}.`;
    } else {
      return `Sorry, I couldn't find order #${orderNumber}. Please verify the order number and try again.`;
    }
  } catch (error) {
    console.error('Error querying order status:', error);
    return "I'm having trouble looking up your order right now. Please try again later.";
  }
}

async function getProductInfo(productName) {
  if (!productName) {
    return "Which product would you like information about?";
  }
  
  try {
    const result = await db.query(
      'SELECT name, price, description FROM products WHERE name ILIKE $1',
      [`%${productName}%`]
    );
    
    if (result.rows.length > 0) {
      const product = result.rows[0];
      return `${product.name}: $${product.price}\n${product.description}`;
    } else {
      return `Sorry, I couldn't find information about "${productName}". Would you like to see our list of available products?`;
    }
  } catch (error) {
    console.error('Error getting product info:', error);
    return "I'm having trouble retrieving product information right now. Please try again later.";
  }
}

function getHelpMessage() {
  return "I can help you with:\n" +
         "- Checking order status (just send 'order status #12345')\n" +
         "- Getting product information (try 'tell me about product XYZ')\n" +
         "- Other questions? Just ask and I'll do my best to assist!";
}

function getGreetingResponse() {
  const greetings = [
    "Hello! How can I help you today?",
    "Hi there! What can I assist you with?",
    "Greetings! How may I help you?"
  ];
  
  return greetings[Math.floor(Math.random() * greetings.length)];
}

function getDefaultResponse() {
  return "I'm not sure I understand. You can ask about order status, product information, or type 'help' for assistance.";
}

function extractOrderNumber(text) {
  // Look for patterns like "order #12345", "order number 12345", or just "12345"
  const match = text.match(/#?(\d+)/);
  return match ? match[1] : null;
}

function extractProductName(text) {
  // Simple product extraction - can be enhanced with more sophisticated NLP
  const productKeywords = ['product', 'item', 'about', 'tell me about'];
  
  let productName = text;
  
  // Remove keywords to isolate product name
  for (const keyword of productKeywords) {
    productName = productName.replace(keyword, '');
  }
  
  // Clean up the string
  productName = productName.trim();
  
  return productName || null;
} 