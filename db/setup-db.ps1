# Setup database using PowerShell
Write-Host "Setting up WhatsApp database..." -ForegroundColor Green

# Get PostgreSQL password
$PGPASSWORD = Read-Host -Prompt "Enter PostgreSQL password for user 'postgres'"
$env:PGPASSWORD = $PGPASSWORD

# Set psql path to the correct PostgreSQL installation
$psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"

# Verify psql path exists
if (-not (Test-Path $psqlPath)) {
    Write-Host "Error: Could not find psql executable at $psqlPath. Please make sure PostgreSQL is installed correctly." -ForegroundColor Red
    exit 1
}

# Run the setup SQL script
Write-Host "Running setup script..." -ForegroundColor Green
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$setupSqlPath = Join-Path $scriptDir "setup.sql"

& $psqlPath -U postgres -f $setupSqlPath

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to create database. Check if PostgreSQL is running and the password is correct." -ForegroundColor Red
    exit 1
}

Write-Host "Database setup completed successfully!" -ForegroundColor Green
$null = Read-Host "Press Enter to exit" 