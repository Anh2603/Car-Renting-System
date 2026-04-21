import React, { useState } from 'react';
import { FleetFooter } from '../../components/Footer/Footer';
import './DateTimePage.css';

/* ===== DATE & TIME SELECTION PAGE =====
 * Props:
 *   booking    — state đặt xe hiện tại
 *   setBooking — setter cập nhật ngày giờ
 *   onConfirm  — xác nhận → chuyển sang fleet
 *   onClose    — đóng modal → về home
 */
function DateTimePage({ booking, setBooking, onConfirm, onClose }) {
  /* State nội bộ: ngày đang chọn */
  const [pickupDate, setPickupDate]   = useState(booking.pickupDate || 14);
  const [returnDate, setReturnDate]   = useState(booking.returnDate || 19);
  const [pickupTime, setPickupTime]   = useState(booking.pickupTime || '09:00 AM');
  const [returnTime, setReturnTime]   = useState(booking.returnTime || '06:30 PM');
  /* 'pickup' | 'return' — lần click tiếp theo chọn ngày nào */
  const [selecting, setSelecting]     = useState('pickup');

  /* ===== DỮ LIỆU LỊCH THÁNG 11/2026 =====
   * Ngày 1/11/2026 rơi vào Chủ nhật (index 6 theo Mon–Sun)
   */
  const DAY_HEADERS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const FIRST_DAY_OFFSET = 6; // Chủ nhật
  const DAYS_IN_MONTH   = 30;

  /* Tạo mảng ô lịch: null = ô trống đầu tháng */
  const calCells = [];
  for (let i = 0; i < FIRST_DAY_OFFSET; i++) calCells.push(null);
  for (let d = 1; d <= DAYS_IN_MONTH; d++) calCells.push(d);
  while (calCells.length % 7 !== 0) calCells.push(null); // padding cuối

  /* Xác định class CSS cho từng ô ngày */
  const getDayClass = (d) => {
    if (!d) return 'cal-day cal-day--disabled';
    const min = Math.min(pickupDate, returnDate);
    const max = Math.max(pickupDate, returnDate);
    if (d === min && d === max) return 'cal-day cal-day--selected';
    if (d === min) return 'cal-day cal-day--range-start';
    if (d === max) return 'cal-day cal-day--range-end';
    if (d > min && d < max) return 'cal-day cal-day--in-range';
    return 'cal-day';
  };

  /* Xử lý click ngày trên lịch */
  const handleDayClick = (d) => {
    if (!d) return;
    if (selecting === 'pickup') {
      setPickupDate(d);
      /* Nếu ngày đón >= ngày trả → tự động đẩy ngày trả */
      if (d >= returnDate) setReturnDate(d + 1 <= DAYS_IN_MONTH ? d + 1 : DAYS_IN_MONTH);
      setSelecting('return');
    } else {
      if (d > pickupDate) {
        setReturnDate(d);
      } else {
        setReturnDate(pickupDate + 1 <= DAYS_IN_MONTH ? pickupDate + 1 : DAYS_IN_MONTH);
      }
      setSelecting('pickup');
    }
  };

  /* Tính số ngày thuê */
  const days = Math.max(1, returnDate - pickupDate);

  /* Xác nhận lịch và cập nhật state toàn cục */
  const handleConfirm = () => {
    setBooking((b) => ({ ...b, pickupDate, returnDate, pickupTime, returnTime, days }));
    onConfirm();
  };

  return (
    <div className="datetime-page">
      {/* Navbar */}
      <nav className="datetime-nav">
        <div className="datetime-nav-logo">The Car Renting System</div>
        <div className="datetime-nav-icon">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 16c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </nav>

      {/* Nội dung chính */}
      <div className="datetime-body">
        <div className="datetime-modal">
          {/* Nút đóng */}
          <button className="datetime-close" onClick={onClose}>✕</button>

          {/* Header modal */}
          <div className="datetime-header">
            <div>
              <p className="datetime-eyebrow">Schedule Your Journey</p>
              <h1 className="datetime-title">The System Booking</h1>
            </div>
            <div className="datetime-header-right">
              <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                <rect x="1" y="3" width="16" height="16" rx="2" stroke="#00a8cc" strokeWidth="1.5" />
                <path d="M5 1v4M13 1v4M1 8h16" stroke="#00a8cc" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              SELECT DATES & TIME
            </div>
          </div>

          {/* Body: Lịch + Chi tiết */}
          <div className="datetime-content">
            {/* ===== PHẦN LỊCH ===== */}
            <div className="calendar-section">
              {/* Navigation tháng */}
              <div className="cal-nav">
                <h3 className="cal-month-title">November 2026</h3>
                <div className="cal-nav-btns">
                  <button className="cal-nav-btn">‹</button>
                  <button className="cal-nav-btn">›</button>
                </div>
              </div>

              {/* Grid lịch */}
              <div className="cal-grid">
                {/* Header ngày trong tuần */}
                {DAY_HEADERS.map((d) => (
                  <div key={d} className="cal-header-cell">{d}</div>
                ))}

                {/* Các ô ngày */}
                {calCells.map((d, i) => (
                  <div
                    key={i}
                    className={d ? getDayClass(d) : 'cal-day cal-day--disabled'}
                    onClick={() => handleDayClick(d)}
                  >
                    {d || ''}
                  </div>
                ))}
              </div>
            </div>

            {/* ===== PHẦN CHI TIẾT & THỜI GIAN ===== */}
            <div className="details-section">
              {/* --- Pickup Details --- */}
              <div className="detail-card">
                <div className="detail-card__title-row">
                  <div className="detail-dot detail-dot--active">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <circle cx="5" cy="5" r="4" stroke="#060c18" strokeWidth="1.5" />
                      <circle cx="5" cy="5" r="1.5" fill="#060c18" />
                    </svg>
                  </div>
                  <span className="detail-card__label-title">Pickup Details</span>
                </div>

                <p className="detail-field-label">Pickup Date</p>
                <p className="detail-field-value">Nov {pickupDate}, 2026</p>

                <p className="detail-field-label" style={{ marginTop: '14px' }}>
                  Pickup Time (7 AM – 10 PM)
                </p>
                <TimeInput
                  value={pickupTime}
                  onChange={setPickupTime}
                />
              </div>

              {/* --- Return Details --- */}
              <div className="detail-card" style={{ marginTop: '16px' }}>
                <div className="detail-card__title-row">
                  <div className="detail-dot detail-dot--outline">
                    <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                      <path d="M5 1L1 5h2.5v6h3V5H9L5 1z" stroke="#00a8cc" strokeWidth="1.2" />
                    </svg>
                  </div>
                  <span className="detail-card__label-title">Return Details</span>
                </div>

                <p className="detail-field-label">Return Date</p>
                <p className="detail-field-value">Nov {returnDate}, 2026</p>

                <p className="detail-field-label" style={{ marginTop: '14px' }}>
                  Return Time (7 AM – 10 PM)
                </p>
                <TimeInput
                  value={returnTime}
                  onChange={setReturnTime}
                />

                {/* Tổng số ngày */}
                <div className="duration-row">
                  <span className="duration-label">Duration</span>
                  <span className="duration-value">{days} Days Total</span>
                </div>
              </div>

              {/* Nút xác nhận */}
              <button className="confirm-schedule-btn" onClick={handleConfirm}>
                CONFIRM SCHEDULE
              </button>
            </div>
          </div>
        </div>
      </div>

      <FleetFooter />
    </div>
  );
}

/* ===== TIME INPUT SUB-COMPONENT =====
 * Input giờ có nút chuyển AM/PM
 */
function TimeInput({ value, onChange }) {
  /* Tách phần giờ:phút và AM/PM */
  const parts  = value.split(' ');
  const hhmm   = parts[0] || '09:00';
  const period = parts[1] || 'AM';

  const setHhmm   = (v) => onChange(`${v} ${period}`);
  const setPeriod = (p) => onChange(`${hhmm} ${p}`);

  return (
    <div className="time-input-wrap">
      <input
        className="time-input-field"
        type="text"
        value={hhmm}
        onChange={(e) => setHhmm(e.target.value)}
        maxLength={5}
      />
      <div className="time-ampm-wrap">
        <button
          className={`time-ampm-btn ${period === 'AM' ? 'time-ampm-btn--active' : ''}`}
          onClick={() => setPeriod('AM')}
        >
          AM
        </button>
        <button
          className={`time-ampm-btn ${period === 'PM' ? 'time-ampm-btn--active' : ''}`}
          onClick={() => setPeriod('PM')}
        >
          PM
        </button>
      </div>
    </div>
  );
}

export default DateTimePage;
