# Start ngrok in a new PowerShell window
Write-Host "Starting ngrok tunnel..."
Start-Process powershell -ArgumentList "-Command", "ngrok start --config=ngrok.yml whatsapp"

# Wait for ngrok to initialize
Write-Host "Waiting for ngrok to initialize..."
Start-Sleep -Seconds 3

# Start the server
Write-Host "Starting server..."
Set-Location -Path ./server
npm run dev 