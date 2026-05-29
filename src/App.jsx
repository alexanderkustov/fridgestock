import React, { useState, useEffect } from 'react';
import { 
  Refrigerator, 
  ClipboardList, 
  Boxes, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Bell 
} from 'lucide-react';
import Inventory from './pages/Inventory.jsx';
import GroceryList from './pages/GroceryList.jsx';

export default function App() {
  const [activePage, setActivePage] = useState('inventory'); // 'inventory' | 'grocery-list'
  const [items, setItems] = useState([]);
  const [groceryList, setGroceryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Toast notification manager
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Fetch all items and grocery list
  const refreshData = async () => {
    try {
      setLoading(true);
      const [itemsRes, groceryRes] = await Promise.all([
        fetch('/api/items'),
        fetch('/api/grocery-list')
      ]);

      if (!itemsRes.ok || !groceryRes.ok) {
        throw new Error('Failed to retrieve inventory data');
      }

      const itemsData = await itemsRes.json();
      const groceryData = await groceryRes.json();

      setItems(itemsData);
      setGroceryList(groceryData);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast(error.message || 'Error connecting to database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Atomic Increment
  const handleIncrement = async (id) => {
    try {
      const res = await fetch(`/api/items/${id}/increment`, { method: 'POST' });
      if (!res.ok) throw new Error('Could not update quantity');
      const updatedItem = await res.json();
      
      showToast(`Incremented ${updatedItem.title}`);
      
      // Smart instant local state update for high-speed feel
      setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      
      // Update grocery list state
      refreshData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  // Atomic Decrement
  const handleDecrement = async (id) => {
    try {
      const res = await fetch(`/api/items/${id}/decrement`, { method: 'POST' });
      if (!res.ok) throw new Error('Could not update quantity');
      const updatedItem = await res.json();
      
      showToast(`Decremented ${updatedItem.title}`);
      
      setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      refreshData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  // Delete Item
  const handleDelete = async (id, title) => {
    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not delete item');
      
      showToast(`Removed ${title} from inventory`);
      setItems(prev => prev.filter(item => item.id !== id));
      setGroceryList(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  // Restock Item (Mark as Bought)
  const handleRestockItem = async (id, title) => {
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restock' })
      });
      if (!res.ok) throw new Error('Could not restock item');
      
      const updatedItem = await res.json();
      showToast(`Successfully restocked ${title}!`);
      
      setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      setGroceryList(prev => prev.filter(item => item.id !== id));
      refreshData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  // Dynamic Dashboard Stats
  const totalItemsCount = items.length;
  const lowStockCount = groceryList.length;
  const healthyStockCount = totalItemsCount - lowStockCount;

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <header className="app-header">
        <nav className="nav-links">
          <button 
            className={`nav-button ${activePage === 'inventory' ? 'active' : ''}`}
            onClick={() => setActivePage('inventory')}
          >
            <Boxes size={16} />
            Inventory
          </button>
          <button 
            className={`nav-button ${activePage === 'grocery-list' ? 'active' : ''}`}
            onClick={() => setActivePage('grocery-list')}
          >
            <ClipboardList size={16} />
            Grocery List
            {lowStockCount > 0 && (
              <span className="badge">{lowStockCount}</span>
            )}
          </button>
        </nav>
      </header>

      {/* Main Core Screen Switch */}
      <main className="main-content">
        {activePage === 'inventory' ? (
          <Inventory 
            items={items}
            loading={loading}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onDelete={handleDelete}
            onRefresh={refreshData}
            showToast={showToast}
          />
        ) : (
          <GroceryList 
            groceryList={groceryList}
            loading={loading}
            onRestock={handleRestockItem}
            onRefresh={refreshData}
            showToast={showToast}
          />
        )}
      </main>

      {/* Toast Notification Popups */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-message ${t.type}`}>
            {t.type === 'error' ? (
              <AlertTriangle size={18} />
            ) : (
              <Sparkles size={18} />
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
