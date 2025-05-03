-- Create the WhatsApp database
CREATE DATABASE whatsapp_db;

-- Connect to the newly created database
\c whatsapp_db

-- Create the tables from our schema
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  wa_user_id TEXT NOT NULL,
  content TEXT,
  is_outgoing BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT,
  customer_phone TEXT,
  status TEXT,
  items JSONB,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mcp_sessions (
  id SERIAL PRIMARY KEY,
  wa_user_id TEXT NOT NULL,
  session_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mcp_training_logs (
  id SERIAL PRIMARY KEY,
  examples JSONB,
  success BOOLEAN,
  result JSONB,
  trained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_messages_wa_user_id ON messages(wa_user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX idx_mcp_sessions_wa_user_id ON mcp_sessions(wa_user_id);

-- Sample data for testing
INSERT INTO orders (order_number, customer_phone, status, items)
VALUES 
  ('ORD-123456', '+1234567890', 'delivered', '{"items": ["Pizza", "Soda"]}'),
  ('ORD-654321', '+0987654321', 'processing', '{"items": ["Burger", "Fries"]}'),
  ('ORD-111222', '+1112223333', 'pending', '{"items": ["Salad"]}');

-- Grant privileges to the default PostgreSQL user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres; 