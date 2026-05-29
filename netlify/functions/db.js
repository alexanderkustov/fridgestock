import { getDatabase } from '@netlify/database';

const db = getDatabase();

export async function query(text, params) {
  return db.pool.query(text, params);
}
