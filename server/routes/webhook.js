const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// WhatsApp webhook verification
router.get('/whatsapp', webhookController.verifyWebhook);

// WhatsApp webhook message handler
router.post('/whatsapp', webhookController.handleIncomingMessage);

module.exports = router; 