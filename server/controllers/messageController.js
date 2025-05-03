const messageService = require('../services/messageService');
const whatsappService = require('../services/whatsappService');

/**
 * Get all messages or messages for a specific user
 */
exports.getMessages = async (req, res) => {
  try {
    const userId = req.query.userId || null;
    const messages = await messageService.getMessages(userId);
    
    return res.status(200).json(messages);
  } catch (error) {
    console.error('Error in getMessages controller:', error);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

/**
 * Get conversation threads
 */
exports.getConversationThreads = async (req, res) => {
  try {
    const threads = await messageService.getConversationThreads();
    
    return res.status(200).json(threads);
  } catch (error) {
    console.error('Error in getConversationThreads controller:', error);
    return res.status(500).json({ error: 'Failed to fetch conversation threads' });
  }
};

/**
 * Send message via WhatsApp
 */
exports.sendMessage = async (req, res) => {
  try {
    const { to, message } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({ error: 'Recipient and message are required' });
    }
    
    // Send through WhatsApp service
    const result = await whatsappService.sendMessage(to, message);
    
    // Save outgoing message
    await messageService.saveMessage({
      wa_user_id: to,
      content: message,
      is_outgoing: true
    });
    
    return res.status(200).json({
      success: true,
      messageId: result.messages?.[0]?.id,
      recipient: to
    });
  } catch (error) {
    console.error('Error in sendMessage controller:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}; 