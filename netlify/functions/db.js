import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.NETLIFY_DB_URL || process.env.DATABASE_URL;

function isLocalConnection(url) {
  try {
    const { hostname } = new URL(url);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  } catch {
    return false;
  }
}

if (!connectionString) {
  throw new Error(
    'Postgres connection string is missing. Configure Netlify Database so NETLIFY_DB_URL is available to functions, or set DATABASE_URL for a Postgres database.'
  );
}

console.log(
  process.env.NETLIFY_DB_URL
    ? '🔌 DB: Connecting to Netlify Database Postgres.'
    : '🔌 DB: Connecting to configured Postgres database.'
);

const pool = new Pool({
  connectionString,
  ssl: isLocalConnection(connectionString) ? false : { rejectUnauthorized: false }
});

export async function query(text, params) {
  return pool.query(text, params);
}
