import React from 'react';
import { Lock, ShieldCheck, AlertTriangle, Star } from 'lucide-react';

export default function StatsGrid({ stats }) {
  const total = stats?.total_passwords ?? 0;
  const favorites = stats?.favorite_passwords ?? 0;
  const weak = stats?.weak_passwords ?? 0;
  const health = stats?.health_score ?? 100;

  let badgeClass = 'bg-badge-emerald';
  let badgeText = 'Optimal';
  if (health < 50) {
    badgeClass = 'bg-badge-rose';
    badgeText = 'At Risk';
  } else if (health < 80) {
    badgeClass = 'bg-badge-amber';
    badgeText = 'Moderate';
  }

  return (
    <div className="stats-grid">
      <div className="stat-card glass-panel">
        <div className="stat-icon-wrapper bg-indigo">
          <Lock size={24} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Total Passwords</span>
          <span className="stat-value">{total}</span>
        </div>
      </div>

      <div className="stat-card glass-panel">
        <div className="stat-icon-wrapper bg-emerald">
          <ShieldCheck size={24} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Security Score</span>
          <div className="stat-score-wrapper">
            <span className="stat-value">{health}%</span>
            <span className={`health-chip ${badgeClass}`}>{badgeText}</span>
          </div>
        </div>
      </div>

      <div className="stat-card glass-panel">
        <div className="stat-icon-wrapper bg-rose">
          <AlertTriangle size={24} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Weak / At Risk</span>
          <span className="stat-value">{weak}</span>
        </div>
      </div>

      <div className="stat-card glass-panel">
        <div className="stat-icon-wrapper bg-amber">
          <Star size={24} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Favorites</span>
          <span className="stat-value">{favorites}</span>
        </div>
      </div>
    </div>
  );
}
