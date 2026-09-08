import React from 'react';
import { ShieldCheck, LogIn, UserPlus, KeyRound, ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ToastContainer';

export default function Navbar({ onOpenAuth, onOpenGenerator, onOpenAudit }) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const handleLogoutClick = async () => {
    await logout();
    showToast('Signed out of vault.', 'info');
  };

  const fullName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username
    : '';
  const initial = (fullName[0] || 'U').toUpperCase();

  return (
    <header className="navbar glass-panel">
      <div className="nav-container">
        <div className="brand-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="logo-icon-wrapper">
            <ShieldCheck className="brand-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-name">
              Aegis<span className="accent-text">Vault</span>
            </span>
            <span className="brand-badge">AES-256</span>
          </div>
        </div>

        <div className="nav-actions">
          {!user ? (
            <div className="button-group">
              <button className="btn btn-outline" onClick={() => onOpenAuth('login')}>
                <LogIn size={18} /> Sign In
              </button>
              <button className="btn btn-primary glow-btn" onClick={() => onOpenAuth('register')}>
                <UserPlus size={18} /> Create Account
              </button>
            </div>
          ) : (
            <div className="user-profile-bar">
              <div className="user-badge">
                <div className="avatar-circle">{initial}</div>
                <div className="user-meta">
                  <span className="user-name">{fullName}</span>
                  <span className="user-handle">@{user.username}</span>
                </div>
              </div>

              <button className="btn btn-secondary icon-btn" title="Password Generator" onClick={onOpenGenerator}>
                <KeyRound size={18} />
                <span className="btn-text">Generator</span>
              </button>

              <button className="btn btn-secondary icon-btn" title="Security Audit" onClick={onOpenAudit}>
                <ShieldAlert size={18} />
                <span className="btn-text">Audit</span>
              </button>

              <button className="btn btn-danger-outline icon-btn" title="Sign Out" onClick={handleLogoutClick}>
                <LogOut size={18} />
                <span className="btn-text">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
