import React from 'react';
import { DarkNavbar } from '../../components/Navbar/Navbar';
import { FleetFooter } from '../../components/Footer/Footer';
import './ConfirmPage.css';

/* ===== CONFIRM CAR SELECTION PAGE =====
 * Props:
 *   booking — state thông tin đặt xe (số ngày, ngày, giờ)
 *   car     — object xe đã chọn
 *   onNext  — chuyển sang trang Checkout
 *   onHome  — quay về trang chủ
 */
function ConfirmPage({ booking, car, onNext, onHome }) {
  const days  = booking.days || 3;
  const total = car.price * days;

  return (
    <div className="confirm-page">
      <DarkNavbar onHome={onHome} />

      {/* ===== HEADER ===== */}
      <div className="confirm-header">
        <h1 className="confirm-page-title">Confirm Your Selection</h1>
      </div>

      {/* ===== MAIN CARD ===== */}
      <div className="confirm-container">
        <div className="confirm-card">

          {/* ===== CỘT TRÁI: Hình xe + tên + thông số ===== */}
          <div className="confirm-left">
            {/* Khung tối hiển thị xe */}
            <div className="confirm-car-display">
              {car.image ? (
                <img
                  src={car.image}
                  alt={car.name}
                  className="confirm-car-img"
                />
              ) : (
                <div className="confirm-car-placeholder">
                  <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
                    <rect x="10" y="20" width="100" height="28" rx="6" fill="#1E3A5F"/>
                    <rect x="25" y="10" width="70" height="22" rx="5" fill="#1E3A5F"/>
                    <circle cx="28" cy="50" r="9" fill="#0A192F" stroke="#22D3EE" strokeWidth="2"/>
                    <circle cx="92" cy="50" r="9" fill="#0A192F" stroke="#22D3EE" strokeWidth="2"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Tên xe */}
            <h2 className="confirm-car-name">{car.name}</h2>

            {/* Thông số xe */}
            <div className="confirm-car-attrs">
              <span className="confirm-attr">
                {/* Seats icon */}
                <svg width="18" height="16" viewBox="0 0 20 16" fill="none">
                  <path d="M2 14c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#22D3EE" strokeWidth="1.5"/>
                  <circle cx="10" cy="5" r="3.5" stroke="#22D3EE" strokeWidth="1.5"/>
                </svg>
                {car.seats} SEATS
              </span>
              <span className="confirm-attr">
                {/* Bags icon */}
                <svg width="14" height="18" viewBox="0 0 14 20" fill="none">
                  <rect x="1" y="2" width="12" height="16" rx="2" stroke="#22D3EE" strokeWidth="1.5"/>
                  <path d="M4 7h6M4 11h4" stroke="#22D3EE" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {car.bags} BAGS
              </span>
              <span className="confirm-attr">
                {/* Transmission icon */}
                <svg width="22" height="16" viewBox="0 0 24 18" fill="none">
                  <circle cx="4"  cy="9" r="3" stroke="#22D3EE" strokeWidth="1.5"/>
                  <circle cx="12" cy="9" r="3" stroke="#22D3EE" strokeWidth="1.5"/>
                  <circle cx="20" cy="9" r="3" stroke="#22D3EE" strokeWidth="1.5"/>
                  <path d="M7 9h2M15 9h2" stroke="#22D3EE" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                AUTOMATIC
              </span>
              <span className="confirm-attr">
                {/* A/C icon */}
                <svg width="20" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10a6 6 0 0 1 12 0" stroke="#22D3EE" strokeWidth="1.5"/>
                  <path d="M3 14h14" stroke="#22D3EE" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M10 17v-3" stroke="#22D3EE" strokeWidth="1.5"/>
                </svg>
                AIR CONDITIONING
              </span>
            </div>
          </div>

          {/* ===== CỘT PHẢI: Chi tiết đặt xe ===== */}
          <div className="confirm-right">

            {/* Booking Option */}
            <div className="confirm-section">
              <p className="confirm-section-label">BOOKING OPTION</p>
              <div className="confirm-option-card confirm-option-card--selected">
                <div className="confirm-option-left">
                  <div className="confirm-radio">
                    <div className="confirm-radio-inner" />
                  </div>
                  <div>
                    <p className="confirm-option-title">Best price</p>
                    <p className="confirm-option-sub">Prepaid at selection</p>
                  </div>
                </div>
                <span className="confirm-badge">INCLUDED</span>
              </div>
            </div>

            {/* Kilometer Package */}
            <div className="confirm-section">
              <p className="confirm-section-label">KILOMETER PACKAGE</p>
              <div className="confirm-km-card">
                <div className="confirm-option-left">
                  {/* Speedometer icon */}
                  <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
                    <path d="M12 3C6.48 3 2 7.48 2 13h4l-1.5 2.5h11L14 13h4c0-5.52-4.48-10-10-10z" stroke="#22D3EE" strokeWidth="1.5" fill="none"/>
                    <path d="M7 13l3.5-3 1.5 1.5 3-4.5" stroke="#22D3EE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="confirm-option-title">Unlimited kilometers</span>
                </div>
                <span className="confirm-km-badge">INCLUDED</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="price-box">
              <p className="price-daily-label">DAILY RATE</p>
              <div className="price-amount-row">
                <span className="price-amount">{car.price.toLocaleString('vi-VN')}</span>
                <span className="price-unit"> VND / day</span>
              </div>
              <div className="price-total-row">
                <span className="price-total-label">Estimated Total ({days} days)</span>
                <span className="price-total-val">{total.toLocaleString('vi-VN')} VNĐ</span>
              </div>
            </div>

            {/* Nút NEXT */}
            <button className="next-btn" onClick={onNext}>
              <span>NEXT</span>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 9h12M11 5l4 4-4 4" stroke="#0A192F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

        </div>
      </div>

      <FleetFooter />
    </div>
  );
}

export default ConfirmPage;
