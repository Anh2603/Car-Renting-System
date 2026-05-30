import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import './MenuOverlay.css';

const MAIN_MENU_KEYS = ['home', 'book', 'fleet', 'guide', 'contact', 'terms'];

function MenuOverlay({ isOpen, onClose, onNavigate }) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleClick = (key) => {
    onNavigate(key);
    onClose();
  };

  return (
    <div className="menu-overlay">
      <div className="menu-overlay-topbar">
        <div className="menu-brand">
          <div className="menu-brand-mark">CR</div>

          <div>
            <div className="menu-brand-title">The Car Renting System</div>
            <div className="menu-brand-subtitle">{t('menu.brandSubtitle')}</div>
          </div>
        </div>

        <button
          className="menu-close-btn"
          type="button"
          onClick={onClose}
          aria-label={t('menu.close')}
        >
          ×
        </button>
      </div>

      <div className="menu-overlay-content menu-overlay-content--single">
        <div className="menu-column">
          <p className="menu-section-label">{t('menu.sectionLabel')}</p>

          <div className="menu-list">
            {MAIN_MENU_KEYS.map((key) => (
              <button
                key={key}
                className="menu-item"
                type="button"
                onClick={() => handleClick(key)}
              >
                <span className="menu-item-copy">
                  <strong>{t(`menu.items.${key}.label`)}</strong>
                  <small>{t(`menu.items.${key}.description`)}</small>
                </span>

                <span className="menu-item-arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuOverlay;
