import React, { useState } from 'react';
import { X, LogIn, UserPlus, User, Lock, Eye, EyeOff, AtSign, Mail, CheckCircle, ShieldPlus, Unlock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { evaluatePasswordStrength } from '../utils/crypto';
import { useToast } from './ToastContainer';

export default function AuthModal({ isOpen, initialTab = 'login', onClose }) {
  const [tab, setTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const { login, register } = useAuth();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const strength = evaluatePasswordStrength(password);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const data = await login(username, password);
      showToast(`Welcome back, ${data.user.username}!`, 'success');
      onClose();
    } catch (err) {
      setErrorMsg(err.data?.detail || err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (password !== passwordConfirm) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const data = await register({
        username,
        email,
        first_name: firstName,
        last_name: lastName,
        password,
        password_confirm: passwordConfirm,
      });
      showToast(`Account created! Welcome, ${data.user.username}!`, 'success');
      onClose();
    } catch (err) {
      let msg = err.message;
      if (err.data) {
        const firstKey = Object.keys(err.data)[0];
        const val = err.data[firstKey];
        msg = Array.isArray(val) ? `${firstKey}: ${val[0]}` : String(val);
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card auth-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="auth-tabs">
          <button
            className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setTab('login');
              setErrorMsg('');
            }}
          >
            <LogIn size={18} /> Sign In
          </button>
          <button
            className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`}
            onClick={() => {
              setTab('register');
              setErrorMsg('');
            }}
          >
            <UserPlus size={18} /> Register
          </button>
        </div>

        {errorMsg && <div className="alert-box alert-danger">{errorMsg}</div>}

        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label>Username</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  required
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Master Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter master password"
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
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-full glow-btn">
              {loading ? <div className="spinner" style={{ width: 16, height: 16, margin: 0 }} /> : <Unlock size={18} />}
              <span>{loading ? 'Signing In...' : 'Sign In to Vault'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Username</label>
              <div className="input-with-icon">
                <AtSign className="input-icon" size={18} />
                <input
                  type="text"
                  required
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Master Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 8 characters"
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
              <label>Confirm Password</label>
              <div className="input-with-icon">
                <CheckCircle className="input-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Confirm password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-full glow-btn">
              {loading ? <div className="spinner" style={{ width: 16, height: 16, margin: 0 }} /> : <ShieldPlus size={18} />}
              <span>{loading ? 'Creating Account...' : 'Create Secure Account'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
