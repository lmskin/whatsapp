@echo off
echo Setting up WhatsApp MCP Server...

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Git is required but not installed. Please install git and try again.
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js is required but not installed. Please install Node.js and try again.
    exit /b 1
)

REM Clone the MCP server repository
echo Cloning the WhatsApp MCP server repository...
git clone https://github.com/msaelices/whatsapp-mcp-server.git
cd whatsapp-mcp-server

REM Install dependencies
echo Installing dependencies...
call npm install

REM Generate a random API key (using Node.js)
for /f %%i in ('node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"') do set API_KEY=%%i

REM Create .env file
echo Creating .env file for MCP server...
echo PORT=4000 > .env
echo API_KEY=%API_KEY% >> .env

echo MCP Server setup complete!
echo MCP_API_KEY=%API_KEY%
echo.
echo To start the MCP server, run:
echo cd whatsapp-mcp-server ^&^& npm start
echo.
echo Make sure to add these values to your main project's .env file:
echo MCP_ENDPOINT=http://localhost:4000
echo MCP_API_KEY=%API_KEY%
echo MCP_DEFAULT_LANGUAGE=en

cd .. 