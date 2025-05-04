-- Create the tables for our WhatsApp integration
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  wa_user_id TEXT NOT NULL,
  wa_message_id TEXT,
  content TEXT,
  message_type TEXT DEFAULT 'text',
  status TEXT,
  is_outgoing BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT,
  customer_phone TEXT,
  status TEXT,
  items JSONB,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mcp_sessions (
  id SERIAL PRIMARY KEY,
  wa_user_id TEXT NOT NULL,
  session_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mcp_training_logs (
  id SERIAL PRIMARY KEY,
  examples JSONB,
  success BOOLEAN,
  result JSONB,
  trained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a products table for the Price List
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  product_code TEXT,
  product_name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  category TEXT,
  subcategory TEXT,
  sessions INTEGER DEFAULT 1,
  discount NUMERIC(5, 2) DEFAULT 0,
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_wa_user_id ON messages(wa_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_wa_message_id ON messages(wa_message_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_mcp_sessions_wa_user_id ON mcp_sessions(wa_user_id);
CREATE INDEX IF NOT EXISTS idx_products_product_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_product_name ON products(product_name); 