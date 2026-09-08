import React, { useState, useEffect, useCallback } from 'react';
import { ShieldOff, Plus } from 'lucide-react';
import { vaultApi } from '../services/api';
import StatsGrid from './StatsGrid';
import ControlsBar from './ControlsBar';
import PasswordCard from './PasswordCard';
import ItemModal from './ItemModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { useToast } from './ToastContainer';

export default function Dashboard({ isItemModalOpen, prefillPassword, onItemModalClose, onStatsUpdated }) {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // Modals inside dashboard
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { showToast } = useToast();

  const fetchVaultData = useCallback(async () => {
    try {
      setLoading(true);
      const [passwordsData, statsData] = await Promise.all([
        vaultApi.getPasswords({
          category,
          search: searchQuery,
          favorite: onlyFavorites ? true : null,
        }),
        vaultApi.getVaultStats(),
      ]);

      const itemsList = passwordsData.results || passwordsData || [];
      setItems(itemsList);
      setStats(statsData);
      if (onStatsUpdated) {
        onStatsUpdated(statsData);
      }
    } catch (err) {
      console.error('Error fetching vault data:', err);
      showToast('Error loading vault data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery, onlyFavorites, onStatsUpdated, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVaultData();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchVaultData]);

  // Handle external trigger for opening item modal (e.g. from Generator modal)
  useEffect(() => {
    if (isItemModalOpen) {
      setEditingItem(prefillPassword ? { decrypted_password: prefillPassword } : null);
      setItemModalOpen(true);
    }
  }, [isItemModalOpen, prefillPassword]);

  const handleToggleFavorite = async (id) => {
    try {
      const resp = await vaultApi.toggleFavorite(id);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_favorite: resp.is_favorite } : item
        )
      );
      fetchVaultData();
      showToast(resp.message, 'success');
    } catch (err) {
      showToast('Failed to toggle favorite: ' + err.message, 'error');
    }
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setItemModalOpen(true);
  };

  const handleOpenDelete = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    try {
      await vaultApi.deletePassword(itemToDelete.id);
      showToast('Password entry deleted permanently.', 'info');
      setDeleteModalOpen(false);
      setItemToDelete(null);
      fetchVaultData();
    } catch (err) {
      showToast('Failed to delete item: ' + err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseItemModal = () => {
    setItemModalOpen(false);
    setEditingItem(null);
    if (onItemModalClose) {
      onItemModalClose();
    }
  };

  return (
    <section className="vault-dashboard">
      <StatsGrid stats={stats} />

      <ControlsBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        category={category}
        onCategoryChange={setCategory}
        onlyFavorites={onlyFavorites}
        onToggleFavorites={() => setOnlyFavorites(!onlyFavorites)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenAddItem={() => {
          setEditingItem(null);
          setItemModalOpen(true);
        }}
      />

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Decrypting secure vault items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state glass-panel">
          <div className="empty-icon-wrapper">
            <ShieldOff size={32} />
          </div>
          <h3>{searchQuery || category !== 'All' || onlyFavorites ? 'No matching items found' : 'Your Vault is Empty'}</h3>
          <p>
            {searchQuery || category !== 'All' || onlyFavorites
              ? 'Try adjusting your search query or filter category.'
              : 'Store your credentials securely with AES-256 zero-knowledge encryption.'}
          </p>
          <button
            className="btn btn-primary glow-btn"
            onClick={() => {
              setEditingItem(null);
              setItemModalOpen(true);
            }}
          >
            <Plus size={18} /> Add First Password
          </button>
        </div>
      ) : (
        <div className={`vault-items-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
          {items.map((item) => (
            <PasswordCard
              key={item.id}
              item={item}
              onToggleFavorite={handleToggleFavorite}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      )}

      {/* Item Modal */}
      <ItemModal
        isOpen={itemModalOpen}
        editingItem={editingItem}
        onClose={handleCloseItemModal}
        onSaved={fetchVaultData}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        item={itemToDelete}
        loading={deleteLoading}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
}
