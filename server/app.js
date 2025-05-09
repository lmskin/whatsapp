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

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Basic route for testing
app.get('/', (req, res) => {
  res.send('WhatsApp Integration API is running');
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