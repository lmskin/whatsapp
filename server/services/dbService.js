/**
 * Database Service
 * Provides methods for common database operations
 */

const { Pool } = require('pg');

// Initialize pool using environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // If DATABASE_URL is not provided, use individual connection params
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

// Log database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

/**
 * Execute a database query
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
exports.query = async (text, params) => {
  try {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: result.rowCount });
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

/**
 * Get a database client with transaction support
 * @returns {Object} Database client
 */
exports.getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;
  
  // Set a timeout of 5 seconds to automatically release client
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for too long.');
    console.error('Client query that was never released:', client.lastQuery);
    client.release();
  }, 5000);
  
  // Monkey patch the query method to keep track of the last query executed
  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };
  
  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release.apply(client);
  };
  
  return client;
};

/**
 * Close database pool
 * @returns {Promise} Close result
 */
exports.close = async () => {
  try {
    await pool.end();
    console.log('Database pool has been closed');
  } catch (error) {
    console.error('Error closing database pool:', error);
    throw error;
  }
}; 