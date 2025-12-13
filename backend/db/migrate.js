const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = require('./pool');

function ensureSqlDirExists(dir) {
  if (!fs.existsSync(dir)) {
    throw new Error(`Directory not found: ${dir}`);
  }
}

async function ensureBaseSchema(client) {
  const usersExists = await client.query(
    "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='users'"
  );

  if (usersExists.rows.length > 0) return;

  const schemaPath = path.join(__dirname, 'schema.sql');
  const raw = fs.readFileSync(schemaPath, 'utf8');

  const schema = raw
    .replace(/^CREATE TABLE\s+/gim, 'CREATE TABLE IF NOT EXISTS ')
    .replace(/^CREATE INDEX\s+/gim, 'CREATE INDEX IF NOT EXISTS ');

  await client.query(schema);
}

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getAppliedMigrations(client) {
  const res = await client.query('SELECT filename FROM schema_migrations');
  return new Set(res.rows.map((r) => r.filename));
}

async function applyMigrationFile(client, filePath, filename) {
  const sql = fs.readFileSync(filePath, 'utf8');
  if (!sql.trim()) return;

  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING', [filename]);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  }
}

async function migrate() {
  const client = await pool.connect();
  try {
    await ensureBaseSchema(client);
    await ensureMigrationsTable(client);

    const migrationsDir = path.join(__dirname, 'migrations');
    ensureSqlDirExists(migrationsDir);

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    const applied = await getAppliedMigrations(client);

    for (const filename of files) {
      if (applied.has(filename)) continue;
      const fullPath = path.join(migrationsDir, filename);
      console.log(`Applying migration: ${filename}`);
      await applyMigrationFile(client, fullPath, filename);
    }

    console.log('✅ Migrations complete');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
