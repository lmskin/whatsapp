@echo off
echo Starting WhatsApp Integration UI...

cd client

rem Set environment variables that might help with startup issues
set "DANGEROUSLY_DISABLE_HOST_CHECK=true"
set "WDS_SOCKET_HOST=127.0.0.1"
set "WDS_SOCKET_PORT=0"
set "FAST_REFRESH=false"

echo Using Node version:
node --version

echo Checking for terser-webpack-plugin...
if not exist "node_modules\terser-webpack-plugin" (
  echo Installing terser-webpack-plugin...
  npm install terser-webpack-plugin@5.3.10 --save-dev
)

echo Starting React application... (This might take a moment)
start "" cmd /c npx --no-install react-scripts start

rem Wait for the app to initialize before opening browser
echo Waiting for application to start...
timeout /t 10 /nobreak > nul

rem Open browser explicitly in case it doesn't open automatically
start http://localhost:3000

echo Browser should open automatically. If not, visit: http://localhost:3000
echo Press any key to stop the application when done...
pause 