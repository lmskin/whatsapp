@echo off
echo Starting WhatsApp Integration UI...

cd client

rem Set environment variables that might help with startup issues
set "DANGEROUSLY_DISABLE_HOST_CHECK=true"
set "WDS_SOCKET_HOST=127.0.0.1"
set "WDS_SOCKET_PORT=0"
set "FAST_REFRESH=false"
set "BROWSER=none"

echo Using Node version:
node --version

echo Checking for terser-webpack-plugin...
if not exist "node_modules\terser-webpack-plugin" (
  echo Installing terser-webpack-plugin...
  npm install terser-webpack-plugin@5.3.10 --save-dev
)

echo Starting React application... (This might take a moment)
npx --no-install react-scripts start

rem If we get here, there was likely an error
echo If the application didn't start, check the error messages above.
pause 