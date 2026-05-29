import { getDatabase } from '@netlify/database';
 

function isNetlifyDeploy() {
  return process.env.NETLIFY === 'true' && process.env.NETLIFY_DEV !== 'true';
}

// Lazy connection — initialized on first query, not at module load.
let _db = null;

function initDb() {
  if (_db) return;

  const connectionString = process.env.NETLIFY_DB_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      '[db] Database not loaded: missing NETLIFY_DB_URL (Netlify Database) or DATABASE_URL (external Postgres).'
    );
  }

  try {
    _db = getDatabase({ connectionString });
  } catch (error) {
    throw new Error(`[db] Database not loaded: ${error.message}`);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function query(text, params) {
  initDb();
  if (!_db?.pool) {
    throw new Error('[db] Database not loaded: client is not initialized.');
  }
  return _db.pool.query(text, params);
}
