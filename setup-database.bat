@echo off
echo Setting up PostgreSQL database for WhatsApp MCP Server

REM Check if PostgreSQL is installed
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo PostgreSQL is not installed or not in PATH.
    echo Please install PostgreSQL from: https://www.postgresql.org/download/windows/
    exit /b 1
)

REM Check if .env file exists, if not create it from .env.example
if not exist "server\.env" (
    echo No .env file found. Creating one from template...
    
    if exist "server\.env.example" (
        copy "server\.env.example" "server\.env"
        echo Created .env file from .env.example
    ) else (
        echo No .env template found. Please create a server\.env file manually.
    )
)

REM Install database dependencies
echo Installing database dependencies...
cd db && npm install
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install database dependencies.
    exit /b 1
)

REM Initialize the database
echo Initializing database...
cd db && npm run init
if %ERRORLEVEL% NEQ 0 (
    echo Failed to initialize database.
    exit /b 1
)

echo Database setup completed successfully! 