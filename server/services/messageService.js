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
 * Get all messages (optionally filtered by user)
 * @param {string} userId - Optional WhatsApp user ID
 * @returns {Promise<Array>} - Array of messages
 */
exports.getMessages = async (userId = null) => {
  try {
    let query = 'SELECT * FROM messages ORDER BY timestamp DESC LIMIT 100';
    let params = [];
    
    if (userId) {
      query = 'SELECT * FROM messages WHERE wa_user_id = $1 ORDER BY timestamp DESC LIMIT 100';
      params = [userId];
    }
    
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

/**
 * Save a new message
 * @param {Object} messageData - Message data
 * @returns {Promise<Object>} - Saved message
 */
exports.saveMessage = async (messageData) => {
  try {
    const { 
      wa_user_id, 
      content, 
      message_type,
      is_outgoing 
    } = messageData;
    
    const query = `
      INSERT INTO messages 
      (wa_user_id, content, message_type, is_outgoing, timestamp) 
      VALUES ($1, $2, $3, $4, NOW()) 
      RETURNING *
    `;
    
    const values = [
      wa_user_id,
      content, 
      message_type || 'text', 
      is_outgoing || false
    ];
    
    const result = await pool.query(query, values);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

/**
 * Update message status
 * @param {string} messageId - Message ID
 * @param {string} status - Message status (sent, delivered, read, failed)
 * @returns {Promise<Object>} - Updated message
 */
exports.updateMessageStatus = async (messageId, status) => {
  try {
    const query = `
      UPDATE messages 
      SET status = $1, 
          updated_at = NOW() 
      WHERE id = $2 
      RETURNING *
    `;
    
    const values = [status, messageId];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating message status:', error);
    throw error;
  }
};

/**
 * Get conversation threads (unique users with latest message)
 * @returns {Promise<Array>} - Array of conversation threads
 */
exports.getConversationThreads = async () => {
  try {
    const query = `
      SELECT DISTINCT ON (wa_user_id) 
        wa_user_id, 
        content, 
        message_type,
        timestamp,
        is_outgoing
      FROM messages 
      ORDER BY wa_user_id, timestamp DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error getting conversation threads:', error);
    throw error;
  }
}; 