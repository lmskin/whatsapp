/**
 * MCP Server configuration
 */
module.exports = {
  // MCP server endpoint
  endpoint: process.env.MCP_ENDPOINT || 'http://localhost:4000',
  
  // API Key for authentication
  apiKey: process.env.MCP_API_KEY,
  
  // Default language for NLP
  defaultLanguage: process.env.MCP_DEFAULT_LANGUAGE || 'en',
  
  // Default examples for intent recognition
  defaultExamples: [
    {
      text: "What's the status of my order?",
      intent: "check_order_status"
    },
    {
      text: "Can you tell me where my order is?",
      intent: "check_order_status"
    },
    {
      text: "Track order #12345",
      intent: "check_order_status",
      entities: {
        orderNumber: "12345"
      }
    },
    {
      text: "I want to place an order",
      intent: "create_order"
    },
    {
      text: "I'd like to order 2 pizzas",
      intent: "create_order",
      entities: {
        items: ["2 pizzas"]
      }
    },
    {
      text: "Order a large coffee please",
      intent: "create_order",
      entities: {
        items: ["large coffee"]
      }
    },
    {
      text: "Hi",
      intent: "greeting"
    },
    {
      text: "Hello",
      intent: "greeting"
    },
    {
      text: "Thank you",
      intent: "thanks"
    },
    {
      text: "Who are you?",
      intent: "general_inquiry"
    }
  ]
}; 