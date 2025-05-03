@echo off
echo Setting up WhatsApp database...

REM Get PostgreSQL password
set /p PGPASSWORD="Enter PostgreSQL password for user 'postgres': "

REM Run the setup SQL script
echo Running setup script...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -f "%~dp0setup.sql"

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to create database. Check if PostgreSQL is running and the password is correct.
    exit /b 1
)

echo Database setup completed successfully!
pause 