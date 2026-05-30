import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import './Navbar.css';

const AccountIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
    <path
      d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const GlobeIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M12 3c2.4 2.5 3.6 5.5 3.6 9S14.4 18.5 12 21c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const MenuIcon = () => (
  <svg width="28" height="22" viewBox="0 0 28 22" fill="none" aria-hidden="true">
    <path
      d="M2 2h24M2 11h24M2 20h24"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem('user');

    if (!rawUser) return null;

    return JSON.parse(rawUser);
  } catch (error) {
    return null;
  }
};

const getDisplayName = (user) => {
  const storedUser = user || getStoredUser();

  const fullName =
    storedUser?.full_name ||
    storedUser?.fullName ||
    storedUser?.name ||
    storedUser?.username ||
    storedUser?.email ||
    '';

  if (!fullName) return 'Customer';

  if (fullName.includes('@')) {
    return fullName.split('@')[0];
  }

  return fullName.split(' ')[0];
};

function Navbar({
  onHome,
  onLogin,
  onMyBookings,
  onMenu,
  onProfile,
  onChangePassword,
  onLogout,
  onAdminPanel,
  onStaffPanel,
  isLoggedIn = false,
  user = null,
  variant = 'home',
}) {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const storedUser = user || getStoredUser();
  const displayName = getDisplayName(storedUser);
  const { languageLabel, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setIsAccountOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleLogoClick = () => {
    if (onHome) onHome();
  };

  const handleAccountClick = () => {
    if (!isLoggedIn) {
      if (onLogin) onLogin();
      return;
    }

    setIsAccountOpen((current) => !current);
  };

  const handleProfileClick = () => {
    setIsAccountOpen(false);

    if (onProfile) {
      onProfile();
      return;
    }

    alert(t('navbar.myProfile')); 
  };

  const handleChangePasswordClick = () => {
    setIsAccountOpen(false);

    if (onChangePassword) {
      onChangePassword();
      return;
    }

    alert(t('navbar.changePassword')); 
  };

  const handleMyBookingsClick = () => {
    setIsAccountOpen(false);

    if (onMyBookings) onMyBookings();
  };

  const handlePanelClick = () => {
    setIsAccountOpen(false);

    if (storedUser?.role === 'ADMIN' && onAdminPanel) {
      onAdminPanel();
      return;
    }

    if (storedUser?.role === 'STAFF' && onStaffPanel) {
      onStaffPanel();
    }
  };

  const handleLogoutClick = () => {
    setIsAccountOpen(false);

    if (onLogout) {
      onLogout();
      return;
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <nav className={`site-navbar site-navbar--${variant}`}>
      <div className="site-navbar__inner">
        <button className="site-navbar__brand" type="button" onClick={handleLogoClick}>
          <span className="site-navbar__brand-mark">CR</span>

          <span className="site-navbar__brand-text">
            <span>The Car Renting System</span>
            <small>{t('navbar.tagline')}</small>
          </span>
        </button>

        <div className="site-navbar__actions">
          <div className="site-navbar__account-wrap" ref={accountRef}>
            <button className="site-navbar__action" type="button" onClick={handleAccountClick}>
              <AccountIcon />

              <span className="site-navbar__account-label">
                {isLoggedIn ? `${t('navbar.hello')}, ${displayName}` : t('navbar.login')}
              </span>

              {isLoggedIn && (
                <span className={`site-navbar__account-chevron ${isAccountOpen ? 'is-open' : ''}`}>
                  ▾
                </span>
              )}
            </button>

            {isLoggedIn && isAccountOpen && (
              <div className="account-dropdown">
                <div className="account-dropdown__header">
                  <strong>{storedUser?.full_name || storedUser?.name || displayName}</strong>
                  <span>{storedUser?.email || t('navbar.customerAccount')}</span>
                </div>

                <button type="button" onClick={handleProfileClick}>
                  {t('navbar.myProfile')}
                </button>

                <button type="button" onClick={handleChangePasswordClick}>
                  {t('navbar.changePassword')}
                </button>

                {storedUser?.role === 'USER' && (
                  <button type="button" onClick={handleMyBookingsClick}>
                    {t('navbar.myBookings')}
                  </button>
                )}

                {storedUser?.role === 'ADMIN' && (
                  <button type="button" onClick={handlePanelClick}>
                    {t('navbar.adminPanel')}
                  </button>
                )}

                {storedUser?.role === 'STAFF' && (
                  <button type="button" onClick={handlePanelClick}>
                    {t('navbar.staffPanel')}
                  </button>
                )}

                <button
                  className="account-dropdown__danger"
                  type="button"
                  onClick={handleLogoutClick}
                >
                  {t('navbar.logout')}
                </button>
              </div>
            )}
          </div>

          <button
            className="site-navbar__action site-navbar__language"
            type="button"
            onClick={toggleLanguage}
            title={t('navbar.switchLanguage')}
            aria-label={t('navbar.switchLanguage')}
          >
            <GlobeIcon />
            <span>{languageLabel}</span>
          </button>

          <button className="site-navbar__menu-btn" type="button" onClick={onMenu}>
            <MenuIcon />
            <span>{t('navbar.menu')}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export function DarkNavbar({
  onHome,
  onLogin,
  onMyBookings,
  onMenu,
  onProfile,
  onChangePassword,
  onLogout,
  onAdminPanel,
  onStaffPanel,
  isLoggedIn = false,
  user = null,
}) {
  return (
    <Navbar
      variant="dark"
      onHome={onHome}
      onLogin={onLogin}
      onMyBookings={onMyBookings}
      onMenu={onMenu}
      onProfile={onProfile}
      onChangePassword={onChangePassword}
      onLogout={onLogout}
      onAdminPanel={onAdminPanel}
      onStaffPanel={onStaffPanel}
      isLoggedIn={isLoggedIn}
      user={user}
    />
  );
}

export default Navbar;