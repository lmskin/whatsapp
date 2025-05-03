@echo off
echo Creating .env file...

rem Check if .env file already exists
if exist .env (
    set /p confirm="A .env file already exists. Do you want to overwrite it? (y/n): "
    if /i "%confirm%" neq "y" (
        echo Operation cancelled.
        exit /b
    )
)

rem Database Configuration
set /p dbHost="Enter PostgreSQL host (default: localhost): "
if "%dbHost%"=="" set dbHost=localhost

set /p dbPort="Enter PostgreSQL port (default: 5432): "
if "%dbPort%"=="" set dbPort=5432

set /p dbName="Enter PostgreSQL database name (default: whatsapp_db): "
if "%dbName%"=="" set dbName=whatsapp_db

set /p dbUser="Enter PostgreSQL username (default: postgres): "
if "%dbUser%"=="" set dbUser=postgres

set /p dbPass="Enter PostgreSQL password: "

rem WhatsApp Cloud API Configuration
set /p waPhoneNumberId="Enter WhatsApp Phone Number ID: "
set /p waAccessToken="Enter WhatsApp Access Token: "

set /p waApiVersion="Enter WhatsApp API Version (default: v22.0): "
if "%waApiVersion%"=="" set waApiVersion=v22.0

set /p waVerifyToken="Enter WhatsApp Verify Token (leave blank to generate random): "
if "%waVerifyToken%"=="" (
    set waVerifyToken=%random%%random%%random%
    echo Generated Verify Token: %waVerifyToken%
)

set /p waBusinessAccountId="Enter WhatsApp Business Account ID (optional): "
set /p waDefaultLanguage="Enter Default Template Language (default: en_US): "
if "%waDefaultLanguage%"=="" set waDefaultLanguage=en_US

set /p waEnableMediaCaching="Enable Media Caching? (true/false, default: false): "
if "%waEnableMediaCaching%"=="" set waEnableMediaCaching=false

rem MCP Server Configuration
set /p mcpEndpoint="Enter MCP Server endpoint (default: http://localhost:4000): "
if "%mcpEndpoint%"=="" set mcpEndpoint=http://localhost:4000

set /p mcpApiKey="Enter MCP API Key: "

set /p mcpLanguage="Enter MCP Default Language (default: en): "
if "%mcpLanguage%"=="" set mcpLanguage=en

rem Server Configuration
set /p serverPort="Enter server port (default: 3001): "
if "%serverPort%"=="" set serverPort=3001

rem Ngrok Configuration
set /p ngrokDomain="Enter Ngrok domain (for webhook endpoint): "
set /p ngrokAuthToken="Enter Ngrok auth token: "

rem Write .env file
(
echo # ==========================================================================
echo # DATABASE CONFIGURATION
echo # ==========================================================================
echo # PostgreSQL connection details
echo DB_HOST=%dbHost%
echo DB_PORT=%dbPort%
echo DB_NAME=%dbName%
echo DB_USER=%dbUser%
echo DB_PASS=%dbPass%
echo.
echo # ==========================================================================
echo # WHATSAPP CLOUD API CONFIGURATION
echo # ==========================================================================
echo # These values are obtained from your Meta Developer Portal
echo # Phone number ID - found in WhatsApp ^> Getting Started ^> API Setup
echo WA_PHONE_NUMBER_ID=%waPhoneNumberId%
echo # Access token - permanent token created in Meta for Developers ^> Apps ^> Your App ^> WhatsApp ^> API Setup
echo WA_ACCESS_TOKEN=%waAccessToken%
echo # API version - latest stable version of the WhatsApp API
echo WA_API_VERSION=%waApiVersion%
echo # Verify token - a custom string you create for webhook verification
echo WA_VERIFY_TOKEN=%waVerifyToken%
echo # WhatsApp Business Account ID - found in Meta for Developers ^> Apps ^> Your App ^> WhatsApp ^> Configuration
echo WA_BUSINESS_ACCOUNT_ID=%waBusinessAccountId%
echo # Default template language (used when sending templates)
echo WA_DEFAULT_LANGUAGE=%waDefaultLanguage%
echo # Set to true to enable media caching for WhatsApp media
echo WA_ENABLE_MEDIA_CACHING=%waEnableMediaCaching%
echo.
echo # ==========================================================================
echo # MCP SERVER CONFIGURATION
echo # ==========================================================================
echo # Settings for WhatsApp MCP server that provides natural language processing
echo # MCP server endpoint - the server should be running at this URL
echo MCP_ENDPOINT=%mcpEndpoint%
echo # API key - generated during MCP server setup
echo MCP_API_KEY=%mcpApiKey%
echo # Default language for NLP
echo MCP_DEFAULT_LANGUAGE=%mcpLanguage%
echo.
echo # ==========================================================================
echo # SERVER CONFIGURATION
echo # ==========================================================================
echo # Port on which the Express server will run
echo PORT=%serverPort%
echo.
echo # ==========================================================================
echo # NGROK CONFIGURATION
echo # ==========================================================================
echo # Your static ngrok domain that exposes your localhost to the internet
echo NGROK_DOMAIN=%ngrokDomain%
echo # Your ngrok authentication token
echo NGROK_AUTHTOKEN=%ngrokAuthToken%
) > .env

echo .env file created successfully! 