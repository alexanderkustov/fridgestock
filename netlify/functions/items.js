import { query } from './db.js';
import { getItemId } from './route-utils.js';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

export async function handler(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const { httpMethod } = event;
  const id = getItemId(event);

  try {
    // 1. GET ALL ITEMS
    if (httpMethod === 'GET') {
      if (id) {
        // If query param ID is provided, select one specific item
        const result = await query(
          'SELECT * FROM items WHERE id = $1',
          [id]
        );
        if (result.rows.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ error: 'Item not found' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) };
      }

      // Otherwise select all items sorted by created_at DESC
      const result = await query(
        'SELECT * FROM items ORDER BY created_at DESC'
      );
      return { statusCode: 200, headers, body: JSON.stringify(result.rows) };
    }

    // 2. POST (ADD NEW ITEM)
    if (httpMethod === 'POST') {
      const { title, current_quantity, minimum_quantity, target_quantity, unit, location } = JSON.parse(event.body);
      
      if (!title || title.trim() === '') {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Title is required' }) };
      }

      const result = await query(
        'INSERT INTO items (title, current_quantity, minimum_quantity, target_quantity, unit, location) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [
          title.trim(),
          Number(current_quantity) || 0,
          Number(minimum_quantity) || 0,
          Number(target_quantity) || 1,
          unit ? unit.trim() : null,
          location ? location.trim() : 'fridge'
        ]
      );

      return { statusCode: 201, headers, body: JSON.stringify(result.rows[0]) };
    }

    // 3. PATCH (UPDATE ITEM)
    if (httpMethod === 'PATCH') {
      if (!id) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Item ID is required' }) };
      }

      // Check if it's a "restock" action (set current = target)
      const body = JSON.parse(event.body || '{}');
      if (body.action === 'restock') {
        const result = await query(
          'UPDATE items SET current_quantity = target_quantity, updated_at = now() WHERE id = $1 RETURNING *',
          [id]
        );
        if (result.rows.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ error: 'Item not found' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) };
      }

      // Otherwise standard update
      const { title, current_quantity, minimum_quantity, target_quantity, unit, location } = body;

      if (!title || title.trim() === '') {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Title is required' }) };
      }

      const result = await query(
        'UPDATE items SET title = $1, current_quantity = $2, minimum_quantity = $3, target_quantity = $4, unit = $5, location = $6, updated_at = now() WHERE id = $7 RETURNING *',
        [
          title.trim(),
          Number(current_quantity) || 0,
          Number(minimum_quantity) || 0,
          Number(target_quantity) || 1,
          unit ? unit.trim() : null,
          location ? location.trim() : 'fridge',
          id
        ]
      );

      if (result.rows.length === 0) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Item not found' }) };
      }

      return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) };
    }

    // 4. DELETE ITEM
    if (httpMethod === 'DELETE') {
      if (!id) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Item ID is required' }) };
      }

      const result = await query(
        'DELETE FROM items WHERE id = $1',
        [id]
      );

      if (result.rowCount === 0) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Item not found' }) };
      }

      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Item deleted successfully' }) };
    }

    // UNSUPPORTED METHODS
    return { statusCode: 405, headers, body: JSON.stringify({ error: `Method ${httpMethod} not allowed` }) };

  } catch (error) {
    console.error('API Error in items.js:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message })
    };
  }
}
