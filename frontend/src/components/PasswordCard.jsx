import React, { useState } from 'react';
import {
  Key,
  MessageCircle,
  CreditCard,
  Briefcase,
  Film,
  ShoppingBag,
  Mail,
  Terminal,
  ExternalLink,
  Star,
  Copy,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
} from 'lucide-react';
import { copyTextToClipboard } from '../utils/crypto';
import { useToast } from './ToastContainer';

function getCategoryIcon(category) {
  switch (category) {
    case 'Social': return <MessageCircle size={20} />;
    case 'Banking': return <CreditCard size={20} />;
    case 'Work': return <Briefcase size={20} />;
    case 'Entertainment': return <Film size={20} />;
    case 'Shopping': return <ShoppingBag size={20} />;
    case 'Email': return <Mail size={20} />;
    case 'Development': return <Terminal size={20} />;
    default: return <Key size={20} />;
  }
}

function formatUrl(url) {
  if (!url) return '#';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export default function PasswordCard({ item, onToggleFavorite, onEdit, onDelete }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const { showToast } = useToast();

  const handleCopy = async (text, label) => {
    const success = await copyTextToClipboard(text);
    if (success) {
      showToast(`${label} copied to clipboard!`, 'success');
    } else {
      showToast(`Failed to copy ${label}.`, 'error');
    }
  };

  const displayedPassword = isRevealed
    ? item.decrypted_password || '••••••••'
    : item.masked_password || '••••••••';

  const strength = item.strength || { label: 'Fair', color: '#eab308' };

  return (
    <div className="vault-card glass-panel">
      <div className="card-top">
        <div className="card-title-group">
          <div className="card-service-icon">
            {getCategoryIcon(item.category)}
          </div>
          <div className="card-title-text">
            <h3 className="card-title" title={item.title}>
              {item.title}
            </h3>
            <span className="card-category-badge">{item.category}</span>
          </div>
        </div>

        <div className="card-top-actions">
          {item.website_url && (
            <a
              href={formatUrl(item.website_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-btn-ghost"
              title="Open Website"
            >
              <ExternalLink size={16} />
            </a>
          )}
          <button
            className={`icon-btn-ghost ${item.is_favorite ? 'is-favorite' : ''}`}
            title={item.is_favorite ? 'Remove Favorite' : 'Mark Favorite'}
            onClick={() => onToggleFavorite(item.id)}
          >
            <Star size={16} fill={item.is_favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="card-fields">
        <div className="card-field-row">
          <span className="field-label">Username:</span>
          <span className="field-value-mono" title={item.username_or_email}>
            {item.username_or_email}
          </span>
          <div className="field-actions">
            <button
              className="icon-btn-ghost"
              title="Copy Username"
              onClick={() => handleCopy(item.username_or_email, 'Username')}
            >
              <Copy size={15} />
            </button>
          </div>
        </div>

        <div className="card-field-row">
          <span className="field-label">Password:</span>
          <span className="field-value-mono">{displayedPassword}</span>
          <div className="field-actions">
            <button
              className="icon-btn-ghost"
              title={isRevealed ? 'Hide Password' : 'Show Password'}
              onClick={() => setIsRevealed(!isRevealed)}
            >
              {isRevealed ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
            <button
              className="icon-btn-ghost"
              title="Copy Password"
              onClick={() => handleCopy(item.decrypted_password, 'Password')}
            >
              <Copy size={15} />
            </button>
          </div>
        </div>
      </div>

      {item.notes && <div className="card-notes">{item.notes}</div>}

      <div className="card-footer">
        <div className="strength-tag" style={{ color: strength.color }}>
          <span className="strength-dot" style={{ backgroundColor: strength.color }}></span>
          <span>{strength.label}</span>
        </div>

        <div className="card-bottom-actions">
          <button className="icon-btn-ghost" title="Edit Entry" onClick={() => onEdit(item)}>
            <Edit3 size={15} />
          </button>
          <button className="icon-btn-ghost" title="Delete Entry" onClick={() => onDelete(item)}>
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
