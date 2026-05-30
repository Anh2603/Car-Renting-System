import React, { useState } from 'react';
import './ChangePasswordPage.css';
import { changeMyPassword } from '../../services/authService';

function ChangePasswordPage({ user, onHome, onBack }) {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      setLoading(true);
      await changeMyPassword(form);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('Password changed successfully. Please use the new password on your next login.');
    } catch (error) {
      setMessage(error.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="password-page">
      <section className="password-panel">
        <div className="password-topbar">
          <button type="button" className="password-back-btn" onClick={onBack || onHome}>
            ← Back
          </button>
          <button type="button" className="password-home-btn" onClick={onHome}>
            Home
          </button>
        </div>

        <div className="password-card">
          <div className="password-heading">
            <p>Account security</p>
            <h1>Change Password</h1>
            <span>{user?.email || 'Secure your account'}</span>
          </div>

          <form className="password-form" onSubmit={handleSubmit}>
            <label>
              <span>Current password</span>
              <input
                type="password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                required
              />
            </label>

            <label>
              <span>New password</span>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="At least 6 characters"
                minLength="6"
                required
              />
            </label>

            <label>
              <span>Confirm new password</span>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter new password"
                minLength="6"
                required
              />
            </label>

            <div className="password-rules">
              <strong>Password rules</strong>
              <span>Use at least 6 characters.</span>
              <span>New password must be different from the current password.</span>
              <span>Admin cannot see your password because it is stored as a hash.</span>
            </div>

            {message && <p className="password-message">{message}</p>}

            <button type="submit" className="password-submit-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default ChangePasswordPage;
