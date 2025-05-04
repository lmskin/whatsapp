# Import Price List.xlsx into PostgreSQL
Write-Host "Importing Price List.xlsx into PostgreSQL database..." -ForegroundColor Green

# Check if Excel COM object is available
try {
    Add-Type -AssemblyName Microsoft.Office.Interop.Excel
} catch {
    Write-Host "Microsoft Excel is required for this script to run." -ForegroundColor Red
    exit 1
}

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

# First, make sure the products table exists by running our schema.sql
Write-Host "Ensuring products table exists..." -ForegroundColor Green
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$schemaSqlPath = Join-Path $scriptDir "schema.sql"

& $psqlPath -U postgres -d $DBNAME -f $schemaSqlPath

# Open Excel and read the Price List.xlsx file
$Excel = New-Object -ComObject Excel.Application
$Excel.Visible = $false
$Excel.DisplayAlerts = $false

$excelPath = Join-Path $scriptDir "Price List.xlsx"
$Workbook = $Excel.Workbooks.Open($excelPath)
$Worksheet = $Workbook.Worksheets.Item(1)

# Get the used range in the worksheet
$Range = $Worksheet.UsedRange
$RowCount = $Range.Rows.Count
$ColumnCount = $Range.Columns.Count

# Determine headers (assuming first row contains headers)
$headers = @()
for ($col = 1; $col -le $ColumnCount; $col++) {
    $headers += $Worksheet.Cells.Item(1, $col).Text
}

# Create a temporary CSV file
$tempCsvPath = [System.IO.Path]::GetTempFileName() -replace '\.tmp$', '.csv'
Write-Host "Creating temporary CSV file: $tempCsvPath" -ForegroundColor Green

# Create CSV with headers as first row
$csvContent = $headers -join ","
Add-Content -Path $tempCsvPath -Value $csvContent

# Add data rows to CSV
for ($row = 2; $row -le $RowCount; $row++) {
    $rowData = @()
    for ($col = 1; $col -le $ColumnCount; $col++) {
        $cellValue = $Worksheet.Cells.Item($row, $col).Text
        # Quote values to handle commas in data
        $rowData += "`"$cellValue`""
    }
    Add-Content -Path $tempCsvPath -Value ($rowData -join ",")
}

# Close Excel
$Workbook.Close($false)
$Excel.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($Worksheet) | Out-Null
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($Workbook) | Out-Null
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($Excel) | Out-Null
[System.GC]::Collect()
[System.GC]::WaitForPendingFinalizers()

# Create SQL for importing from CSV
$importSql = @"
-- Clear existing products table data
TRUNCATE TABLE products;
"@

$importSqlPath = [System.IO.Path]::GetTempFileName() -replace '\.tmp$', '.sql'
Set-Content -Path $importSqlPath -Value $importSql

# Run the truncate SQL
Write-Host "Clearing existing products data..." -ForegroundColor Green
& $psqlPath -U postgres -d $DBNAME -f $importSqlPath

# Create a SQL file with the \copy command
$copySql = @"
\copy products(product_code, product_name, description, price, category, subcategory, sessions, discount, in_stock) FROM '$($tempCsvPath -replace '\\', '\\')' WITH DELIMITER ',' CSV HEADER;
"@

$copySqlPath = [System.IO.Path]::GetTempFileName() -replace '\.tmp$', '.sql'
Set-Content -Path $copySqlPath -Value $copySql

# Run the \copy command
Write-Host "Importing data into products table..." -ForegroundColor Green
& $psqlPath -U postgres -d $DBNAME -f $copySqlPath

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to import data. Check if the file format matches the table structure." -ForegroundColor Red
    exit 1
}

# Update timestamps
$updateSql = @"
-- Update timestamps for all rows
UPDATE products SET created_at = NOW(), updated_at = NOW();
"@

$updateSqlPath = [System.IO.Path]::GetTempFileName() -replace '\.tmp$', '.sql'
Set-Content -Path $updateSqlPath -Value $updateSql

# Run the update SQL
& $psqlPath -U postgres -d $DBNAME -f $updateSqlPath

# Clean up temporary files
Remove-Item -Path $tempCsvPath
Remove-Item -Path $importSqlPath
Remove-Item -Path $copySqlPath
Remove-Item -Path $updateSqlPath

Write-Host "Price List data imported successfully!" -ForegroundColor Green
Write-Host "You can verify by running: SELECT * FROM products LIMIT 10;" -ForegroundColor Cyan
$null = Read-Host "Press Enter to exit" 