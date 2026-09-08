import React, { useState, useEffect } from 'react';
import { X, Key, Globe, Link as LinkIcon, User, Lock, Eye, EyeOff, Wand2, Star, Save } from 'lucide-react';
import { generatePassword, evaluatePasswordStrength } from '../utils/crypto';
import { vaultApi } from '../services/api';
import { useToast } from './ToastContainer';

export default function ItemModal({ isOpen, editingItem, onClose, onSaved }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title || '');
      setCategory(editingItem.category || 'General');
      setWebsiteUrl(editingItem.website_url || '');
      setUsername(editingItem.username_or_email || '');
      setPassword(editingItem.decrypted_password || '');
      setNotes(editingItem.notes || '');
      setIsFavorite(!!editingItem.is_favorite);
    } else {
      setTitle('');
      setCategory('General');
      setWebsiteUrl('');
      setUsername('');
      setPassword('');
      setNotes('');
      setIsFavorite(false);
    }
    setErrorMsg('');
    setShowPassword(false);
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const strength = evaluatePasswordStrength(password);

  const handleGenerateInline = () => {
    const pw = generatePassword({ length: 18, uppercase: true, lowercase: true, numbers: true, symbols: true });
    setPassword(pw);
    setShowPassword(true);
    showToast('Generated secure random password!', 'success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const payload = {
      title,
      category,
      website_url: websiteUrl,
      username_or_email: username,
      notes,
      is_favorite: isFavorite,
    };

    if (password) {
      payload.password = password;
    }

    try {
      if (editingItem) {
        await vaultApi.updatePassword(editingItem.id, payload);
        showToast('Password entry updated and re-encrypted!', 'success');
      } else {
        await vaultApi.createPassword(payload);
        showToast('New encrypted password saved to vault!', 'success');
      }
      onSaved();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save password item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card item-card-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="modal-header">
          <div className="modal-header-icon bg-indigo">
            <Key size={22} />
          </div>
          <div>
            <h2 className="modal-title">
              {editingItem ? 'Edit Password Entry' : 'New Password Entry'}
            </h2>
            <p className="modal-subtitle">Encrypted on device before storing in PostgreSQL.</p>
          </div>
        </div>

        {errorMsg && <div className="alert-box alert-danger">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title / Service Name <span className="required">*</span></label>
            <div className="input-with-icon">
              <Globe className="input-icon" size={18} />
              <input
                type="text"
                required
                placeholder="e.g. Google, GitHub, Stripe, Chase Bank"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="General">General</option>
                <option value="Social">Social Media</option>
                <option value="Banking">Banking & Finance</option>
                <option value="Work">Work & Productivity</option>
                <option value="Shopping">Shopping</option>
                <option value="Email">Email</option>
                <option value="Development">Developer & Tech</option>
                <option value="Entertainment">Entertainment</option>
              </select>
            </div>

            <div className="form-group">
              <label>Website URL (Optional)</label>
              <div className="input-with-icon">
                <LinkIcon className="input-icon" size={18} />
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Username / Email <span className="required">*</span></label>
            <div className="input-with-icon">
              <User className="input-icon" size={18} />
              <input
                type="text"
                required
                placeholder="username or user@example.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-with-action">
              <label>Password {!editingItem && <span className="required">*</span>}</label>
              <button type="button" className="action-link-btn" onClick={handleGenerateInline}>
                <Wand2 size={14} /> Generate Password
              </button>
            </div>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required={!editingItem}
                placeholder={editingItem ? 'Leave blank to keep unchanged' : 'Enter or generate password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="btn-toggle-input-pw"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {password && (
              <div className="password-strength-container">
                <div className="strength-meter-bar">
                  <div
                    className="strength-fill"
                    style={{ width: `${strength.percent}%`, backgroundColor: strength.color }}
                  ></div>
                </div>
                <span className="strength-text" style={{ color: strength.color }}>
                  Strength: {strength.label}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Secure Notes (Optional)</label>
            <textarea
              rows={3}
              placeholder="Security questions, PINs, recovery tokens..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          <div className="form-checkbox-row">
            <label className="custom-checkbox">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
              />
              <span className="checkbox-mark"></span>
              <span className="checkbox-label">
                <Star size={16} className="checkbox-icon" /> Mark as Favorite
              </span>
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary glow-btn">
              {loading ? (
                <div className="spinner" style={{ width: 16, height: 16, margin: 0 }} />
              ) : (
                <Save size={18} />
              )}
              <span>{loading ? 'Encrypting & Saving...' : 'Save Encrypted Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
