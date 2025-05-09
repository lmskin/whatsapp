const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Get all messages
router.get('/messages', messageController.getMessages);

// Get message statistics 
router.get('/stats', messageController.getStats);

// Get conversation threads
router.get('/threads', messageController.getConversationThreads);

// Send a message to WhatsApp
router.post('/send', messageController.sendMessage);

module.exports = router; 