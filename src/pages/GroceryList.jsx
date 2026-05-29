import React, { useState } from 'react';
import { ClipboardList, Sparkles, CheckCircle2, ShoppingBag } from 'lucide-react';
import GroceryRow from '../components/GroceryRow.jsx';

export default function GroceryList({ 
  groceryList, 
  loading, 
  onRestock, 
  onRefresh, 
  showToast 
}) {
  const [restockingAll, setRestockingAll] = useState(false);

  // Bulk Restock All action
  const handleRestockAll = async () => {
    if (groceryList.length === 0) return;
    
    try {
      setRestockingAll(true);
      showToast(`Restocking all ${groceryList.length} items to target levels...`);
      
      // Perform consecutive restock patches
      await Promise.all(
        groceryList.map(item => 
          fetch(`/api/items/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'restock' })
          })
        )
      );

      showToast('All items successfully restocked!', 'success');
      onRefresh();
    } catch (err) {
      showToast('Failed to restock some items.', 'error');
    } finally {
      setRestockingAll(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header toolbar */}
      <div className="content-header">
        <div className="page-title-group">
          <h2>Grocery Shopping List</h2>
          <p>Auto-generated from low-stock items in your inventory</p>
        </div>
        
        {groceryList.length > 0 && (
          <div className="header-actions">
            <button 
              className="primary-button" 
              onClick={handleRestockAll}
              disabled={restockingAll}
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)' }}
            >
              <Sparkles size={18} />
              {restockingAll ? 'Restocking All...' : 'Restock All Items'}
            </button>
          </div>
        )}
      </div>

      {/* Main Groceries Listing Grid */}
      {loading && groceryList.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={48} className="animate-spin" />
          <h3>Compiling List...</h3>
          <p>Analyzing threshold quantities across locations.</p>
        </div>
      ) : groceryList.length === 0 ? (
        <div className="empty-state" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
          <CheckCircle2 size={56} style={{ color: '#10b981', filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))' }} />
          <h3 style={{ color: '#f8fafc' }}>You are fully stocked!</h3>
          <p>Every single item matches or exceeds its minimum stock requirement. Nice job!</p>
        </div>
      ) : (
        <div className="grocery-list-wrapper">
          {groceryList.map(item => (
            <GroceryRow 
              key={item.id}
              item={item}
              onRestock={() => onRestock(item.id, item.title)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
