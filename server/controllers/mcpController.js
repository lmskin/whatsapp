const mcpService = require('../services/mcpService');

/**
 * Train the MCP server with new examples
 */
exports.trainMcp = async (req, res) => {
  try {
    const { examples } = req.body;
    
    if (!examples || !Array.isArray(examples) || examples.length === 0) {
      return res.status(400).json({ error: 'Training examples are required as an array' });
    }
    
    const result = await mcpService.trainMcpServer(examples);
    
    return res.status(200).json({ 
      message: 'MCP server trained successfully',
      result
    });
  } catch (error) {
    console.error('Error training MCP server:', error);
    return res.status(500).json({ error: 'Failed to train MCP server' });
  }
};

/**
 * Get MCP server status
 */
exports.getStatus = async (req, res) => {
  try {
    // This would depend on what status information you want from the MCP server
    // For now, we'll just return a simple indication that MCP is connected
    
    return res.status(200).json({
      status: 'connected',
      endpoint: process.env.MCP_ENDPOINT || 'http://localhost:4000',
      language: process.env.MCP_DEFAULT_LANGUAGE || 'en'
    });
  } catch (error) {
    console.error('Error getting MCP status:', error);
    return res.status(500).json({ error: 'Failed to get MCP server status' });
  }
};

/**
 * Test MCP server with a message
 */
exports.testMcp = async (req, res) => {
  try {
    const { message, phone } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Use a test phone number if none provided
    const testPhone = phone || 'test-user';
    
    const response = await mcpService.processMessage(testPhone, message);
    
    return res.status(200).json({
      input: message,
      response
    });
  } catch (error) {
    console.error('Error testing MCP server:', error);
    return res.status(500).json({ error: 'Failed to test MCP server' });
  }
}; 