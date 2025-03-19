import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a connection pool using the same configuration as in database.js
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
});

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Setting up database...');
    
    // Read schema SQL
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema SQL
    console.log('Creating database schema...');
    await client.query(schemaSql);
    console.log('Schema created successfully.');
    
    // Read seed SQL
    const seedPath = path.join(__dirname, 'database', 'seed_clients.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    
    // Execute seed SQL
    console.log('Seeding database with dummy data...');
    const result = await client.query(seedSql);
    
    // Log the result of the seed operation
    const insertedCount = result[result.length - 1].rows[0].result;
    console.log(insertedCount);
    
    console.log('Database setup completed successfully!');
  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase(); 