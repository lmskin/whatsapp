#!/bin/bash
set -e

echo "Setting up PostgreSQL database for WhatsApp MCP Server"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed or not in PATH."
    echo "Please install PostgreSQL from: https://www.postgresql.org/download/"
    exit 1
fi

# Check if .env file exists, if not create it from .env.example
if [ ! -f "server/.env" ]; then
    echo "No .env file found. Creating one from template..."
    
    if [ -f "server/.env.example" ]; then
        cp "server/.env.example" "server/.env"
        echo "Created .env file from .env.example"
    else
        echo "No .env template found. Please create a server/.env file manually."
    fi
fi

# Install database dependencies
echo "Installing database dependencies..."
cd db && npm install

# Initialize the database
echo "Initializing database..."
npm run init

echo "Database setup completed successfully!" 