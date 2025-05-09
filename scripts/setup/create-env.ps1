# PowerShell script to create .env file

# Check if .env file already exists
if (Test-Path .env) {
    $confirmation = Read-Host "A .env file already exists. Do you want to overwrite it? (y/n)"
    if ($confirmation -ne 'y') {
        Write-Host "Operation cancelled."
        exit
    }
}

# Database Configuration
$dbHost = Read-Host "Enter PostgreSQL host (default: localhost)"
if ([string]::IsNullOrWhiteSpace($dbHost)) { $dbHost = "localhost" }

$dbPort = Read-Host "Enter PostgreSQL port (default: 5432)"
if ([string]::IsNullOrWhiteSpace($dbPort)) { $dbPort = "5432" }

$dbName = Read-Host "Enter PostgreSQL database name (default: whatsapp_db)"
if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "whatsapp_db" }

$dbUser = Read-Host "Enter PostgreSQL username (default: postgres)"
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "postgres" }

$dbPass = Read-Host "Enter PostgreSQL password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPass)
$dbPassPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# WhatsApp Cloud API Configuration
$waPhoneNumberId = Read-Host "Enter WhatsApp Phone Number ID"
$waAccessToken = Read-Host "Enter WhatsApp Access Token"
$waApiVersion = Read-Host "Enter WhatsApp API Version (default: v22.0)"
if ([string]::IsNullOrWhiteSpace($waApiVersion)) { $waApiVersion = "v22.0" }
$waVerifyToken = Read-Host "Enter WhatsApp Verify Token (leave blank to generate random)"
if ([string]::IsNullOrWhiteSpace($waVerifyToken)) { 
    $waVerifyToken = [System.Guid]::NewGuid().ToString("N")
    Write-Host "Generated Verify Token: $waVerifyToken"
}

$waBusinessAccountId = Read-Host "Enter WhatsApp Business Account ID (optional)"
$waDefaultLanguage = Read-Host "Enter Default Template Language (default: en_US)"
if ([string]::IsNullOrWhiteSpace($waDefaultLanguage)) { $waDefaultLanguage = "en_US" }
$waEnableMediaCaching = Read-Host "Enable Media Caching? (true/false, default: false)"
if ([string]::IsNullOrWhiteSpace($waEnableMediaCaching)) { $waEnableMediaCaching = "false" }

# MCP Server Configuration
$mcpEndpoint = Read-Host "Enter MCP Server endpoint (default: http://localhost:4000)"
if ([string]::IsNullOrWhiteSpace($mcpEndpoint)) { $mcpEndpoint = "http://localhost:4000" }
$mcpApiKey = Read-Host "Enter MCP API Key"
$mcpLanguage = Read-Host "Enter MCP Default Language (default: en)"
if ([string]::IsNullOrWhiteSpace($mcpLanguage)) { $mcpLanguage = "en" }

# Server Configuration
$serverPort = Read-Host "Enter server port (default: 3001)"
if ([string]::IsNullOrWhiteSpace($serverPort)) { $serverPort = "3001" }

# Ngrok Configuration
$ngrokDomain = Read-Host "Enter Ngrok domain (for webhook endpoint)"
$ngrokAuthToken = Read-Host "Enter Ngrok auth token"

# Write .env file
@"
# ==========================================================================
# DATABASE CONFIGURATION
# ==========================================================================
# PostgreSQL connection details
DB_HOST=$dbHost
DB_PORT=$dbPort
DB_NAME=$dbName
DB_USER=$dbUser
DB_PASS=$dbPassPlain

# ==========================================================================
# WHATSAPP CLOUD API CONFIGURATION
# ==========================================================================
# These values are obtained from your Meta Developer Portal
# Phone number ID - found in WhatsApp > Getting Started > API Setup
WA_PHONE_NUMBER_ID=$waPhoneNumberId
# Access token - permanent token created in Meta for Developers > Apps > Your App > WhatsApp > API Setup
WA_ACCESS_TOKEN=$waAccessToken
# API version - latest stable version of the WhatsApp API
WA_API_VERSION=$waApiVersion
# Verify token - a custom string you create for webhook verification
WA_VERIFY_TOKEN=$waVerifyToken
# WhatsApp Business Account ID - found in Meta for Developers > Apps > Your App > WhatsApp > Configuration
WA_BUSINESS_ACCOUNT_ID=$waBusinessAccountId
# Default template language (used when sending templates)
WA_DEFAULT_LANGUAGE=$waDefaultLanguage
# Set to true to enable media caching for WhatsApp media
WA_ENABLE_MEDIA_CACHING=$waEnableMediaCaching

# ==========================================================================
# MCP SERVER CONFIGURATION
# ==========================================================================
# Settings for WhatsApp MCP server that provides natural language processing
# MCP server endpoint - the server should be running at this URL
MCP_ENDPOINT=$mcpEndpoint
# API key - generated during MCP server setup
MCP_API_KEY=$mcpApiKey
# Default language for NLP
MCP_DEFAULT_LANGUAGE=$mcpLanguage

# ==========================================================================
# SERVER CONFIGURATION
# ==========================================================================
# Port on which the Express server will run
PORT=$serverPort

# ==========================================================================
# NGROK CONFIGURATION
# ==========================================================================
# Your static ngrok domain that exposes your localhost to the internet
NGROK_DOMAIN=$ngrokDomain
# Your ngrok authentication token
NGROK_AUTHTOKEN=$ngrokAuthToken
"@ | Out-File -FilePath ".env" -Encoding utf8

Write-Host ".env file created successfully!" 