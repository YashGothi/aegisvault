import React, { useState, useEffect } from 'react';
import { X, KeyRound, Copy, RefreshCw, Check } from 'lucide-react';
import { generatePassword, evaluatePasswordStrength, copyTextToClipboard } from '../utils/crypto';
import { useToast } from './ToastContainer';

export default function GeneratorModal({ isOpen, onClose, onUsePassword }) {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [generatedPw, setGeneratedPw] = useState('');

  const { showToast } = useToast();

  const handleGenerate = () => {
    const pw = generatePassword({ length, uppercase, lowercase, numbers, symbols });
    setGeneratedPw(pw);
  };

  useEffect(() => {
    if (isOpen) {
      handleGenerate();
    }
  }, [isOpen, length, uppercase, lowercase, numbers, symbols]);

  if (!isOpen) return null;

  const strength = evaluatePasswordStrength(generatedPw);

  const handleCopyOnly = async () => {
    const success = await copyTextToClipboard(generatedPw);
    if (success) {
      showToast('Generated password copied to clipboard!', 'success');
    }
  };

  const handleCopyAndUse = async () => {
    await copyTextToClipboard(generatedPw);
    showToast('Copied! Opening entry form...', 'success');
    onUsePassword(generatedPw);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card generator-card-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="modal-header">
          <div className="modal-header-icon bg-cyan">
            <KeyRound size={22} />
          </div>
          <div>
            <h2 className="modal-title">Password Generator</h2>
            <p className="modal-subtitle">Generate cryptographically secure random passwords.</p>
          </div>
        </div>

        <div className="generator-display-box">
          <span className="generated-password-mono">{generatedPw}</span>
          <div className="gen-display-actions">
            <button className="icon-btn-ghost" title="Copy to Clipboard" onClick={handleCopyOnly}>
              <Copy size={18} />
            </button>
            <button className="icon-btn-ghost" title="Regenerate" onClick={handleGenerate}>
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        <div className="password-strength-container mb-4">
          <div className="strength-meter-bar">
            <div
              className="strength-fill"
              style={{ width: `${strength.percent}%`, backgroundColor: strength.color }}
            ></div>
          </div>
          <div className="strength-meta-row">
            <span className="strength-text" style={{ color: strength.color }}>
              {strength.label} ({Math.round(strength.percent * 1.28)}-bit entropy)
            </span>
            <span className="length-text">Length: {length}</span>
          </div>
        </div>

        <div className="form-group">
          <div className="label-with-action">
            <label>Password Length</label>
            <span className="badge-number">{length}</span>
          </div>
          <input
            type="range"
            min="8"
            max="64"
            value={length}
            className="range-slider"
            onChange={(e) => setLength(parseInt(e.target.value, 10))}
          />
        </div>

        <div className="options-grid">
          <label className="custom-checkbox">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
            />
            <span className="checkbox-mark"></span>
            <span className="checkbox-label">Uppercase (A-Z)</span>
          </label>

          <label className="custom-checkbox">
            <input
              type="checkbox"
              checked={lowercase}
              onChange={(e) => setLowercase(e.target.checked)}
            />
            <span className="checkbox-mark"></span>
            <span className="checkbox-label">Lowercase (a-z)</span>
          </label>

          <label className="custom-checkbox">
            <input
              type="checkbox"
              checked={numbers}
              onChange={(e) => setNumbers(e.target.checked)}
            />
            <span className="checkbox-mark"></span>
            <span className="checkbox-label">Numbers (0-9)</span>
          </label>

          <label className="custom-checkbox">
            <input
              type="checkbox"
              checked={symbols}
              onChange={(e) => setSymbols(e.target.checked)}
            />
            <span className="checkbox-mark"></span>
            <span className="checkbox-label">Symbols (!@#$%^&*)</span>
          </label>
        </div>

        <div className="modal-footer mt-4">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn btn-primary glow-btn" onClick={handleCopyAndUse}>
            <Check size={18} /> Copy & Use
          </button>
        </div>
      </div>
    </div>
  );
}
