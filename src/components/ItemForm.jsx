import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

export default function ItemForm({ item, onClose, onSave, showToast }) {
  const isEditMode = !!item;

  // Form Field States
  const [title, setTitle] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState('');
  const [minimumQuantity, setMinimumQuantity] = useState('');
  const [targetQuantity, setTargetQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [location, setLocation] = useState('fridge');
  
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-seed form if in edit mode
  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setCurrentQuantity(String(Number(item.current_quantity) || 0));
      setMinimumQuantity(String(Number(item.minimum_quantity) || 0));
      setTargetQuantity(String(Number(item.target_quantity) || 1));
      setUnit(item.unit || 'pcs');
      setLocation(item.location || 'fridge');
    }
  }, [item]);

  const parseQuantity = (value, fallback = 0) => {
    if (value === '') return fallback;
    return Number(value);
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // 1. Validation Logic
    if (!title.trim()) {
      setErrorMessage('Item Title is required.');
      return;
    }

    const normalizedCurrentQuantity = parseQuantity(currentQuantity);
    const normalizedMinimumQuantity = parseQuantity(minimumQuantity);
    const normalizedTargetQuantity = parseQuantity(targetQuantity, 1);

    if ([normalizedCurrentQuantity, normalizedMinimumQuantity, normalizedTargetQuantity].some(Number.isNaN)) {
      setErrorMessage('Quantities must be valid numbers.');
      return;
    }

    if (normalizedCurrentQuantity < 0 || normalizedMinimumQuantity < 0 || normalizedTargetQuantity < 0) {
      setErrorMessage('Quantities cannot be negative.');
      return;
    }

    if (normalizedTargetQuantity < 1) {
      setErrorMessage('Target quantity must be at least 1.');
      return;
    }

    if (normalizedTargetQuantity < normalizedMinimumQuantity) {
      setErrorMessage('Target quantity should not be less than minimum quantity.');
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        title: title.trim(),
        current_quantity: normalizedCurrentQuantity,
        minimum_quantity: normalizedMinimumQuantity,
        target_quantity: normalizedTargetQuantity,
        unit: unit.trim() || null,
        location: location
      };

      const url = isEditMode ? `/api/items/${encodeURIComponent(item.id)}` : '/api/items';
      const method = isEditMode ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save item');
      }

      showToast(
        isEditMode 
          ? `Successfully updated details for "${title.trim()}"` 
          : `Added "${title.trim()}" to stock list!`,
        'success'
      );

      onSave(); // Refresh global data lists
      onClose(); // Exit modal
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || 'Error occurred during save operation.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Modal Title and Exit */}
        <div className="modal-header">
          <h3 className="modal-title">
            {isEditMode ? 'Edit Item Details' : 'Add New Stock Item'}
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Error warning notification */}
        {errorMessage && (
          <div className="toast-message error" style={{ position: 'static', marginBottom: '1.25rem', width: '100%' }}>
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form contents */}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Title field */}
            <div className="form-group">
              <label htmlFor="form-title">Item Title *</label>
              <input
                id="form-title"
                type="text"
                placeholder="e.g. Greek Yogurt, Whole Milk"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={saving}
              />
            </div>

            {/* Quantities Row */}
            <fieldset className="quantity-fieldset">
              <legend>Stock levels</legend>
              <p className="field-hint">Leave current or restock levels blank if you do not know them yet. Target must be at least 1.</p>
              <div className="form-row-3col">
                <div className="form-group">
                  <label htmlFor="form-current">Current</label>
                  <input
                    id="form-current"
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    placeholder="How many now?"
                    className="form-input"
                    value={currentQuantity}
                    onChange={(e) => setCurrentQuantity(e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="form-min">Restock at</label>
                  <input
                    id="form-min"
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    placeholder="Low level"
                    className="form-input"
                    value={minimumQuantity}
                    onChange={(e) => setMinimumQuantity(e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="form-target">Stock to</label>
                  <input
                    id="form-target"
                    type="number"
                    min="1"
                    step="any"
                    inputMode="decimal"
                    placeholder="Ideal amount"
                    className="form-input"
                    value={targetQuantity}
                    onChange={(e) => setTargetQuantity(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>
            </fieldset>

            {/* Units & Location Row */}
            <div className="form-row-2col">
              <div className="form-group">
                <label htmlFor="form-unit">Unit of Measure</label>
                <input
                  id="form-unit"
                  type="text"
                  placeholder="pcs, packs, bags, liters"
                  className="form-input"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="form-location">Storage Location</label>
                <select
                  id="form-location"
                  className="form-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={saving}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="fridge">Fridge</option>
                  <option value="freezer">Freezer</option>
                  <option value="pantry">Pantry</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="modal-footer">
            <button 
              type="button" 
              className="secondary-button" 
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="primary-button" 
              disabled={saving}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
