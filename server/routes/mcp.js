const express = require('express');
const router = express.Router();
const mcpController = require('../controllers/mcpController');

// Train MCP server
router.post('/train', mcpController.trainMcp);

// Get MCP server status
router.get('/status', mcpController.getStatus);

// Test MCP server
router.post('/test', mcpController.testMcp);

module.exports = router; 