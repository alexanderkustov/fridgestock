import React from 'react';
import { Plus, Minus, Edit, Trash2, AlertTriangle } from 'lucide-react';

export default function ItemRow({ 
  item, 
  onIncrement, 
  onDecrement, 
  onEdit, 
  onDelete 
}) {
  const { 
    id, 
    title, 
    current_quantity, 
    minimum_quantity, 
    target_quantity, 
    unit, 
    location 
  } = item;

  const isLowStock = Number(current_quantity) <= Number(minimum_quantity);

  const handleDeleteClick = () => {
    if (window.confirm(`Are you sure you want to remove "${title}"?`)) {
      onDelete(id, title);
    }
  };

  return (
    <div className={`item-card ${isLowStock ? 'low-stock' : ''}`}>
      {/* 1. Item description metadata */}
      <div className="item-info">
        <div className="item-title-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className="item-title">{title}</span>
            {isLowStock && (
              <span className="low-badge">
                <AlertTriangle size={12} />
                LOW
              </span>
            )}
          </div>
          
          <div className="item-meta">
            {/* Styled location tag */}
            <span className={`location-tag ${location}`}>
              {location}
            </span>
            {/* Quantity threshold text */}
            <span className="item-quantity-display">
              Stock: <strong>{current_quantity}</strong> {unit || 'pcs'} 
              <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                (Min: {minimum_quantity} | Target: {target_quantity})
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive action controllers */}
      <div className="item-actions">
        {/* Quantity Increment/Decrement Adjuster */}
        <div className="qty-controller">
          <button 
            className="qty-btn" 
            onClick={() => onDecrement(id)}
            aria-label="Decrease quantity"
            disabled={Number(current_quantity) <= 0}
            style={{ opacity: Number(current_quantity) <= 0 ? 0.35 : 1, cursor: Number(current_quantity) <= 0 ? 'not-allowed' : 'pointer' }}
          >
            <Minus size={16} />
          </button>
          <div className="qty-value">{current_quantity}</div>
          <button 
            className="qty-btn" 
            onClick={() => onIncrement(id)}
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Row edit/delete commands */}
        <div className="row-edit-delete">
          <button 
            className="icon-action-btn" 
            onClick={() => onEdit(item)}
            title="Edit Item thresholds"
          >
            <Edit size={16} />
          </button>
          <button 
            className="icon-action-btn delete" 
            onClick={handleDeleteClick}
            title="Remove item"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
