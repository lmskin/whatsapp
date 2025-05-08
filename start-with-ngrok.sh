#!/bin/bash

# Start ngrok in the background using the config file
echo "Starting ngrok tunnel..."
ngrok start --config=ngrok.yml whatsapp &
NGROK_PID=$!

# Wait for ngrok to initialize
sleep 3

# Start the server
echo "Starting server..."
cd server && npm run dev

# Cleanup when the script is terminated
trap "kill $NGROK_PID" EXIT 