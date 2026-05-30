import React, { useEffect, useMemo, useState } from 'react';
import './ProfilePage.css';
import { getMyProfile, updateMyProfile } from '../../services/authService';

const getRoleLabel = (role) => {
  if (role === 'ADMIN') return 'Admin Account';
  if (role === 'STAFF') return 'Staff Account';
  return 'Customer Account';
};

function ProfilePage({ user, onHome, onBack, onChangePassword, onUserUpdate }) {
  const [form, setForm] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [account, setAccount] = useState(user || null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const roleLabel = useMemo(() => getRoleLabel(account?.role || user?.role), [account, user]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const profile = await getMyProfile();
        setAccount(profile);
        setForm({
          fullName: profile?.full_name || '',
          email: profile?.email || '',
          phone: profile?.phone || '',
        });
        if (onUserUpdate) onUserUpdate(profile);
      } catch (error) {
        setMessage(error.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [onUserUpdate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      setLoading(true);
      const updatedUser = await updateMyProfile(form);
      setAccount(updatedUser);
      setForm({
        fullName: updatedUser?.full_name || '',
        email: updatedUser?.email || '',
        phone: updatedUser?.phone || '',
      });
      if (onUserUpdate) onUserUpdate(updatedUser);
      setMessage('Profile updated successfully.');
    } catch (error) {
      setMessage(error.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="profile-page">
      <section className="profile-panel">
        <div className="profile-topbar">
          <button type="button" className="profile-back-btn" onClick={onBack || onHome}>
            ← Back
          </button>
          <button type="button" className="profile-home-btn" onClick={onHome}>
            Home
          </button>
        </div>

        <div className="profile-heading">
          <p>Account settings</p>
          <h1>My Profile</h1>
          <span>{roleLabel}</span>
        </div>

        <div className="profile-layout">
          <aside className="profile-summary-card">
            <div className="profile-avatar">
              {(account?.full_name || account?.email || 'CR').slice(0, 2).toUpperCase()}
            </div>
            <h2>{account?.full_name || 'Account User'}</h2>
            <p>{account?.email || 'No email available'}</p>

            <div className="profile-summary-list">
              <div>
                <span>Role</span>
                <strong>{account?.role || 'USER'}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{account?.status || 'ACTIVE'}</strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>{account?.phone || 'Not provided'}</strong>
              </div>
            </div>
          </aside>

          <form className="profile-form-card" onSubmit={handleSubmit}>
            <div className="profile-form-header">
              <div>
                <p>Editable information</p>
                <h2>Update account details</h2>
              </div>
              <button type="button" className="profile-link-btn" onClick={onChangePassword}>
                Change Password
              </button>
            </div>

            <label>
              <span>Full name</span>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </label>

            <label>
              <span>Email address</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
              />
            </label>

            <label>
              <span>Phone number</span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </label>

            <div className="profile-note">
              Role and account status are controlled by Admin. Staff and customers can only update their own contact information.
            </div>

            {message && <p className="profile-message">{message}</p>}

            <button type="submit" className="profile-submit-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default ProfilePage;
