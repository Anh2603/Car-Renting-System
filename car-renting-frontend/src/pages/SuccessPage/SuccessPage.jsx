import React, { useMemo } from 'react';
import './SuccessPage.css';

/* ===== SUCCESS PAGE =====
 * Hiển thị sau khi thanh toán thành công
 * Props:
 *   car     — xe đã đặt
 *   booking — thông tin đặt xe
 *   onHome  — quay về trang chủ
 */
function SuccessPage({ car, booking, onHome }) {
  /* Tạo mã đặt xe ngẫu nhiên (chỉ tạo 1 lần) */
  const bookingRef = useMemo(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code   = Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
    return `NTC-${code}`;
  }, []);

  const days  = booking.days || 5;
  const total = car.price * days;

  return (
    <div className="success-page">
      {/* Icon check */}
      <div className="success-icon-wrap">
        <div className="success-icon-circle">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path
              d="M8 18l7 7 13-13"
              stroke="#00d4ff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {/* Vòng tròn trang trí */}
        <div className="success-ring success-ring--1" />
        <div className="success-ring success-ring--2" />
      </div>

      {/* Tiêu đề */}
      <h1 className="success-title">Booking Confirmed!</h1>
      <p className="success-sub">
        Your <strong>{car.name}</strong> has been booked successfully.
        <br />
        {days} days — Nov {booking.pickupDate || 14} to Nov {booking.returnDate || 19}, 2026.
      </p>

      {/* Mã đặt xe */}
      <div className="success-ref-box">
        <p className="success-ref-label">Booking Reference</p>
        <p className="success-ref-val">{bookingRef}</p>
      </div>

      {/* Tóm tắt giá */}
      <div className="success-price-row">
        <span className="success-price-label">Total Paid</span>
        <span className="success-price-val">{total.toLocaleString('vi-VN')} VND</span>
      </div>

      <p className="success-email-note">
        A confirmation email will be sent to your inbox shortly.
      </p>

      {/* Nút về trang chủ */}
      <button className="success-home-btn" onClick={onHome}>
        Back to Home
      </button>
    </div>
  );
}

export default SuccessPage;
