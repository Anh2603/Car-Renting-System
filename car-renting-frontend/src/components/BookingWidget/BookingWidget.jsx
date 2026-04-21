import React from 'react';
import './BookingWidget.css';

/* ===== BOOKING WIDGET =====
 * Widget tìm kiếm xe trên trang Hero
 * Props:
 *   booking        — state thông tin đặt xe
 *   setBooking     — setter để cập nhật địa điểm
 *   onSearch       — click nút SHOW CARS
 *   onOpenCalendar — click vào trường ngày giờ
 */
function BookingWidget({ booking, setBooking, onSearch, onOpenCalendar }) {
  return (
    <div className="widget-wrapper">
      <div className="booking-widget">
        {/* Tab "Cars" */}
        <div className="booking-tabs">
          <button className="booking-tab">
            {/* Icon xe */}
            <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
              <path d="M3 8h12M1 5l2-4h10l2 4M2 8v5h2v-1h10v1h2V8" stroke="#00d4ff" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="5" cy="11" r="1.5" fill="#00d4ff" />
              <circle cx="13" cy="11" r="1.5" fill="#00d4ff" />
            </svg>
            Cars
          </button>
        </div>

        {/* Hàng input */}
        <div className="booking-inputs">
          {/* Địa điểm đón/trả */}
          <div className="booking-field booking-field--location">
            <div className="booking-label">Pickup & Return Location</div>
            <div className="booking-input-box">
              <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                <path d="M8 0C4.686 0 2 2.686 2 6c0 5.25 6 14 6 14s6-8.75 6-14c0-3.314-2.686-6-6-6zm0 8.5A2.5 2.5 0 1 1 8 3.5a2.5 2.5 0 0 1 0 5z" fill="#00d4ff" />
              </svg>
              <input
                className="booking-input-text"
                type="text"
                placeholder="Enter City, Airport or Station"
                value={booking.location}
                onChange={(e) => setBooking((b) => ({ ...b, location: e.target.value }))}
              />
            </div>
          </div>

          {/* Ngày giờ đón */}
          <div className="booking-field" onClick={onOpenCalendar} style={{ cursor: 'pointer' }}>
            <div className="booking-label">Pickup Date & Time</div>
            <div className="booking-input-box">
              <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                <rect x="1" y="3" width="16" height="16" rx="2" stroke="#00d4ff" strokeWidth="1.5" />
                <path d="M5 1v4M13 1v4M1 8h16" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className={booking.pickupDate ? 'booking-input-value' : 'booking-input-placeholder'}>
                {booking.pickupDate
                  ? `Nov ${booking.pickupDate} | ${booking.pickupTime}`
                  : 'Pick-up date'}
              </span>
            </div>
          </div>

          {/* Ngày giờ trả */}
          <div className="booking-field" onClick={onOpenCalendar} style={{ cursor: 'pointer' }}>
            <div className="booking-label">Return Date & Time</div>
            <div className="booking-input-box">
              <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                <rect x="1" y="3" width="16" height="16" rx="2" stroke="#00d4ff" strokeWidth="1.5" />
                <path d="M5 1v4M13 1v4M1 8h16" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className={booking.returnDate ? 'booking-input-value' : 'booking-input-placeholder'}>
                {booking.returnDate
                  ? `Nov ${booking.returnDate} | ${booking.returnTime}`
                  : 'Return date'}
              </span>
            </div>
          </div>

          {/* Nút tìm xe */}
          <button className="show-cars-btn" onClick={onSearch}>
            SHOW CARS
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingWidget;
