const messageService = require('../services/messageService');
const whatsappService = require('../services/whatsappService');
const orderService = require('../services/orderService');
const mcpService = require('../services/mcpService');

// Verify webhook for WhatsApp Cloud API
exports.verifyWebhook = (req, res) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    // Check if mode and token are correct
    if (mode === 'subscribe' && token === process.env.WA_VERIFY_TOKEN) {
      // Respond with the challenge token to confirm
      return res.status(200).send(challenge);
    }
    
    // Respond with '403 Forbidden' if verify tokens do not match
    return res.sendStatus(403);
  } catch (error) {
    console.error('Error verifying webhook:', error);
    return res.sendStatus(500);
  }
};

// Handle incoming WhatsApp messages
exports.handleIncomingMessage = async (req, res) => {
  try {
    // Make sure this is a page webhook
    if (!req.body.object || req.body.object !== 'whatsapp_business_account') {
      return res.sendStatus(404);
    }

    const entries = req.body.entry || [];
    
    for (const entry of entries) {
      const changes = entry.changes || [];
      
      for (const change of changes) {
        if (change.field !== 'messages') continue;
        
        const value = change.value || {};
        const messages = value.messages || [];
        const statuses = value.statuses || [];
        
        // Process delivery status updates
        for (const status of statuses) {
          await processStatusUpdate(status, req.app.get('io'));
        }
        
        // Process incoming messages
        for (const message of messages) {
          await processIncomingMessage(message, value.contacts, req.app.get('io'));
        }
      }
    }
    
    // Return a 200 OK response to acknowledge receipt
    res.status(200).send('EVENT_RECEIVED');
  } catch (error) {
    console.error('Error handling webhook message:', error);
    res.sendStatus(500);
  }
};

// Process message status updates
async function processStatusUpdate(status, io) {
  try {
    const statusType = status.status;
    const messageId = status.id;
    
    console.log(`Message ${messageId} status: ${statusType}`);
    
    // Update message status in database if needed
    // await messageService.updateMessageStatus(messageId, statusType);
    
    // Emit status update via Socket.IO
    if (io) {
      io.emit('message-status-update', { messageId, status: statusType });
    }
  } catch (error) {
    console.error('Error processing status update:', error);
  }
}

// Process incoming messages
async function processIncomingMessage(message, contacts, io) {
  try {
    const phone = message.from;
    const contactInfo = contacts?.[0] || {};
    const messageId = message.id;
    let messageContent = '';
    let messageType = message.type;
    
    // Mark message as read
    await whatsappService.markMessageAsRead(messageId);
    
    // Extract content based on message type
    if (messageType === 'text') {
      messageContent = message.text.body;
    } else if (messageType === 'interactive') {
      // Handle interactive message responses (buttons, lists)
      const interactiveType = message.interactive.type;
      
      if (interactiveType === 'button_reply') {
        messageContent = message.interactive.button_reply.title;
        // You may want to also store the button ID
        const buttonId = message.interactive.button_reply.id;
        console.log(`Button ID: ${buttonId}`);
      } else if (interactiveType === 'list_reply') {
        messageContent = message.interactive.list_reply.title;
        // You may want to also store the list item ID
        const listItemId = message.interactive.list_reply.id;
        console.log(`List item ID: ${listItemId}`);
      }
    } else if (messageType === 'image' || messageType === 'audio' || 
               messageType === 'video' || messageType === 'document') {
      // Handle media messages
      messageContent = message[messageType].caption || `[${messageType} message]`;
    } else if (messageType === 'location') {
      // Handle location messages
      const { latitude, longitude, name, address } = message.location;
      messageContent = `Location: ${name || ''} ${address || ''} (${latitude}, ${longitude})`;
    } else {
      messageContent = `[${messageType} message]`;
    }
    
    console.log(`Received message: ${messageContent} from ${phone}`);
    
    // Save the incoming message
    const savedMessage = await messageService.saveMessage({
      wa_user_id: phone,
      wa_message_id: messageId,
      content: messageContent,
      message_type: messageType,
      is_outgoing: false
    });
    
    // Emit the new message via Socket.IO
    if (io) {
      io.emit('new-message', savedMessage);
    }
    
    // Process the message using MCP service
    const responseMessage = await mcpService.processMessage(phone, messageContent);
    
    // Send response via WhatsApp
    if (responseMessage) {
      const response = await whatsappService.sendMessage(phone, responseMessage);
      
      // Save the outgoing message
      const savedResponse = await messageService.saveMessage({
        wa_user_id: phone,
        wa_message_id: response.messages?.[0]?.id,
        content: responseMessage,
        message_type: 'text',
        is_outgoing: true
      });
      
      // Also emit the response message
      if (io) {
        io.emit('new-message', savedResponse);
      }
    }
  } catch (error) {
    console.error('Error processing incoming message:', error);
  }
}

// Helper function to extract order number from message
function extractOrderNumber(text) {
  // Look for patterns like "order #12345" or "order 12345"
  const match = text.match(/#?(\d+)/);
  return match ? match[1] : null;
} 