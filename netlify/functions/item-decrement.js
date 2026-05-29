import { query } from './db.js';
import { getItemId } from './route-utils.js';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

export async function handler(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: `Method ${event.httpMethod} not allowed` }) };
  }

  const id = getItemId(event);

  if (!id) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Item ID is required' }) };
  }

  try {
    const result = await query(
      'UPDATE items SET current_quantity = greatest(0, current_quantity - 1), updated_at = now() WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Item not found' }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) };
  } catch (error) {
    console.error('API Error in item-decrement.js:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message })
    };
  }
}
