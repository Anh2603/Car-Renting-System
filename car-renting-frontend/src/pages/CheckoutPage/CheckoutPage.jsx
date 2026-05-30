import React, { useState } from 'react';
import { DarkNavbar } from '../../components/Navbar/Navbar';
import { FleetFooter } from '../../components/Footer/Footer';
import { formatDateLabel } from '../../utils/bookingFormat';
import { useLanguage } from '../../i18n/LanguageContext';
import './CheckoutPage.css';

function CheckoutPage({ booking, car, createdBooking, onPay, onHome }) {
  const { t } = useLanguage();
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_CARD');
  const [paying, setPaying] = useState(false);

  const days = createdBooking?.rental_days || booking?.days || 5;

  // Support both old local data fields and backend/MySQL fields
  const carPrice = Number(car?.price || car?.price_per_day || 0);
  const carImage = car?.image || car?.image_url;
  const total = Number(createdBooking?.total_price || carPrice * days);

  const paymentMethods = [
    { value: 'BANK_CARD', label: t('checkout.bankCard'), note: t('checkout.bankCardNote') },
    { value: 'CASH', label: t('checkout.cash'), note: t('checkout.cashNote') },
  ];

  const isCashPayment = paymentMethod === 'CASH';

  const handleCardNum = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNum(raw.match(/.{1,4}/g)?.join(' ') || raw);
  };

  const handleExpiry = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setExpiry(raw.length > 2 ? `${raw.slice(0, 2)} / ${raw.slice(2)}` : raw);
  };

  const validateCardPayment = () => {
    const cleanCardNum = cardNum.replace(/\s/g, '');

    if (cleanCardNum.length < 16) {
      alert(t('checkout.alerts.card'));
      return false;
    }

    if (expiry.replace(/\D/g, '').length < 4) {
      alert(t('checkout.alerts.expiry'));
      return false;
    }

    if (cvv.length < 3) {
      alert(t('checkout.alerts.cvv'));
      return false;
    }

    return true;
  };

  const handlePayClick = async () => {
    try {
      if (!isCashPayment && !validateCardPayment()) {
        return;
      }

      setPaying(true);
      await onPay(paymentMethod);
    } finally {
      setPaying(false);
    }
  };

  if (!car) {
    return (
      <div className="checkout-page">
        <DarkNavbar onHome={onHome} />
        <div className="checkout-header">
          <h1 className="checkout-title">{t('checkout.noCarTitle')}</h1>
          <p className="checkout-subtitle">{t('checkout.noCarSubtitle')}</p>
        </div>
        <FleetFooter />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <DarkNavbar onHome={onHome} />

      <div className="checkout-header">
        <h1 className="checkout-title">{t('checkout.title')}</h1>
        <p className="checkout-subtitle">
          {t('checkout.subtitle')}
        </p>
      </div>

      <div className="checkout-main">
        <div className="checkout-summary-card">
          <div className="checkout-car-img-wrap">
            <span className="selected-vehicle-badge">{t('checkout.selectedVehicle')}</span>

            {carImage ? (
              <img
                src={carImage}
                alt={car.name}
                className="checkout-car-img"
              />
            ) : (
              <div className="checkout-car-placeholder">
                <svg width="100" height="50" viewBox="0 0 120 60" fill="none">
                  <rect x="10" y="20" width="100" height="28" rx="6" fill="#1E3A5F"/>
                  <rect x="25" y="10" width="70" height="22" rx="5" fill="#1E3A5F"/>
                  <circle cx="28" cy="50" r="9" fill="#0A192F" stroke="#22D3EE" strokeWidth="2"/>
                  <circle cx="92" cy="50" r="9" fill="#0A192F" stroke="#22D3EE" strokeWidth="2"/>
                </svg>
              </div>
            )}
          </div>

          <div className="checkout-summary-body">
            <h2 className="checkout-car-name">{car.name}</h2>

            <div className="checkout-location">
              <svg width="10" height="13" viewBox="0 0 10 13" fill="none">
                <path
                  d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 8 5 8s5-4.25 5-8C10 2.24 7.76 0 5 0zm0 6.75A1.75 1.75 0 1 1 5 3.25a1.75 1.75 0 0 1 0 3.5z"
                  fill="#64748B"
                />
              </svg>
              <span>{createdBooking?.pickup_location || booking?.location || 'Tan Son Nhat International Airport (SGN)'}</span>
            </div>

            <div className="checkout-divider" />

            <div className="checkout-dates-row">
              <div className="checkout-date-col">
                <p className="checkout-date-label">{t('checkout.pickup').toUpperCase()}</p>
                <p className="checkout-date-value">
                  {createdBooking?.pickup_date || formatDateLabel(booking?.pickupDate, 'Nov 14, 2026')}
                </p>
                <p className="checkout-date-time">
                  {createdBooking?.pickup_time || booking?.pickupTime || '09:00 AM'}
                </p>
              </div>

              <div className="checkout-date-col">
                <p className="checkout-date-label">{t('checkout.return').toUpperCase()}</p>
                <p className="checkout-date-value">
                  {createdBooking?.return_date || formatDateLabel(booking?.returnDate, 'Nov 19, 2026')}
                </p>
                <p className="checkout-date-time">
                  {createdBooking?.return_time || booking?.returnTime || '06:30 PM'}
                </p>
              </div>
            </div>

            <div className="checkout-divider" />

            <div className="checkout-duration-row">
              <span className="checkout-duration-label">{t('checkout.duration')}</span>
              <span className="checkout-duration-val">{days} {t('checkout.days')}</span>
            </div>

            <div className="checkout-divider" />

            <div className="checkout-rate-row">
              <span className="checkout-rate-label">{t('checkout.dailyRate')}</span>
              <span className="checkout-rate-val">
                {carPrice.toLocaleString('vi-VN')} VND
              </span>
            </div>

            <div className="checkout-total-row">
              <span className="checkout-total-label">{t('checkout.total')}</span>
              <span className="checkout-total-val">
                {total.toLocaleString('vi-VN')} VND
              </span>
            </div>
          </div>
        </div>

        <div className="payment-card">
          <h2 className="payment-title">{t('checkout.paymentMethod')}</h2>

          <div className="payment-method-grid payment-method-grid--two">
            {paymentMethods.map((method) => (
              <button
                key={method.value}
                className={`payment-method-btn ${paymentMethod === method.value ? 'payment-method-btn--active' : ''}`}
                type="button"
                onClick={() => setPaymentMethod(method.value)}
              >
                <span>{method.label}</span>
                <small>{method.note}</small>
              </button>
            ))}
          </div>

          {isCashPayment ? (
            <div className="payment-cash-note">
              <h3>{t('checkout.payAtPickup')}</h3>
              <p>
                {t('checkout.cashDescription')}
              </p>
              <div className="payment-cash-summary">
                <span>{t('checkout.amountDueAtPickup')}</span>
                <strong>{total.toLocaleString('vi-VN')} VND</strong>
              </div>
            </div>
          ) : (
            <>
              <div className="payment-demo-note">
                {t('checkout.demoNote')}
              </div>

              <div className="payment-card-fields">
                <div className="payment-field">
                  <label className="payment-label">{t('checkout.cardNumber').toUpperCase()}</label>
                  <div className="payment-input-wrap">
                    <input
                      className="payment-input"
                      type="text"
                      inputMode="numeric"
                      placeholder="XXXX XXXX XXXX XXXX"
                      value={cardNum}
                      onChange={handleCardNum}
                      maxLength={19}
                    />
                    <div className="payment-card-icons">
                      <span className="card-icon-box" />
                      <span className="card-icon-box" />
                    </div>
                  </div>
                </div>

                <div className="payment-row">
                  <div className="payment-field">
                    <label className="payment-label">{t('checkout.expiryDate').toUpperCase()}</label>
                    <input
                      className="payment-input"
                      type="text"
                      inputMode="numeric"
                      placeholder="MM / YY"
                      value={expiry}
                      onChange={handleExpiry}
                      maxLength={7}
                    />
                  </div>

                  <div className="payment-field">
                    <label className="payment-label">CVV</label>
                    <div className="payment-input-wrap">
                      <input
                        className="payment-input"
                        type="password"
                        placeholder="•••"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        maxLength={3}
                      />
                      <div className="cvv-icon">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="6.5" stroke="#94A3B8" strokeWidth="1.2"/>
                          <path d="M8 7v5" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round"/>
                          <circle cx="8" cy="5" r="0.7" fill="#94A3B8"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div style={{ flex: 1 }} />

          <button
            className="confirm-pay-btn"
            onClick={handlePayClick}
            disabled={paying}
          >
            {paying
              ? t('checkout.processing').toUpperCase()
              : isCashPayment
                ? t('checkout.confirmBooking').toUpperCase()
                : t('checkout.confirmPay').toUpperCase()}
          </button>
        </div>
      </div>

      <FleetFooter />
    </div>
  );
}

export default CheckoutPage;
