/**
 * PostgreSQL Database Initialization Script
 * 
 * This script:
 * 1. Connects to PostgreSQL using the DATABASE_URL from environment variables
 * 2. Creates the database if it doesn't exist
 * 3. Runs the schema.sql file to create tables and sample data
 */

require('dotenv').config({ path: '../server/.env' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Get database connection info from DATABASE_URL
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not found in environment variables');
  process.exit(1);
}

// Parse the connection string to get database name
const dbName = connectionString.split('/').pop().split('?')[0];
const baseConnectionString = connectionString.replace(`/${dbName}`, '/postgres');

async function initializeDatabase() {
  console.log('Starting database initialization...');
  
  // First connect to postgres database to check if our database exists
  let pool = new Pool({ connectionString: baseConnectionString });
  
  try {
    // Check if database exists
    const dbCheckResult = await pool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]
    );
    
    // Create database if it doesn't exist
    if (dbCheckResult.rows.length === 0) {
      console.log(`Database '${dbName}' does not exist. Creating...`);
      await pool.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database '${dbName}' created successfully.`);
    } else {
      console.log(`Database '${dbName}' already exists.`);
    }
    
    // Close the connection to the postgres database
    await pool.end();
    
    // Connect to the whatsapp_integration database
    pool = new Pool({ connectionString });
    
    // Read and execute the schema SQL file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Running schema.sql to create tables and sample data...');
    await pool.query(schemaSql);
    
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initializeDatabase(); 