import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import './Footer.css';

const NAV_ITEMS = [
  { key: 'home', labelKey: 'footer.home' },
  { key: 'book', labelKey: 'footer.book' },
  { key: 'fleet', labelKey: 'footer.fleet' },
  { key: 'contact', labelKey: 'footer.contact' },
  { key: 'terms', labelKey: 'footer.terms', policyKey: 'terms' },
];

const OFFICIAL_ITEMS = [
  { key: 'rental', labelKey: 'footer.rentalPolicy' },
  { key: 'cancellation', labelKey: 'footer.cancellationPolicy' },
  { key: 'pickup', labelKey: 'footer.pickupPolicy' },
  { key: 'payment', labelKey: 'footer.paymentPolicy' },
];

function emitFooterNavigation(target) {
  window.dispatchEvent(
    new CustomEvent('car-rental:footer-navigate', {
      detail: { target },
    })
  );
}

function getPolicy(t, key) {
  const rawPolicy = t(`footer.policies.${key}`, null);

  if (!rawPolicy) return null;

  return {
    ...rawPolicy,
    sections: (rawPolicy.sections || []).map(([heading, text]) => ({ heading, text })),
  };
}

function FooterPolicyModal({ policy, onClose }) {
  const { t } = useLanguage();

  if (!policy) return null;

  return (
    <div className="footer-policy-backdrop" onClick={onClose}>
      <article className="footer-policy-modal" onClick={(event) => event.stopPropagation()}>
        <button
          className="footer-policy-close"
          type="button"
          onClick={onClose}
          aria-label={t('footer.closePolicy')}
        >
          ×
        </button>

        <p className="footer-policy-eyebrow">{policy.eyebrow}</p>
        <h2>{policy.title}</h2>
        <p className="footer-policy-intro">{policy.intro}</p>

        <div className="footer-policy-sections">
          {policy.sections.map((section) => (
            <section key={section.heading}>
              <h3>{section.heading}</h3>
              <p>{section.text}</p>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}

export function FleetFooter() {
  const [activePolicyKey, setActivePolicyKey] = useState(null);
  const { t } = useLanguage();
  const activePolicy = activePolicyKey ? getPolicy(t, activePolicyKey) : null;

  const handleNavigate = (item) => {
    if (item.policyKey) {
      setActivePolicyKey(item.policyKey);
      return;
    }

    emitFooterNavigation(item.key);
  };

  return (
    <>
      <footer className="fleet-footer">
        <div className="fleet-footer-inner">
          <div className="fleet-footer-column">
            <h3>{t('footer.navigate')}</h3>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                className="fleet-footer-link"
                type="button"
                onClick={() => handleNavigate(item)}
              >
                {t(item.labelKey)}
              </button>
            ))}
          </div>

          <div className="fleet-footer-column fleet-footer-column--official">
            <h3>{t('footer.official')}</h3>
            {OFFICIAL_ITEMS.map((item) => (
              <button
                key={item.key}
                className="fleet-footer-link"
                type="button"
                onClick={() => setActivePolicyKey(item.key)}
              >
                {t(item.labelKey)}
              </button>
            ))}
          </div>

          <div className="fleet-footer-column fleet-footer-support">
            <h3>{t('footer.support')}</h3>
            <p>{t('footer.hours')}</p>
            <div className="fleet-footer-contact-list">
              <span>{t('footer.hotline')}</span>
              <span>{t('footer.email')}</span>
              <span>{t('footer.pickupSupport')}</span>
            </div>
            <p className="fleet-footer-copy">{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>

      <FooterPolicyModal policy={activePolicy} onClose={() => setActivePolicyKey(null)} />
    </>
  );
}

export default FleetFooter;
