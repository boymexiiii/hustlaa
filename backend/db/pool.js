const { Pool } = require('pg');

require('dotenv').config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const databaseUrl = process.env.DATABASE_URL;

const shouldUseSsl =
  process.env.DATABASE_SSL === 'true' ||
  /sslmode=require/i.test(databaseUrl) ||
  /neon\.tech/i.test(databaseUrl);

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
});

module.exports = pool;
