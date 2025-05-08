const { spawn } = require('child_process');
const path = require('path');

// Set environment variables
process.env.DANGEROUSLY_DISABLE_HOST_CHECK = 'true';
process.env.WDS_SOCKET_HOST = '127.0.0.1';
process.env.WDS_SOCKET_PORT = '0';
process.env.FAST_REFRESH = 'false';
process.env.BROWSER = 'none';

console.log('Starting client in development mode...');

// Path to the React scripts binary
const clientDir = path.join(__dirname, 'client');
const reactScriptsBin = path.join(clientDir, 'node_modules', '.bin', 'react-scripts');

// Start the React development server
const child = spawn(reactScriptsBin, ['start'], {
  cwd: clientDir,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

child.on('error', (error) => {
  console.error('Failed to start client:', error);
});

console.log('Client process started with PID:', child.pid); 