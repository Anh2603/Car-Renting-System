import React, { useState } from 'react';
import { FleetFooter } from '../../components/Footer/Footer';
import { login, register } from '../../services/authService';
import './LoginPage.css';

/* ===== LOGIN PAGE =====
 * Props:
 *   onHome          — quay về trang chủ
 *   onLoginSuccess  — đăng nhập thành công → lưu user vào App
 */
function LoginPage({ onHome, onLoginSuccess }) {
  const [mode, setMode] = useState('login');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const loginUser = async () => {
    const userData = await login({ email, password });
    onLoginSuccess(userData);
  };

  const registerUser = async () => {
    await register({
      fullName,
      email,
      password,
      phone,
    });

    await loginUser();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage('');
      setIsError(false);

      if (mode === 'register') {
        if (!fullName || !email || !password) {
          throw new Error('Please fill full name, email and password');
        }

        await registerUser();
        return;
      }

      if (!email || !password) {
        throw new Error('Please fill email and password');
      }

      await loginUser();
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setMessage('');
    setIsError(false);
  };

  return (
    <div className="login-page">
      {/* Navbar riêng cho login */}
      <nav className="login-nav">
        <div className="login-nav-logo" onClick={onHome}>
          The Car Renting System
        </div>

        <div className="login-nav-icon" onClick={onHome}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 16c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </nav>

      {/* Card đăng nhập / đăng ký */}
      <div className="login-body">
        <form className="login-card" onSubmit={handleSubmit}>
          {/* Brand */}
          <p className="login-brand-title">The Car Renting System</p>
          <div className="login-brand-bar" />

          <h1 className="login-heading">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h1>

          {mode === 'register' && (
            <>
              <label className="login-label">Full Name</label>
              <input
                className="login-input"
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <label className="login-label">Phone Number</label>
              <input
                className="login-input"
                type="text"
                placeholder="Optional phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </>
          )}

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

          {message && (
            <p className={isError ? 'login-message login-message--error' : 'login-message'}>
              {message}
            </p>
          )}

          <button className="login-submit" type="submit" disabled={loading}>
            {loading
              ? 'Please wait...'
              : mode === 'login'
                ? 'Sign In'
                : 'Create Account'}
          </button>

          <p className="login-footer-link">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <span className="login-footer-link--cta" onClick={switchMode}>
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </span>
          </p>
        </form>
      </div>

      <FleetFooter />
    </div>
  );
}

export default LoginPage;