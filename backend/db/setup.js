const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  // First, connect to the default postgres database to create our database
  const defaultPool = new Pool({
    user: process.env.DB_USER || 'admin',
    host: process.env.DB_HOST || 'localhost',
    database: 'postgres',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432,
  });

  try {
    console.log('Checking if database exists...');
    
    // Check if database exists
    const dbCheck = await defaultPool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'hustlaa'"
    );

    if (dbCheck.rows.length === 0) {
      console.log('Creating database hustlaa...');
      await defaultPool.query('CREATE DATABASE hustlaa');
      console.log('Database created successfully!');
    } else {
      console.log('Database hustlaa already exists.');
    }

    await defaultPool.end();

    // Now connect to the hustlaa database and run the schema
    const hustlaaPool = new Pool({
      user: process.env.DB_USER || 'admin',
      host: process.env.DB_HOST || 'localhost',
      database: 'hustlaa',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 5432,
    });

    console.log('Running database schema...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await hustlaaPool.query(schema);
    console.log('✅ Database schema created successfully!');
    
    await hustlaaPool.end();
    
    console.log('\n🎉 Database setup complete!');
    console.log('You can now start using the application.');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  PostgreSQL is not running or not accessible.');
      console.error('Please ensure PostgreSQL is installed and running.');
      console.error('\nFor development, you can use a simpler approach:');
      console.error('1. Install PostgreSQL: brew install postgresql@15');
      console.error('2. Start it: brew services start postgresql@15');
      console.error('3. Run this script again: node db/setup.js');
    }
    
    process.exit(1);
  }
}

setupDatabase();
