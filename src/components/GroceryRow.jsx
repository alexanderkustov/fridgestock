import React from 'react';
import { Check, ShoppingCart } from 'lucide-react';

export default function GroceryRow({ item, onRestock }) {
  const { 
    title, 
    current_quantity, 
    target_quantity, 
    unit, 
    location, 
    quantity_to_buy 
  } = item;

  // Safe rounding or parsing of the numeric value
  const toBuy = Number(quantity_to_buy) > 0 ? Number(quantity_to_buy) : Number(target_quantity) - Number(current_quantity);

  return (
    <div className="grocery-card">
      {/* 1. Grocery information and quantity to buy */}
      <div className="grocery-item-desc">
        {/* Checkbox ring indicator */}
        <div className="grocery-checkbox-ring">
          <Check size={14} />
        </div>

        <div className="grocery-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className="grocery-title">{title}</span>
            <span className={`location-tag ${location}`} style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>
              {location}
            </span>
          </div>
          
          <span className="grocery-buy-text">
            Current: {current_quantity} {unit || 'pcs'} — Need to buy: <strong>{toBuy} {unit || 'pcs'}</strong>
            <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
              (Target: {target_quantity})
            </span>
          </span>
        </div>
      </div>

      {/* 2. Interactive Restock Action */}
      <div className="grocery-action-group">
        <button className="restock-btn" onClick={onRestock}>
          <ShoppingCart size={14} />
          Mark as Bought
        </button>
      </div>
    </div>
  );
}
