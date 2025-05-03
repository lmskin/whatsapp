# Apply schema using PowerShell
Write-Host "Applying WhatsApp database schema..." -ForegroundColor Green

# Get PostgreSQL password
$PGPASSWORD = Read-Host -Prompt "Enter PostgreSQL password for user 'postgres'"
$env:PGPASSWORD = $PGPASSWORD

# Get database name
$DBNAME = Read-Host -Prompt "Enter database name (default is whatsapp_db)"
if (-not $DBNAME) {
    $DBNAME = "whatsapp_db"
}

# Set psql path to the correct PostgreSQL installation
$psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"

# Verify psql path exists
if (-not (Test-Path $psqlPath)) {
    Write-Host "Error: Could not find psql executable at $psqlPath. Please make sure PostgreSQL is installed correctly." -ForegroundColor Red
    exit 1
}

# Run the schema SQL script
Write-Host "Applying schema to $DBNAME..." -ForegroundColor Green
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$schemaSqlPath = Join-Path $scriptDir "schema.sql"

& $psqlPath -U postgres -d $DBNAME -f $schemaSqlPath

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to apply schema. Check if PostgreSQL is running and the database exists." -ForegroundColor Red
    exit 1
}

Write-Host "Schema applied successfully!" -ForegroundColor Green
$null = Read-Host "Press Enter to exit" 