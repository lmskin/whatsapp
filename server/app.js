const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// Check if .env exists, otherwise use .env-example
const envPath = fs.existsSync(path.resolve(__dirname, '../.env')) 
  ? '../.env' 
  : '../.env-example';
  
console.log(`Loading environment variables from ${envPath}`);
require('dotenv').config({ path: envPath });

// Import routes
const messageRoutes = require('./routes/messages');
const webhookRoutes = require('./routes/webhook');
const mcpRoutes = require('./routes/mcp');

// Import services
const mcpService = require('./services/mcpService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Make io accessible to our router
app.set('io', io);

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api', messageRoutes);
app.use('/webhook', webhookRoutes);
app.use('/api/mcp', mcpRoutes);

// Enhanced Socket.IO connection handler with detailed logging
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  console.log('Total connected clients:', io.engine.clientsCount);
  
  // Log socket handshake details
  console.log('Socket client address:', socket.handshake.address);
  console.log('Socket client headers:', JSON.stringify(socket.handshake.headers.origin));
  
  socket.on('disconnect', (reason) => {
    console.log('Client disconnected. Reason:', reason);
    console.log('Remaining connected clients:', io.engine.clientsCount);
  });
  
  // Test event to verify socket is working
  socket.emit('test-event', { message: 'Socket connection established' });
});

// Basic route for testing
app.get('/', (req, res) => {
  res.send('WhatsApp Integration API is running');
});

// Test route to emit a message to all clients
app.get('/test-socket', (req, res) => {
  const testMessage = {
    id: Date.now(),
    wa_user_id: 'test-user',
    content: 'Test message from server',
    message_type: 'text',
    is_outgoing: false,
    timestamp: new Date()
  };
  
  io.emit('new-message', testMessage);
  console.log('Test message sent through socket:', testMessage);
  res.send('Test message sent to all clients');
});

// Test route to simulate an incoming WhatsApp webhook message
app.get('/test-whatsapp-webhook', async (req, res) => {
  try {
    console.log('Simulating WhatsApp webhook message');
    
    // Get a reference to the webhook controller to use its methods
    const webhookController = require('./controllers/webhookController');
    
    // Create a simulated WhatsApp message payload
    const mockReq = {
      body: {
        object: 'whatsapp_business_account',
        entry: [{
          changes: [{
            field: 'messages',
            value: {
              messages: [{
                from: '+1234567890',
                id: 'mock_msg_id_' + Date.now(),
                timestamp: Date.now().toString(),
                type: 'text',
                text: {
                  body: 'This is a simulated WhatsApp message'
                }
              }],
              contacts: [{
                profile: {
                  name: 'Simulated User'
                }
              }]
            }
          }]
        }]
      },
      app: {
        get: (key) => {
          if (key === 'io') return io;
          return null;
        }
      }
    };
    
    // Create a mock response object
    const mockRes = {
      status: (code) => {
        console.log('Response status:', code);
        return {
          send: (message) => {
            console.log('Response message:', message);
          }
        };
      },
      sendStatus: (code) => {
        console.log('Response status sent:', code);
      }
    };
    
    // Process the mock webhook message
    await webhookController.handleIncomingMessage(mockReq, mockRes);
    
    res.status(200).send('WhatsApp webhook simulation completed');
  } catch (error) {
    console.error('Error simulating webhook:', error);
    res.status(500).send('Error simulating webhook');
  }
});

// Start server
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO enabled for real-time messaging`);
  console.log(`MCP Server integration configured at: ${process.env.MCP_ENDPOINT || 'http://localhost:4000'}`);
  console.log(`WhatsApp verify token: ${process.env.WA_VERIFY_TOKEN}`);
  console.log(`WhatsApp API version: ${process.env.WA_API_VERSION}`);
  console.log(`WhatsApp Phone Number ID: ${process.env.WA_PHONE_NUMBER_ID}`);
  
  // Initialize MCP server with default examples
  try {
    await mcpService.initializeWithDefaultExamples();
  } catch (error) {
    console.error('Warning: MCP initialization failed, but server will continue running', error.message);
  }
});

module.exports = { app, server, io }; 