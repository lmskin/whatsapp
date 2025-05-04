const { execSync } = require('child_process');

// Set environment variables
process.env.DANGEROUSLY_DISABLE_HOST_CHECK = 'true';
process.env.WDS_SOCKET_HOST = '127.0.0.1';
process.env.WDS_SOCKET_PORT = '0';
process.env.FAST_REFRESH = 'false';

try {
  // Run React scripts with the environment variables set
  execSync('react-scripts start', { stdio: 'inherit' });
} catch (error) {
  console.error('Error starting the development server:', error);
  process.exit(1);
} 