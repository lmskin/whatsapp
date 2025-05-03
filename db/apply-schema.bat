@echo off
echo Applying WhatsApp database schema...

REM Get PostgreSQL password
set /p PGPASSWORD="Enter PostgreSQL password for user 'postgres': "

REM Get the database name
set /p DBNAME="Enter database name (default is whatsapp_db): "
if "%DBNAME%"=="" set DBNAME=whatsapp_db

REM Run the schema SQL script
echo Applying schema to %DBNAME%...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d %DBNAME% -f "%~dp0schema.sql"

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to apply schema. Check if PostgreSQL is running and the database exists.
    exit /b 1
)

echo Schema applied successfully!
pause 