import React, { useState } from 'react';
import { Search, Plus, ListFilter, HelpCircle, PackageOpen } from 'lucide-react';
import ItemRow from '../components/ItemRow.jsx';
import ItemForm from '../components/ItemForm.jsx';

export default function Inventory({ 
  items, 
  loading, 
  onIncrement, 
  onDecrement, 
  onDelete, 
  onRefresh, 
  showToast 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Locations set for quick filtering
  const locations = ['all', 'fridge', 'freezer', 'pantry'];

  // Filter and search logic
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = locationFilter === 'all' || item.location === locationFilter;
    return matchesSearch && matchesLocation;
  });

  const handleOpenAddForm = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Content Toolbar Actions */}
      <div className="content-header">
        <div className="page-title-group">
        </div>
        
        <div className="header-actions">
          {/* Search bar */}
          <div className="search-input-wrapper">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search items..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Location filter pills */}
          <div className="nav-links" style={{ padding: '0.25rem' }}>
            {locations.map(loc => (
              <button
                key={loc}
                className={`nav-button ${locationFilter === loc ? 'active' : ''}`}
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', textTransform: 'capitalize' }}
                onClick={() => setLocationFilter(loc)}
              >
                {loc}
              </button>
            ))}
          </div>

          {/* Add Item trigger */}
          <button className="primary-button" onClick={handleOpenAddForm}>
            <Plus size={18} />
            Add Item
          </button>
        </div>
      </div>

      {/* Main Items Listing Grid */}
      {loading && items.length === 0 ? (
        <div className="empty-state">
          <HelpCircle size={48} className="animate-spin" />
          <h3>Retrieving Inventory...</h3>
          <p>Please wait while we connect to your stock list.</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">
          <PackageOpen size={48} />
          <h3>No items found</h3>
          <p>{items.length === 0 ? "Your fridge is currently empty! Add your first item." : "No items match your search filters."}</p>
          {items.length === 0 && (
            <button className="primary-button" onClick={handleOpenAddForm} style={{ marginTop: '1rem' }}>
              <Plus size={18} />
              Add First Item
            </button>
          )}
        </div>
      ) : (
        <div className="items-list-wrapper">
          {filteredItems.map(item => (
            <ItemRow 
              key={item.id}
              item={item}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
              onEdit={handleOpenEditForm}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Form Modal for Add/Edit */}
      {isFormOpen && (
        <ItemForm 
          item={editingItem}
          onClose={handleCloseForm}
          onSave={onRefresh}
          showToast={showToast}
        />
      )}
    </div>
  );
}
