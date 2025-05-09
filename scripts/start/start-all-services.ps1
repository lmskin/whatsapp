#!/usr/bin/env pwsh
# start-all-services.ps1 - Start all WhatsApp integration services in sequence

Write-Host "Starting all WhatsApp integration services in sequence..." -ForegroundColor Green

# 1. Start PostgreSQL server (check if it's running, if not start it)
Write-Host "1. Starting PostgreSQL server..." -ForegroundColor Cyan
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService -eq $null) {
    Write-Host "   PostgreSQL service not found. Assuming it's running or installed as a different service." -ForegroundColor Yellow
} else {
    if ($pgService.Status -ne "Running") {
        Write-Host "   Starting PostgreSQL service..." -ForegroundColor Yellow
        Start-Service -Name $pgService.Name
        Start-Sleep -Seconds 5
    } else {
        Write-Host "   PostgreSQL service is already running." -ForegroundColor Green
    }
}

# 2. Start ngrok server
Write-Host "2. Starting ngrok tunnel..." -ForegroundColor Cyan
Start-Process -FilePath "cmd" -ArgumentList "/c ngrok start --config=ngrok.yml whatsapp" -WindowStyle Normal
# Wait for ngrok to initialize
Start-Sleep -Seconds 5

# 3. Start WhatsApp MCP server
Write-Host "3. Starting WhatsApp MCP server..." -ForegroundColor Cyan
$mcpProcess = Start-Process -FilePath "cmd" -ArgumentList "/c cd whatsapp-mcp-server && python -m src.whatsapp_mcp.main" -WindowStyle Normal -PassThru
# Wait for MCP server to initialize
Start-Sleep -Seconds 5

# 4. Start main server
Write-Host "4. Starting main server..." -ForegroundColor Cyan
$serverProcess = Start-Process -FilePath "cmd" -ArgumentList "/c cd server && npm run dev" -WindowStyle Normal -PassThru
# Wait for server to initialize
Start-Sleep -Seconds 5

# 5. Start client UI
Write-Host "5. Starting client UI..." -ForegroundColor Cyan
$clientProcess = Start-Process -FilePath "cmd" -ArgumentList "/c node start-client.js" -WindowStyle Normal -PassThru

Write-Host "All services started successfully!" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow

# Keep the script running until user cancels
try {
    while ($true) {
        Start-Sleep -Seconds 5
    }
} finally {
    # This block will execute when the user presses Ctrl+C
    Write-Host "Stopping all services..." -ForegroundColor Red
    if ($clientProcess -ne $null) { Stop-Process -Id $clientProcess.Id -Force -ErrorAction SilentlyContinue }
    if ($serverProcess -ne $null) { Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue }
    if ($mcpProcess -ne $null) { Stop-Process -Id $mcpProcess.Id -Force -ErrorAction SilentlyContinue }
    # Try to kill ngrok
    Stop-Process -Name "ngrok" -Force -ErrorAction SilentlyContinue
    Write-Host "All services stopped." -ForegroundColor Green
} 