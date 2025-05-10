@echo off
echo Starting all WhatsApp integration services in sequence...

REM 1. Start PostgreSQL server (check if it's running)
echo 1. Starting PostgreSQL server...
sc query postgresql >nul 2>nul
if %ERRORLEVEL% equ 0 (
    sc query postgresql | findstr /C:"RUNNING" >nul
    if %ERRORLEVEL% neq 0 (
        echo    Starting PostgreSQL service...
        net start postgresql
        timeout /t 5
    ) else (
        echo    PostgreSQL service is already running.
    )
) else (
    echo    PostgreSQL service not found. Assuming it's running or installed as a different service.
)

REM 2. Start ngrok server
echo 2. Starting ngrok tunnel...
start "" cmd /c "ngrok start --config=ngrok.yml whatsapp"
REM Wait for ngrok to initialize
timeout /t 5

REM 3. Start WhatsApp MCP server
echo 3. Starting WhatsApp MCP server...
start "" cmd /c "cd whatsapp-mcp-server && python -m src.whatsapp_mcp.main"
REM Wait for MCP server to initialize
timeout /t 5

REM 4. Start main server
echo 4. Starting main server...
start "" cmd /c "cd server && npm run dev"
REM Wait for server to initialize
timeout /t 5

REM 5. Start client UI and open in browser
echo 5. Starting client UI and opening in browser...
cd client
set "DANGEROUSLY_DISABLE_HOST_CHECK=true"
set "WDS_SOCKET_HOST=127.0.0.1"
set "WDS_SOCKET_PORT=0"
set "FAST_REFRESH=false"
REM Remove BROWSER=none to allow the browser to open automatically
start "" cmd /c "npm start"
cd ..

REM Open the browser after a short delay to ensure the client is running
timeout /t 10
start http://localhost:3000

echo All services started successfully!
echo To stop all services, close this window and the other command prompts.
echo.
echo Press any key to stop all services...
pause >nul

REM Stop all services when the user presses a key
echo Stopping all services...
taskkill /f /im node.exe >nul 2>nul
taskkill /f /im python.exe >nul 2>nul
taskkill /f /im ngrok.exe >nul 2>nul
echo All services stopped. 