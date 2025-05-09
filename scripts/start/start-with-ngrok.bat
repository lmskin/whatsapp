@echo off
echo Starting ngrok tunnel...
start cmd /k "ngrok start --config=ngrok.yml whatsapp"

REM Wait for ngrok to initialize
timeout /t 3

echo Starting server...
cd server && npm run dev 