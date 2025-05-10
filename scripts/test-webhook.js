/**
 * Test script to verify WhatsApp webhook functionality
 * 
 * This script sends a direct POST request to the webhook endpoint
 * simulating a WhatsApp webhook message.
 */

const axios = require('axios');

// Configure endpoint
const WEBHOOK_URL = 'http://localhost:3001/webhook/whatsapp';
const NGROK_URL = 'https://annually-dashing-dolphin.ngrok-free.app/webhook/whatsapp';

// Create a mock WhatsApp webhook payload
const mockPayload = {
  object: 'whatsapp_business_account',
  entry: [{
    id: '123456789',
    changes: [{
      field: 'messages',
      value: {
        messaging_product: 'whatsapp',
        metadata: {
          display_phone_number: '+1234567890',
          phone_number_id: '123456789'
        },
        contacts: [{
          profile: {
            name: 'Test User'
          },
          wa_id: '9876543210'
        }],
        messages: [{
          from: '9876543210',
          id: 'test_message_id_' + Date.now(),
          timestamp: Math.floor(Date.now() / 1000),
          type: 'text',
          text: {
            body: 'This is a test message sent directly to the webhook'
          }
        }]
      }
    }]
  }]
};

// Send a request to the local webhook endpoint
async function testLocalWebhook() {
  try {
    console.log('\n------ Testing Local Webhook ------');
    console.log(`Sending test request to: ${WEBHOOK_URL}`);
    console.log('Payload:', JSON.stringify(mockPayload, null, 2));
    
    const response = await axios.post(WEBHOOK_URL, mockPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    console.log('Local webhook test completed successfully\n');
    return true;
  } catch (error) {
    console.error('Error testing local webhook:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

// Send a request to the ngrok webhook endpoint
async function testNgrokWebhook() {
  try {
    console.log('\n------ Testing Ngrok Webhook ------');
    console.log(`Sending test request to: ${NGROK_URL}`);
    console.log('Payload:', JSON.stringify(mockPayload, null, 2));
    
    const response = await axios.post(NGROK_URL, mockPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    console.log('Ngrok webhook test completed successfully\n');
    return true;
  } catch (error) {
    console.error('Error testing ngrok webhook:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

// Run the tests
async function runTests() {
  console.log('Starting webhook tests...');
  
  // Test local webhook
  const localSuccess = await testLocalWebhook();
  
  // Test ngrok webhook
  const ngrokSuccess = await testNgrokWebhook();
  
  console.log('\n------ Test Summary ------');
  console.log(`Local webhook test: ${localSuccess ? 'PASSED' : 'FAILED'}`);
  console.log(`Ngrok webhook test: ${ngrokSuccess ? 'PASSED' : 'FAILED'}`);
  
  if (!localSuccess) {
    console.log('\nThe local webhook test failed. This suggests there may be issues with your server setup.');
    console.log('Check that your server is running and that the webhook endpoint is properly configured.');
  }
  
  if (!ngrokSuccess) {
    console.log('\nThe ngrok webhook test failed. This suggests there may be issues with your ngrok configuration.');
    console.log('Check that ngrok is running and that the URL is accessible from the internet.');
    console.log('Also verify that your Meta WhatsApp webhook is configured with the correct ngrok URL.');
  }
  
  if (localSuccess && !ngrokSuccess) {
    console.log('\nYour local webhook is working, but the ngrok endpoint is not.');
    console.log('This suggests an issue with your ngrok tunnel or its configuration.');
  }
  
  console.log('\nTest complete.');
}

// Start the tests
runTests(); 