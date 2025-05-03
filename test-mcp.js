/**
 * Test script for MCP server integration
 * Run with: node test-mcp.js
 */

const axios = require('axios');
require('dotenv').config();

// Configuration
const MCP_ENDPOINT = process.env.MCP_ENDPOINT || 'http://localhost:4000';
const MCP_API_KEY = process.env.MCP_API_KEY;
const API_ENDPOINT = process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:3001';

// Test messages to process
const testMessages = [
  "Hello there",
  "What's the status of order #12345?",
  "I want to place an order for 2 pizzas",
  "Thank you for your help",
  "What can you do?"
];

/**
 * Test MCP server directly
 */
async function testMcpDirectly() {
  try {
    console.log('Testing MCP server connection directly...');
    
    const response = await axios.post(`${MCP_ENDPOINT}/process`, {
      text: "Hello, how are you?",
      userId: "test-user",
      language: "en"
    }, {
      headers: {
        'Authorization': `Bearer ${MCP_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('MCP Direct Response:', response.data);
    console.log('MCP connection successful!\n');
    return true;
  } catch (error) {
    console.error('Error connecting to MCP server:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

/**
 * Test our API integration with MCP
 */
async function testApiIntegration() {
  try {
    console.log('Testing API integration with MCP...');
    
    for (const message of testMessages) {
      console.log(`\nProcessing: "${message}"`);
      
      const response = await axios.post(`${API_ENDPOINT}/api/mcp/test`, {
        message,
        phone: "test-user"
      });
      
      console.log('Response:', response.data.response);
    }
    
    console.log('\nAPI integration testing complete!');
    return true;
  } catch (error) {
    console.error('Error testing API integration:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('Starting MCP Integration Tests\n');
  
  // First test direct connection to MCP
  const mcpConnected = await testMcpDirectly();
  
  if (mcpConnected) {
    // Then test our API integration
    await testApiIntegration();
  } else {
    console.log('\nSkipping API integration tests due to MCP connection failure.');
    console.log('Make sure the MCP server is running at:', MCP_ENDPOINT);
    console.log('And the API_KEY is correctly set in .env files.');
  }
  
  console.log('\nTesting complete!');
}

// Run the tests
runTests().catch(console.error); 