const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Database pool configuration
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});

// Get all orders
exports.getAllOrders = async () => {
  try {
    const query = 'SELECT * FROM orders ORDER BY updated_at DESC';
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error in getAllOrders service:', error);
    throw error;
  }
};

/**
 * Get an order by its number
 * @param {string} orderNumber - The order number
 * @returns {Promise<Object>} - Order data
 */
exports.getOrderByNumber = async (orderNumber) => {
  try {
    const query = 'SELECT * FROM orders WHERE order_number = $1';
    const result = await pool.query(query, [orderNumber]);
    
    if (result.rows.length > 0) {
      return result.rows[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error getting order by number:', error);
    throw error;
  }
};

/**
 * Get orders by customer phone
 * @param {string} phone - Customer phone number
 * @returns {Promise<Array>} - Array of orders
 */
exports.getOrdersByCustomer = async (phone) => {
  try {
    const query = 'SELECT * FROM orders WHERE customer_phone = $1 ORDER BY updated_at DESC';
    const result = await pool.query(query, [phone]);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting orders by customer:', error);
    throw error;
  }
};

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} - Created order
 */
exports.createOrder = async (orderData) => {
  try {
    // Generate unique order number
    const orderNumber = 'ORD-' + Date.now().toString().slice(-6) + '-' + uuidv4().slice(0, 4);
    
    const query = `
      INSERT INTO orders 
      (order_number, customer_phone, status, items, updated_at) 
      VALUES ($1, $2, $3, $4, NOW()) 
      RETURNING *
    `;
    
    const values = [
      orderNumber,
      orderData.customer_phone || null,
      orderData.status || 'pending',
      orderData.items || {}
    ];
    
    const result = await pool.query(query, values);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Update order status
 * @param {string} orderNumber - Order number
 * @param {string} status - New status
 */
exports.updateOrderStatus = async (orderNumber, status) => {
  try {
    const query = `
      UPDATE orders 
      SET status = $1, updated_at = NOW() 
      WHERE order_number = $2 
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, orderNumber]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}; 