import React, { useState } from 'react';
import { FleetFooter } from '../../components/Footer/Footer';
import './LoginPage.css';

/* ===== LOGIN PAGE =====
 * Props:
 *   onHome        — quay về trang chủ
 *   onLoginSuccess — đăng nhập thành công → về home
 */
function LoginPage({ onHome, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  /* Xử lý submit (demo — không gọi API thật) */
  const handleSubmit = () => {
    onLoginSuccess();
  };

  return (
    <div className="login-page">
      {/* Navbar riêng cho login */}
      <nav className="login-nav">
        <div className="login-nav-logo" onClick={onHome}>
          The Car Renting System
        </div>
        <div className="login-nav-icon">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 16c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </nav>

      {/* Card đăng nhập */}
      <div className="login-body">
        <div className="login-card">
          {/* Brand */}
          <p className="login-brand-title">The Car Renting System</p>
          <div className="login-brand-bar" />

          <h1 className="login-heading">Sign In</h1>

          {/* Form */}
          <label className="login-label">Email Address</label>
          <input
            className="login-input"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="login-label">Password</label>
          <input
            className="login-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="login-submit" onClick={handleSubmit}>
            Sign In
          </button>

          <p className="login-footer-link">
            Don't have an account?{' '}
            <span className="login-footer-link--cta" onClick={onLoginSuccess}>
              Create one
            </span>
          </p>
        </div>
      </div>

      <FleetFooter />
    </div>
  );
}

export default LoginPage;
