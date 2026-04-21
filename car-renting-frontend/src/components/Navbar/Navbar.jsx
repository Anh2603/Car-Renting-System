import React from 'react';
import './Navbar.css';

/* ===== NAVBAR COMPONENT =====
 * Props:
 *   onLogin    — hàm mở trang Login
 *   showLogin  — true: hiện nút Login | false: hiện icon user
 *   onHome     — hàm quay về trang chủ
 */
function Navbar({ onLogin, showLogin, onHome }) {
  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="nav-logo" onClick={onHome}>
        The Car Renting System
      </div>

      {/* Bên phải navbar */}
      <div className="nav-right">
        {/* Ngôn ngữ / tiền tệ */}
        <div className="nav-locale">
          <span className="nav-locale-dot">●</span>
          <span>VN/VND</span>
        </div>

        {/* Nút login hoặc icon user */}
        {showLogin ? (
          <button className="nav-login-btn" onClick={onLogin}>
            Login
          </button>
        ) : (
          <div className="nav-user-icon" onClick={onHome}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M2 16c0-3.866 3.134-7 7-7s7 3.134 7 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
      </div>
    </nav>
  );
}

/* ===== DARK NAVBAR — dùng cho Fleet, Confirm, Checkout =====
 * Nền tối #2c3e50, không có nút Login
 */
export function DarkNavbar({ onHome }) {
  return (
    <nav className="navbar navbar--dark">
      <div className="nav-logo" onClick={onHome}>
        The Car Renting System
      </div>
      <div className="nav-user-icon" onClick={onHome}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M2 16c0-3.866 3.134-7 7-7s7 3.134 7 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </nav>
  );
}

export default Navbar;
