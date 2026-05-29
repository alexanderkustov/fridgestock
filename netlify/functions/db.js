import { getDatabase } from '@netlify/database';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { randomUUID } from 'crypto';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_JSON_PATH = join(__dirname, '../../db.json');

// Lazy connection — initialized on first query, not at module load.
let _db = null;
let _useJsonFallback = false;

function initDb() {
  if (_db || _useJsonFallback) return;
  try {
    _db = getDatabase();
  } catch {
    console.warn('[db] Netlify Database unavailable — using db.json fallback');
    _useJsonFallback = true;
  }
}

// ── JSON fallback ─────────────────────────────────────────────────────────────

function readData() {
  if (!existsSync(DB_JSON_PATH)) return { items: [] };
  try {
    return JSON.parse(readFileSync(DB_JSON_PATH, 'utf8'));
  } catch {
    return { items: [] };
  }
}

function writeData(data) {
  writeFileSync(DB_JSON_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function jsonQuery(text, params) {
  const sql = text.trim().toUpperCase();
  const data = readData();

  if (sql.startsWith('SELECT')) {
    let rows = [...data.items];

    if (sql.includes('WHERE') && sql.includes('ID =') && params?.[0]) {
      rows = rows.filter(r => r.id === params[0]);
    } else if (sql.includes('WHERE') && sql.includes('CURRENT_QUANTITY <= MINIMUM_QUANTITY')) {
      rows = rows
        .filter(r => Number(r.current_quantity) <= Number(r.minimum_quantity))
        .map(r => ({ ...r, quantity_to_buy: Number(r.target_quantity) - Number(r.current_quantity) }));
    }

    if (sql.includes('ORDER BY') && sql.includes('DESC')) {
      rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return { rows };
  }

  if (sql.startsWith('INSERT')) {
    const now = new Date().toISOString();
    const item = {
      id: randomUUID(),
      title: params[0],
      current_quantity: params[1],
      minimum_quantity: params[2],
      target_quantity: params[3],
      unit: params[4] ?? null,
      location: params[5] ?? 'fridge',
      created_at: now,
      updated_at: now,
    };
    data.items.push(item);
    writeData(data);
    return { rows: [item], rowCount: 1 };
  }

  if (sql.startsWith('UPDATE')) {
    const id = params[params.length - 1];
    const idx = data.items.findIndex(r => r.id === id);
    if (idx === -1) return { rows: [], rowCount: 0 };

    const now = new Date().toISOString();
    const item = { ...data.items[idx], updated_at: now };

    if (sql.includes('CURRENT_QUANTITY = TARGET_QUANTITY')) {
      item.current_quantity = item.target_quantity;
    } else if (sql.includes('CURRENT_QUANTITY + 1')) {
      item.current_quantity = Number(item.current_quantity) + 1;
    } else if (sql.includes('CURRENT_QUANTITY - 1')) {
      item.current_quantity = Math.max(0, Number(item.current_quantity) - 1);
    } else {
      // Full update — params: [title, current_qty, min_qty, target_qty, unit, location, id]
      item.title = params[0];
      item.current_quantity = params[1];
      item.minimum_quantity = params[2];
      item.target_quantity = params[3];
      item.unit = params[4];
      item.location = params[5];
    }

    data.items[idx] = item;
    writeData(data);
    return { rows: [item], rowCount: 1 };
  }

  if (sql.startsWith('DELETE')) {
    const idx = data.items.findIndex(r => r.id === params[0]);
    if (idx === -1) return { rows: [], rowCount: 0 };
    data.items.splice(idx, 1);
    writeData(data);
    return { rows: [], rowCount: 1 };
  }

  return { rows: [], rowCount: 0 };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function query(text, params) {
  initDb();
  if (_useJsonFallback) return jsonQuery(text, params);
  return _db.pool.query(text, params);
}
