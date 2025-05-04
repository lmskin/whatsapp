@echo off
SETLOCAL

echo Importing Price List.xlsx into PostgreSQL database...
echo.

REM Check if PowerShell is available
WHERE powershell >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo Error: PowerShell is required but not found on this system.
    goto :END
)

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File "%~dp0import-prices.ps1"

:END
ENDLOCAL
pause