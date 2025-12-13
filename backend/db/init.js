const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = require('./pool');

async function initDatabase() {
  try {
    console.log('Connecting to PostgreSQL...');
    
    // Test connection
    const client = await pool.connect();
    console.log('Connected successfully!');
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Creating database schema...');
    await client.query(schema);
    
    console.log('Database initialized successfully!');
    console.log('\nYou can now:');
    console.log('1. Register users (customers and artisans)');
    console.log('2. Create artisan profiles');
    console.log('3. Add services');
    console.log('4. Make bookings');
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('Error initializing database:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\nPostgreSQL is not running. Please start it first:');
      console.error('  brew services start postgresql');
      console.error('  OR');
      console.error('  pg_ctl -D /usr/local/var/postgres start');
    } else if (error.message.includes('database "hustlaa" does not exist')) {
      console.error('\nDatabase "hustlaa" does not exist. Create it first:');
      console.error('  createdb hustlaa');
      console.error('  OR');
      console.error('  psql postgres -c "CREATE DATABASE hustlaa;"');
    }
    
    process.exit(1);
  }
}

initDatabase();
