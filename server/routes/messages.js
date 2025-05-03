const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Get all messages
router.get('/messages', messageController.getMessages);

// Send a message to WhatsApp
router.post('/send', messageController.sendMessage);

module.exports = router; 