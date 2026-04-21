import React, { useState } from 'react';
import { DarkNavbar } from '../../components/Navbar/Navbar';
import { FleetFooter } from '../../components/Footer/Footer';
import './CheckoutPage.css';

/* ===== CHECKOUT / PAYMENT PAGE =====
 * Props:
 *   booking — state thông tin đặt xe
 *   car     — xe đã chọn
 *   onPay   — xác nhận thanh toán → SuccessPage
 *   onHome  — quay về trang chủ
 */
function CheckoutPage({ booking, car, onPay, onHome }) {
  const [cardNum, setCardNum] = useState('');
  const [expiry,  setExpiry]  = useState('');
  const [cvv,     setCvv]     = useState('');

  const days  = booking.days || 5;
  const total = car.price * days;

  /* Format số thẻ 4-4-4-4 */
  const handleCardNum = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNum(raw.match(/.{1,4}/g)?.join(' ') || raw);
  };

  /* Format ngày hết hạn MM / YY */
  const handleExpiry = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setExpiry(raw.length > 2 ? `${raw.slice(0, 2)} / ${raw.slice(2)}` : raw);
  };

  return (
    <div className="checkout-page">
      <DarkNavbar onHome={onHome} />

      {/* ─── Header ─── */}
      <div className="checkout-header">
        <h1 className="checkout-title">Secure Checkout</h1>
        <p className="checkout-subtitle">
          Review your booking details and choose your preferred payment method.
        </p>
      </div>

      {/* ─── Main 2-column grid ─── */}
      <div className="checkout-main">

        {/* ═══ CỘT TRÁI: Booking Summary ═══ */}
        <div className="checkout-summary-card">

          {/* Ảnh xe */}
          <div className="checkout-car-img-wrap">
            <span className="selected-vehicle-badge">SELECTED VEHICLE</span>
            {car.image ? (
              <img
                src={car.image}
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

          {/* Thông tin booking */}
          <div className="checkout-summary-body">
            {/* Tên xe */}
            <h2 className="checkout-car-name">{car.name}</h2>

            {/* Địa điểm */}
            <div className="checkout-location">
              <svg width="10" height="13" viewBox="0 0 10 13" fill="none">
                <path d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 8 5 8s5-4.25 5-8C10 2.24 7.76 0 5 0zm0 6.75A1.75 1.75 0 1 1 5 3.25a1.75 1.75 0 0 1 0 3.5z" fill="#64748B"/>
              </svg>
              <span>{booking.location || 'Tan Son Nhat International Airport (SGN)'}</span>
            </div>

            {/* Divider */}
            <div className="checkout-divider" />

            {/* Ngày đón / trả */}
            <div className="checkout-dates-row">
              <div className="checkout-date-col">
                <p className="checkout-date-label">PICKUP</p>
                <p className="checkout-date-value">
                  Nov {booking.pickupDate || 14}, 2026
                </p>
                <p className="checkout-date-time">{booking.pickupTime || '09:00 AM'}</p>
              </div>
              <div className="checkout-date-col">
                <p className="checkout-date-label">RETURN</p>
                <p className="checkout-date-value">
                  Nov {booking.returnDate || 19}, 2026
                </p>
                <p className="checkout-date-time">{booking.returnTime || '06:30 PM'}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="checkout-divider" />

            {/* Duration */}
            <div className="checkout-duration-row">
              <span className="checkout-duration-label">Duration</span>
              <span className="checkout-duration-val">{days} Days</span>
            </div>

            {/* Divider */}
            <div className="checkout-divider" />

            {/* Daily Rate */}
            <div className="checkout-rate-row">
              <span className="checkout-rate-label">Daily Rate</span>
              <span className="checkout-rate-val">
                {car.price.toLocaleString('vi-VN')} VND
              </span>
            </div>

            {/* Total */}
            <div className="checkout-total-row">
              <span className="checkout-total-label">Total</span>
              <span className="checkout-total-val">
                {total.toLocaleString('vi-VN')} VND
              </span>
            </div>
          </div>
        </div>

        {/* ═══ CỘT PHẢI: Payment Form ═══ */}
        <div className="payment-card">
          <h2 className="payment-title">Payment Method</h2>

          {/* Bank Card tab button */}
          <button className="payment-method-btn" type="button">
            <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
              <rect x="1" y="1" width="18" height="14" rx="2.5" stroke="#fff" strokeWidth="1.5"/>
              <path d="M1 5h18" stroke="#fff" strokeWidth="1.5"/>
            </svg>
            Bank Card
          </button>

          {/* Card Number */}
          <div className="payment-field">
            <label className="payment-label">CARD NUMBER</label>
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
              {/* Card type icons placeholder */}
              <div className="payment-card-icons">
                <span className="card-icon-box" />
                <span className="card-icon-box" />
              </div>
            </div>
          </div>

          {/* Expiry + CVV row */}
          <div className="payment-row">
            <div className="payment-field">
              <label className="payment-label">EXPIRY DATE</label>
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
                  onChange={(e) => setCvv(e.target.value.slice(0, 3))}
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

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* CONFIRM & PAY */}
          <button className="confirm-pay-btn" onClick={onPay}>
            CONFIRM &amp; PAY
          </button>
        </div>

      </div>

      <FleetFooter />
    </div>
  );
}

export default CheckoutPage;
