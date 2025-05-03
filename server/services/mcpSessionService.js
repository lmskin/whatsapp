const { Pool } = require('pg');

// Database pool configuration
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});

/**
 * Get session data for WhatsApp user
 * @param {string} userId - WhatsApp user ID
 * @returns {Promise<Object>} - Session data
 */
exports.getSession = async (userId) => {
  try {
    const query = `
      SELECT session_data 
      FROM mcp_sessions 
      WHERE wa_user_id = $1 
      ORDER BY updated_at DESC 
      LIMIT 1
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length > 0) {
      return result.rows[0].session_data;
    }
    
    return {};
  } catch (error) {
    console.error('Error getting MCP session:', error);
    return {};
  }
};

/**
 * Update or create session data
 * @param {string} userId - WhatsApp user ID
 * @param {Object} sessionData - Session data to save
 */
exports.updateSession = async (userId, sessionData) => {
  try {
    // First check if session exists
    const existsQuery = `
      SELECT id FROM mcp_sessions 
      WHERE wa_user_id = $1
    `;
    
    const existsResult = await pool.query(existsQuery, [userId]);
    
    if (existsResult.rows.length > 0) {
      // Update existing session
      const updateQuery = `
        UPDATE mcp_sessions 
        SET session_data = $1, updated_at = NOW() 
        WHERE wa_user_id = $2
      `;
      
      await pool.query(updateQuery, [sessionData, userId]);
    } else {
      // Create new session
      const insertQuery = `
        INSERT INTO mcp_sessions 
        (wa_user_id, session_data) 
        VALUES ($1, $2)
      `;
      
      await pool.query(insertQuery, [userId, sessionData]);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating MCP session:', error);
    return false;
  }
};

/**
 * Log MCP training events
 * @param {Array} examples - Training examples
 * @param {boolean} success - If training succeeded
 * @param {Object} result - Result data
 */
exports.logTraining = async (examples, success, result) => {
  try {
    const query = `
      INSERT INTO mcp_training_logs 
      (examples, success, result) 
      VALUES ($1, $2, $3)
    `;
    
    await pool.query(query, [examples, success, result]);
    return true;
  } catch (error) {
    console.error('Error logging MCP training:', error);
    return false;
  }
}; 