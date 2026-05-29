import pg from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const { Pool } = pg;

const usePostgres = !!process.env.DATABASE_URL;
let pool = null;

if (usePostgres) {
  console.log('🔌 DB: Connecting to Postgres Database...');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Neon and many hosted PG instances
  });
} else {
  console.log('💾 DB: DATABASE_URL not set. Falling back to persistent JSON database.');
}

// Local JSON DB Helper
const JSON_DB_PATH = path.join(process.cwd(), 'db.json');

const defaultItems = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'Eggs',
    current_quantity: 6,
    minimum_quantity: 6,
    target_quantity: 12,
    unit: 'pcs',
    location: 'fridge',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    title: 'Chicken breast',
    current_quantity: 2,
    minimum_quantity: 2,
    target_quantity: 4,
    unit: 'packs',
    location: 'fridge',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    title: 'Frozen veg',
    current_quantity: 1,
    minimum_quantity: 4,
    target_quantity: 4,
    unit: 'bag',
    location: 'freezer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

function readJsonDb() {
  try {
    if (!fs.existsSync(JSON_DB_PATH)) {
      fs.writeFileSync(JSON_DB_PATH, JSON.stringify(defaultItems, null, 2), 'utf-8');
      return defaultItems;
    }
    const data = fs.readFileSync(JSON_DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading local JSON DB, returning defaults:', error);
    return defaultItems;
  }
}

function writeJsonDb(data) {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to local JSON DB:', error);
  }
}

// Database helper functions wrapped so that functions can call them uniformly
export async function query(text, params) {
  if (usePostgres) {
    return await pool.query(text, params);
  }

  // Otherwise, handle it using the JSON File Mock Database
  const lowerText = text.trim().toLowerCase();
  
  if (lowerText.startsWith('select') && lowerText.includes('from items')) {
    const items = readJsonDb();
    
    // Check if it is the grocery list query
    // SELECT ... WHERE current_quantity <= minimum_quantity;
    if (lowerText.includes('current_quantity <= minimum_quantity')) {
      const groceryItems = items
        .filter(item => Number(item.current_quantity) <= Number(item.minimum_quantity))
        .map(item => ({
          id: item.id,
          title: item.title,
          current_quantity: Number(item.current_quantity),
          target_quantity: Number(item.target_quantity),
          unit: item.unit,
          location: item.location,
          quantity_to_buy: Number(item.target_quantity) - Number(item.current_quantity)
        }));
      return { rows: groceryItems };
    }

    // Standard SELECT all items (ordered by created_at DESC)
    const sorted = [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: sorted };
  }

  if (lowerText.startsWith('insert into items')) {
    // INSERT INTO items (title, current_quantity, minimum_quantity, target_quantity, unit, location)
    // VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    const [title, cur, min, tar, unit, loc] = params;
    const items = readJsonDb();
    const newItem = {
      id: crypto.randomUUID(),
      title,
      current_quantity: Number(cur),
      minimum_quantity: Number(min),
      target_quantity: Number(tar),
      unit: unit || null,
      location: loc || 'fridge',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    items.push(newItem);
    writeJsonDb(items);
    return { rows: [newItem] };
  }

  if (lowerText.startsWith('update items') && lowerText.includes('where id =')) {
    // UPDATE items SET title=$1, current_quantity=$2, minimum_quantity=$3, target_quantity=$4, unit=$5, location=$6, updated_at=now() WHERE id=$7 RETURNING *
    const items = readJsonDb();
    const id = params[params.length - 1];
    const index = items.findIndex(item => item.id === id);
    if (index === -1) {
      return { rows: [] };
    }

    const currentItem = items[index];

    // Detect if we are doing a regular update or atomic increment/decrement
    if (lowerText.includes('current_quantity = current_quantity + 1')) {
      currentItem.current_quantity = Number(currentItem.current_quantity) + 1;
    } else if (lowerText.includes('current_quantity = greatest(0, current_quantity - 1)')) {
      currentItem.current_quantity = Math.max(0, Number(currentItem.current_quantity) - 1);
    } else if (lowerText.includes('current_quantity = target_quantity')) {
      // Restock action from grocery list
      currentItem.current_quantity = Number(currentItem.target_quantity);
    } else {
      // Standard full update
      const [title, cur, min, tar, unit, loc] = params;
      currentItem.title = title;
      currentItem.current_quantity = Number(cur);
      currentItem.minimum_quantity = Number(min);
      currentItem.target_quantity = Number(tar);
      currentItem.unit = unit;
      currentItem.location = loc;
    }

    currentItem.updated_at = new Date().toISOString();
    items[index] = currentItem;
    writeJsonDb(items);
    return { rows: [currentItem] };
  }

  if (lowerText.startsWith('delete from items') && lowerText.includes('where id =')) {
    const id = params[0];
    const items = readJsonDb();
    const filtered = items.filter(item => item.id !== id);
    writeJsonDb(filtered);
    return { rowCount: items.length - filtered.length };
  }

  throw new Error(`Unsupported query in JSON DB fallback: ${text}`);
}
