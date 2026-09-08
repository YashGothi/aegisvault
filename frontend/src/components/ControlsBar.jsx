import React from 'react';
import { Search, X, Filter, Star, LayoutGrid, List, Plus } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Social',
  'Banking',
  'Work',
  'Shopping',
  'Email',
  'Development',
  'Entertainment',
  'General',
];

export default function ControlsBar({
  searchQuery,
  onSearchChange,
  category,
  onCategoryChange,
  onlyFavorites,
  onToggleFavorites,
  viewMode,
  onViewModeChange,
  onOpenAddItem,
}) {
  return (
    <>
      <div className="vault-controls-bar glass-panel">
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search passwords, accounts, websites, tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => onSearchChange('')} title="Clear search">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="controls-right">
          <div className="select-wrapper">
            <Filter className="select-icon" size={16} />
            <select value={category} onChange={(e) => onCategoryChange(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="Social">Social Media</option>
              <option value="Banking">Banking & Finance</option>
              <option value="Work">Work & Productivity</option>
              <option value="Shopping">Shopping</option>
              <option value="Email">Email</option>
              <option value="Development">Developer & Tech</option>
              <option value="Entertainment">Entertainment</option>
              <option value="General">General</option>
            </select>
          </div>

          <button
            className={`btn ${onlyFavorites ? 'btn-primary' : 'btn-secondary'} icon-btn`}
            onClick={onToggleFavorites}
            title="Filter Favorites"
          >
            <Star size={18} fill={onlyFavorites ? 'currentColor' : 'none'} />
            <span className="btn-text">Favorites</span>
          </button>

          <div className="view-mode-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewModeChange('grid')}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => onViewModeChange('list')}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>

          <button className="btn btn-primary glow-btn" onClick={onOpenAddItem}>
            <Plus size={18} />
            <span>New Item</span>
          </button>
        </div>
      </div>

      <div className="category-pills-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`pill-btn ${category === cat ? 'active' : ''}`}
            onClick={() => onCategoryChange(cat)}
          >
            {cat === 'All' ? 'All' : cat}
          </button>
        ))}
      </div>
    </>
  );
}
