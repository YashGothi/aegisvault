import React from 'react';
import { X, ShieldAlert, Key, CheckCircle2, AlertTriangle, Copy } from 'lucide-react';

export default function AuditModal({ isOpen, stats, onClose }) {
  if (!isOpen) return null;

  const total = stats?.total_passwords ?? 0;
  const strong = stats?.strong_passwords ?? 0;
  const weak = stats?.weak_passwords ?? 0;
  const reused = stats?.reused_passwords ?? 0;
  const health = stats?.health_score ?? 100;

  let borderColor = 'var(--accent-emerald)';
  let title = 'Excellent Security Health';
  let desc = 'Your credentials have strong entropy with minimal detected risks.';

  if (health < 50) {
    borderColor = 'var(--accent-rose)';
    title = 'Security Risks Detected';
    desc = 'Multiple passwords are weak or reused across services. Immediate action advised.';
  } else if (health < 80) {
    borderColor = 'var(--accent-amber)';
    title = 'Moderate Security Health';
    desc = 'Consider upgrading weak credentials and eliminating duplicate passwords.';
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card audit-card-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="modal-header">
          <div className="modal-header-icon bg-emerald">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h2 className="modal-title">Vault Security Audit</h2>
            <p className="modal-subtitle">
              In-depth vulnerability and entropy assessment of your encrypted credentials.
            </p>
          </div>
        </div>

        <div className="audit-score-card">
          <div className="score-circle-wrapper">
            <div className="score-circle" style={{ borderColor }}>
              <span>{health}</span>
              <span className="score-max">/ 100</span>
            </div>
          </div>
          <div className="score-summary">
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        </div>

        <div className="audit-metrics-list">
          <div className="audit-metric-item">
            <div className="audit-metric-icon bg-indigo">
              <Key size={18} />
            </div>
            <div className="audit-metric-info">
              <h4>Total Stored Items</h4>
              <p>Total password records encrypted in PostgreSQL</p>
            </div>
            <span className="audit-badge">{total}</span>
          </div>

          <div className="audit-metric-item">
            <div className="audit-metric-icon bg-emerald">
              <CheckCircle2 size={18} />
            </div>
            <div className="audit-metric-info">
              <h4>Strong Passwords</h4>
              <p>High entropy credentials resistant to brute-force attacks</p>
            </div>
            <span className="audit-badge bg-badge-emerald">{strong}</span>
          </div>

          <div className="audit-metric-item">
            <div className="audit-metric-icon bg-rose">
              <AlertTriangle size={18} />
            </div>
            <div className="audit-metric-info">
              <h4>Weak Passwords</h4>
              <p>Passwords under 8 chars or lacking character diversity</p>
            </div>
            <span className="audit-badge bg-badge-rose">{weak}</span>
          </div>

          <div className="audit-metric-item">
            <div className="audit-metric-icon bg-amber">
              <Copy size={18} />
            </div>
            <div className="audit-metric-info">
              <h4>Reused Passwords</h4>
              <p>Duplicate passwords detected across distinct accounts</p>
            </div>
            <span className="audit-badge bg-badge-amber">{reused}</span>
          </div>
        </div>

        <div className="modal-footer mt-4">
          <button type="button" className="btn btn-primary glow-btn btn-full" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
