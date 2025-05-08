# Setup PostgreSQL database for WhatsApp MCP Server

Write-Host "Setting up PostgreSQL database for WhatsApp MCP Server" -ForegroundColor Green

# Check if PostgreSQL is installed
try {
    $null = Get-Command psql -ErrorAction Stop
    Write-Host "PostgreSQL is installed and available in PATH" -ForegroundColor Green
} catch {
    Write-Host "PostgreSQL is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

# Check if .env file exists, if not create it from .env.example
if (-not (Test-Path -Path "server/.env")) {
    Write-Host "No .env file found. Creating one from template..." -ForegroundColor Yellow
    
    if (Test-Path -Path "server/.env.example") {
        Copy-Item -Path "server/.env.example" -Destination "server/.env"
        Write-Host "Created .env file from .env.example" -ForegroundColor Green
    } else {
        Write-Host "No .env template found. Please create a server/.env file manually." -ForegroundColor Red
    }
}

# Install database dependencies
Write-Host "Installing database dependencies..." -ForegroundColor Cyan
Set-Location -Path ./db
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install database dependencies." -ForegroundColor Red
    exit 1
}

# Initialize the database
Write-Host "Initializing database..." -ForegroundColor Cyan
npm run init
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to initialize database." -ForegroundColor Red
    exit 1
}

Set-Location -Path ..
Write-Host "Database setup completed successfully!" -ForegroundColor Green 