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
    
    console.log('Webhook verification request received');
    console.log('Mode:', mode);
    console.log('Token:', token);
    console.log('Expected token:', process.env.WA_VERIFY_TOKEN);
    
    // Check if mode and token are correct
    if (mode === 'subscribe' && token === process.env.WA_VERIFY_TOKEN) {
      // Respond with the challenge token to confirm
      console.log('Webhook verified successfully');
      return res.status(200).send(challenge);
    }
    
    // Respond with '403 Forbidden' if verify tokens do not match
    console.log('Webhook verification failed - wrong token');
    return res.sendStatus(403);
  } catch (error) {
    console.error('Error verifying webhook:', error);
    return res.sendStatus(500);
  }
};

// Handle incoming WhatsApp messages
exports.handleIncomingMessage = async (req, res) => {
  try {
    console.log('Webhook message received:', JSON.stringify(req.body));
    
    // Make sure this is a page webhook
    if (!req.body.object || req.body.object !== 'whatsapp_business_account') {
      console.log('Received webhook is not for WhatsApp business account');
      return res.sendStatus(404);
    }

    const entries = req.body.entry || [];
    console.log(`Processing ${entries.length} entries`);
    
    for (const entry of entries) {
      const changes = entry.changes || [];
      console.log(`Processing ${changes.length} changes for entry`);
      
      for (const change of changes) {
        if (change.field !== 'messages') {
          console.log(`Skipping change with field: ${change.field}`);
          continue;
        }
        
        const value = change.value || {};
        const messages = value.messages || [];
        const statuses = value.statuses || [];
        
        console.log(`Processing ${messages.length} messages and ${statuses.length} status updates`);
        
        // Process delivery status updates
        for (const status of statuses) {
          console.log('Processing status update:', JSON.stringify(status));
          await processStatusUpdate(status, req.app.get('io'));
        }
        
        // Process incoming messages
        for (const message of messages) {
          console.log('Processing incoming message:', JSON.stringify(message));
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
      console.log(`Emitting status update via Socket.IO for message ${messageId}`);
      io.emit('message-status-update', { messageId, status: statusType });
      console.log('IO server stats:', io.engine.clientsCount, 'clients connected');
    } else {
      console.error('Socket.IO instance not available for status update');
    }
  } catch (error) {
    console.error('Error processing status update:', error);
  }
}

// Process incoming messages
async function processIncomingMessage(message, contacts, io) {
  try {
    // Extract phone number (WhatsApp ID) - handle both "from" and "wa_id" formats
    const phone = message.from || (message.wa_id ? message.wa_id : null);
    if (!phone) {
      console.error('Error: Cannot process message without phone number:', message);
      return;
    }
    
    // Extract message ID
    const messageId = message.id;
    if (!messageId) {
      console.error('Error: Message does not have an ID:', message);
      return;
    }
    
    console.log(`Processing message from ${phone}, id: ${messageId}`);
    
    // Determine message type and content
    let messageContent = '';
    let messageType = message.type || 'unknown';
    
    // Extract content based on message type
    if (messageType === 'text' && message.text && message.text.body) {
      messageContent = message.text.body;
    } else if (messageType === 'interactive' && message.interactive) {
      // Handle interactive message responses (buttons, lists)
      const interactiveType = message.interactive.type;
      
      if (interactiveType === 'button_reply' && message.interactive.button_reply) {
        messageContent = message.interactive.button_reply.title || '[Button Reply]';
        // You may want to also store the button ID
        const buttonId = message.interactive.button_reply.id;
        console.log(`Button ID: ${buttonId}`);
      } else if (interactiveType === 'list_reply' && message.interactive.list_reply) {
        messageContent = message.interactive.list_reply.title || '[List Reply]';
        // You may want to also store the list item ID
        const listItemId = message.interactive.list_reply.id;
        console.log(`List item ID: ${listItemId}`);
      } else {
        messageContent = `[Interactive ${interactiveType} message]`;
      }
    } else if (['image', 'audio', 'video', 'document'].includes(messageType) && message[messageType]) {
      // Handle media messages
      messageContent = message[messageType].caption || `[${messageType} message]`;
    } else if (messageType === 'location' && message.location) {
      // Handle location messages
      const { latitude, longitude, name, address } = message.location;
      messageContent = `Location: ${name || ''} ${address || ''} (${latitude}, ${longitude})`;
    } else {
      // Fallback for unknown message types
      console.warn(`Unhandled message type: ${messageType}`);
      messageContent = `[${messageType} message]`;
    }
    
    console.log(`Extracted message content: ${messageContent}`);
    
    // Mark message as read - wrap in try/catch to prevent failure if API call fails
    try {
      await whatsappService.markMessageAsRead(messageId);
      console.log(`Marked message ${messageId} as read`);
    } catch (error) {
      console.error('Error marking message as read, continuing processing:', error.message);
    }
    
    // Save the incoming message to database
    console.log('Saving message to database');
    let savedMessage;
    try {
      savedMessage = await messageService.saveMessage({
        wa_user_id: phone,
        wa_message_id: messageId,
        content: messageContent,
        message_type: messageType,
        is_outgoing: false
      });
      console.log('Message saved to database with ID:', savedMessage.id);
    } catch (dbError) {
      console.error('Error saving message to database:', dbError.message);
      // Create a temp message object for emitting even if DB save fails
      savedMessage = {
        id: `temp_${Date.now()}`,
        wa_user_id: phone,
        wa_message_id: messageId,
        content: messageContent,
        message_type: messageType,
        is_outgoing: false,
        timestamp: new Date()
      };
      console.log('Created temporary message object for Socket.IO');
    }
    
    // Emit the new message via Socket.IO
    if (io) {
      console.log('Emitting new message via Socket.IO');
      try {
        // Check if we actually have any connected clients
        if (io.engine.clientsCount > 0) {
          io.emit('new-message', savedMessage);
          console.log('New message emitted successfully to', io.engine.clientsCount, 'clients');
        } else {
          console.warn('No clients connected to receive the message');
        }
        console.log('IO server stats:', io.engine.clientsCount, 'clients connected');
      } catch (socketError) {
        console.error('Error emitting message via Socket.IO:', socketError.message);
      }
    } else {
      console.error('Socket.IO instance not available for new message');
    }
    
    // Process the message using MCP service
    console.log('Processing message with MCP service');
    let responseMessage;
    try {
      responseMessage = await mcpService.processMessage(phone, messageContent);
    } catch (mcpError) {
      console.error('Error processing message with MCP service:', mcpError.message);
    }
    
    // Send response via WhatsApp if we have a response
    if (responseMessage) {
      try {
        console.log(`Sending response: ${responseMessage}`);
        const response = await whatsappService.sendMessage(phone, responseMessage);
        console.log('WhatsApp API response:', JSON.stringify(response));
        
        // Save the outgoing message to database
        console.log('Saving response message to database');
        const savedResponse = await messageService.saveMessage({
          wa_user_id: phone,
          wa_message_id: response.messages?.[0]?.id,
          content: responseMessage,
          message_type: 'text',
          is_outgoing: true
        });
        console.log('Response saved to database with ID:', savedResponse.id);
        
        // Also emit the response message via Socket.IO
        if (io) {
          console.log('Emitting response message via Socket.IO');
          try {
            io.emit('new-message', savedResponse);
            console.log('Response message emitted successfully');
          } catch (socketError) {
            console.error('Error emitting response via Socket.IO:', socketError.message);
          }
        } else {
          console.error('Socket.IO instance not available for response message');
        }
      } catch (error) {
        console.error('Error sending or saving response:', error.message);
      }
    } else {
      console.log('No response message to send');
    }
    
    return savedMessage;
  } catch (error) {
    console.error('Error processing incoming message:', error.message);
    console.error('Message data:', JSON.stringify(message));
  }
}

// Helper function to extract order number from message
function extractOrderNumber(text) {
  // Look for patterns like "order #12345" or "order 12345"
  const match = text.match(/#?(\d+)/);
  return match ? match[1] : null;
} 