import React from 'react';
import { Sparkles, Shield, Lock, Database, Fingerprint } from 'lucide-react';

export default function Hero({ onOpenAuth }) {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-chip">
          <span className="pulse-dot"></span>
          <span>End-to-End Encrypted Password Vault</span>
        </div>
        <h1 className="hero-title">
          Military-Grade Security for Your <span className="gradient-text">Digital Life</span>
        </h1>
        <p className="hero-subtitle">
          Zero-compromise password protection powered by a Django REST API, JWT authentication, PostgreSQL relational storage, and React.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-large glow-btn" onClick={() => onOpenAuth('register')}>
            <Sparkles size={20} /> Get Started Free
          </button>
          <button className="btn btn-secondary btn-large" onClick={() => onOpenAuth('login')}>
            <Shield size={20} /> Unlock Your Vault
          </button>
        </div>

        <div className="hero-features-grid">
          <div className="feature-card glass-panel">
            <Lock className="feature-icon" />
            <h3>AES-256 Encryption</h3>
            <p>Credentials are encrypted with AES-256 Fernet tokens before storing into PostgreSQL.</p>
          </div>
          <div className="feature-card glass-panel">
            <Database className="feature-icon" />
            <h3>PostgreSQL Robustness</h3>
            <p>ACID-compliant relational database management with complete schema validation.</p>
          </div>
          <div className="feature-card glass-panel">
            <Fingerprint className="feature-icon" />
            <h3>JWT Authentication</h3>
            <p>Stateless and tamper-proof security tokens with automated rotation and blacklisting.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
