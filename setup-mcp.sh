#!/bin/bash

# Setup script for WhatsApp MCP Server

echo "Setting up WhatsApp MCP Server..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is required but not installed. Please install git and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is required but not installed. Please install Node.js and try again."
    exit 1
fi

# Clone the MCP server repository
echo "Cloning the WhatsApp MCP server repository..."
git clone https://github.com/msaelices/whatsapp-mcp-server.git
cd whatsapp-mcp-server

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate a random API key
API_KEY=$(openssl rand -hex 16)

# Create .env file
echo "Creating .env file for MCP server..."
cat > .env << EOL
PORT=4000
API_KEY=${API_KEY}
EOL

echo "MCP Server setup complete!"
echo "MCP_API_KEY=${API_KEY}"
echo ""
echo "To start the MCP server, run:"
echo "cd whatsapp-mcp-server && npm start"
echo ""
echo "Make sure to add these values to your main project's .env file:"
echo "MCP_ENDPOINT=http://localhost:4000"
echo "MCP_API_KEY=${API_KEY}"
echo "MCP_DEFAULT_LANGUAGE=en" 