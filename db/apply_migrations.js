require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Create a PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'whatsapp_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres'
});

async function applyMigrations() {
  try {
    console.log('Applying database migrations...');
    
    // Get all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(migrationsDir)) {
      console.log('Creating migrations directory...');
      fs.mkdirSync(migrationsDir, { recursive: true });
    }
    
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure migrations are applied in order
    
    if (migrationFiles.length === 0) {
      console.log('No migration files found.');
      return;
    }
    
    // Apply each migration
    for (const file of migrationFiles) {
      console.log(`Applying migration: ${file}...`);
      const migrationPath = path.join(migrationsDir, file);
      const migrationContent = fs.readFileSync(migrationPath, 'utf8');
      
      // Execute the migration SQL
      await pool.query(migrationContent);
      
      console.log(`Migration ${file} applied successfully.`);
    }
    
    console.log('All migrations applied successfully!');
  } catch (error) {
    console.error('Error applying migrations:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the migrations
applyMigrations(); 