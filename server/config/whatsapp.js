/**
 * WhatsApp Cloud API configuration
 */
module.exports = {
  // API Version (usually v17.0 or newer)
  apiVersion: process.env.WA_API_VERSION || 'v18.0',
  
  // Phone Number ID from the Meta Business Manager
  phoneNumberId: process.env.WA_PHONE_NUMBER_ID,
  
  // WhatsApp Business Account ID
  businessAccountId: process.env.WA_BUSINESS_ACCOUNT_ID,
  
  // Access Token (System User Access Token with permissions)
  accessToken: process.env.WA_ACCESS_TOKEN,
  
  // Webhook verification token (custom string you create)
  verifyToken: process.env.WA_VERIFY_TOKEN,
  
  // Webhook URL (static ngrok URL)
  webhookUrl: process.env.WA_WEBHOOK_URL || 'https://annually-dashing-dolphin.ngrok-free.app/webhook/whatsapp',
  
  // Message templates (if using template messages)
  templates: {
    welcome: 'welcome_message',
    order_update: 'order_status_update',
    support: 'customer_support'
  },
  
  // Rate limiting settings
  rateLimit: {
    messagesPerDay: 1000,
    messagesPerMinute: 60
  }
}; 