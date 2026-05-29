import { query } from './db.js';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json'
};

export async function handler(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: `Method ${event.httpMethod} not allowed` }) };
  }

  try {
    const result = await query(`
      SELECT
        id,
        title,
        current_quantity,
        minimum_quantity,
        target_quantity,
        unit,
        location,
        (target_quantity - current_quantity) AS quantity_to_buy
      FROM items
      WHERE current_quantity <= minimum_quantity
      ORDER BY created_at DESC;
    `);

    return { statusCode: 200, headers, body: JSON.stringify(result.rows) };
  } catch (error) {
    console.error('API Error in grocery-list.js:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message })
    };
  }
}
