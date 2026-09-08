import React from 'react';
import { Trash2 } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, item, loading, onClose, onConfirm }) {
  if (!isOpen || !item) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card confirm-delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon bg-rose">
            <Trash2 size={22} />
          </div>
          <div>
            <h2 className="modal-title">Delete Password Entry?</h2>
            <p className="modal-subtitle">This action is permanent and cannot be undone.</p>
          </div>
        </div>

        <p className="confirm-message" style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
          Are you sure you want to permanently delete <strong style={{ color: '#fff' }}>"{item.title}"</strong> from your encrypted vault?
        </p>

        <div className="modal-footer mt-4">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            className="btn btn-danger glow-btn"
            onClick={onConfirm}
          >
            {loading ? (
              <div className="spinner" style={{ width: 16, height: 16, margin: 0 }} />
            ) : (
              <Trash2 size={18} />
            )}
            <span>{loading ? 'Deleting...' : 'Delete Permanently'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
