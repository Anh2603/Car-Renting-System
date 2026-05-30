import React, { useMemo, useState } from 'react';
import { FleetFooter } from '../../components/Footer/Footer';
import {
  addDaysToDate,
  calculateRentalDays,
  formatDateLabel,
  getTodayDateInputValue,
  normalizeDateForApi,
  normalizeTimeForInput,
  toDateInputValue,
} from '../../utils/bookingFormat';
import './DateTimePage.css';

const DAY_HEADERS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const MIN_RENTAL_TIME = '07:00';
const MAX_RENTAL_TIME = '22:00';

const getInitialPickupDate = (booking) => {
  const today = getTodayDateInputValue();
  const savedPickupDate = normalizeDateForApi(booking?.pickupDate);

  if (savedPickupDate && savedPickupDate >= today) {
    return savedPickupDate;
  }

  return today;
};

const getInitialReturnDate = (booking, pickupDate) => {
  const savedReturnDate = normalizeDateForApi(booking?.returnDate);

  if (savedReturnDate && savedReturnDate > pickupDate) {
    return savedReturnDate;
  }

  return addDaysToDate(pickupDate, 1);
};

const getCalendarMonthLabel = (date) =>
  date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

const isSameMonth = (dateA, dateB) =>
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth();

const getCalendarCells = (monthCursor) => {
  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // JS: Sunday = 0. Calendar UI: Monday = 0.
  const mondayFirstOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const cells = [];

  for (let index = 0; index < mondayFirstOffset; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    cells.push(toDateInputValue(date));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
};

function DateTimePage({ booking, setBooking, onConfirm, onClose }) {
  const today = useMemo(() => getTodayDateInputValue(), []);
  const initialPickupDate = useMemo(() => getInitialPickupDate(booking), [booking]);

  const [pickupDate, setPickupDate] = useState(initialPickupDate);
  const [returnDate, setReturnDate] = useState(() =>
    getInitialReturnDate(booking, initialPickupDate)
  );
  const [pickupTime, setPickupTime] = useState(() =>
    normalizeTimeForInput(booking?.pickupTime, '09:00')
  );
  const [returnTime, setReturnTime] = useState(() =>
    normalizeTimeForInput(booking?.returnTime, '18:30')
  );
  const [selecting, setSelecting] = useState('pickup');
  const [monthCursor, setMonthCursor] = useState(() => {
    const [year, month] = initialPickupDate.split('-').map(Number);
    return new Date(year, month - 1, 1);
  });

  const calendarCells = useMemo(() => getCalendarCells(monthCursor), [monthCursor]);
  const rentalDays = calculateRentalDays(pickupDate, returnDate);
  const nextReturnMinDate = addDaysToDate(pickupDate, 1);
  const canGoPreviousMonth = !isSameMonth(monthCursor, new Date());

  const goToPreviousMonth = () => {
    if (!canGoPreviousMonth) return;

    setMonthCursor((currentMonth) =>
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setMonthCursor((currentMonth) =>
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const moveCalendarToDate = (dateValue) => {
    const [year, month] = dateValue.split('-').map(Number);
    setMonthCursor(new Date(year, month - 1, 1));
  };

  const handlePickupDateChange = (value) => {
    const safePickupDate = value < today ? today : value;
    const safeReturnDate =
      returnDate > safePickupDate ? returnDate : addDaysToDate(safePickupDate, 1);

    setPickupDate(safePickupDate);
    setReturnDate(safeReturnDate);
    setSelecting('return');
    moveCalendarToDate(safePickupDate);
  };

  const handleReturnDateChange = (value) => {
    const minimumReturnDate = addDaysToDate(pickupDate, 1);
    const safeReturnDate = value < minimumReturnDate ? minimumReturnDate : value;

    setReturnDate(safeReturnDate);
    setSelecting('pickup');
    moveCalendarToDate(safeReturnDate);
  };

  const handleCalendarDateClick = (dateValue) => {
    if (!dateValue || dateValue < today) return;

    if (selecting === 'pickup') {
      handlePickupDateChange(dateValue);
    } else {
      if (dateValue <= pickupDate) {
        handlePickupDateChange(dateValue);
      } else {
        handleReturnDateChange(dateValue);
      }
    }
  };

  const getDayClass = (dateValue) => {
    if (!dateValue) return 'cal-day cal-day--disabled';
    if (dateValue < today) return 'cal-day cal-day--disabled cal-day--past';

    const isPickup = dateValue === pickupDate;
    const isReturn = dateValue === returnDate;
    const isInRange = dateValue > pickupDate && dateValue < returnDate;

    if (isPickup && isReturn) return 'cal-day cal-day--selected';
    if (isPickup) return 'cal-day cal-day--range-start';
    if (isReturn) return 'cal-day cal-day--range-end';
    if (isInRange) return 'cal-day cal-day--in-range';

    return 'cal-day';
  };

  const handleConfirm = () => {
    if (!pickupDate || !returnDate) {
      alert('Please select pickup and return dates.');
      return;
    }

    if (returnDate <= pickupDate) {
      alert('Return date must be after pickup date.');
      return;
    }

    setBooking((currentBooking) => ({
      ...currentBooking,
      pickupDate,
      returnDate,
      pickupTime,
      returnTime,
      days: rentalDays,
    }));

    onConfirm();
  };

  return (
    <div className="datetime-page">
      <nav className="datetime-nav">
        <div className="datetime-nav-logo">The Car Renting System</div>

        <button
          className="datetime-nav-icon"
          type="button"
          onClick={onClose}
          aria-label="Back to home"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M2 16c0-3.866 3.134-7 7-7s7 3.134 7 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </nav>

      <div className="datetime-body">
        <div className="datetime-modal">
          <button className="datetime-close" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>

          <div className="datetime-header">
            <div>
              <p className="datetime-eyebrow">Schedule Your Journey</p>
              <h1 className="datetime-title">The System Booking</h1>
              <p className="datetime-subtitle">
                Select real pickup and return time. The same schedule will be used in Fleet,
                Confirm, Checkout and Success pages.
              </p>
            </div>

            <div className="datetime-header-right">
              <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                <rect x="1" y="3" width="16" height="16" rx="2" stroke="#00a8cc" strokeWidth="1.5" />
                <path d="M5 1v4M13 1v4M1 8h16" stroke="#00a8cc" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              REAL DATE & TIME
            </div>
          </div>

          <div className="datetime-content">
            <div className="calendar-section">
              <div className="cal-nav">
                <div>
                  <h3 className="cal-month-title">{getCalendarMonthLabel(monthCursor)}</h3>
                  <p className="cal-helper-text">
                    Currently selecting: <strong>{selecting === 'pickup' ? 'Pickup date' : 'Return date'}</strong>
                  </p>
                </div>

                <div className="cal-nav-btns">
                  <button
                    className="cal-nav-btn"
                    type="button"
                    onClick={goToPreviousMonth}
                    disabled={!canGoPreviousMonth}
                    aria-label="Previous month"
                  >
                    ‹
                  </button>

                  <button
                    className="cal-nav-btn"
                    type="button"
                    onClick={goToNextMonth}
                    aria-label="Next month"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div className="cal-grid">
                {DAY_HEADERS.map((dayName) => (
                  <div key={dayName} className="cal-header-cell">
                    {dayName}
                  </div>
                ))}

                {calendarCells.map((dateValue, index) => {
                  const dayNumber = dateValue ? Number(dateValue.split('-')[2]) : '';

                  return (
                    <button
                      key={`${dateValue || 'empty'}-${index}`}
                      type="button"
                      className={getDayClass(dateValue)}
                      onClick={() => handleCalendarDateClick(dateValue)}
                      disabled={!dateValue || dateValue < today}
                    >
                      {dayNumber}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="details-section">
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

                <label className="detail-field-label" htmlFor="pickup-date">
                  Pickup Date
                </label>

                <input
                  id="pickup-date"
                  className="date-input-field"
                  type="date"
                  value={pickupDate}
                  min={today}
                  onChange={(event) => handlePickupDateChange(event.target.value)}
                />

                <p className="detail-field-value">{formatDateLabel(pickupDate)}</p>

                <label className="detail-field-label detail-field-label--spaced" htmlFor="pickup-time">
                  Pickup Time (7 AM - 10 PM)
                </label>

                <input
                  id="pickup-time"
                  className="time-input-field"
                  type="time"
                  value={pickupTime}
                  min={MIN_RENTAL_TIME}
                  max={MAX_RENTAL_TIME}
                  onChange={(event) => setPickupTime(event.target.value)}
                />
              </div>

              <div className="detail-card detail-card--return">
                <div className="detail-card__title-row">
                  <div className="detail-dot detail-dot--outline">
                    <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                      <path d="M5 1L1 5h2.5v6h3V5H9L5 1z" stroke="#00a8cc" strokeWidth="1.2" />
                    </svg>
                  </div>
                  <span className="detail-card__label-title">Return Details</span>
                </div>

                <label className="detail-field-label" htmlFor="return-date">
                  Return Date
                </label>

                <input
                  id="return-date"
                  className="date-input-field"
                  type="date"
                  value={returnDate}
                  min={nextReturnMinDate}
                  onChange={(event) => handleReturnDateChange(event.target.value)}
                />

                <p className="detail-field-value">{formatDateLabel(returnDate)}</p>

                <label className="detail-field-label detail-field-label--spaced" htmlFor="return-time">
                  Return Time (7 AM - 10 PM)
                </label>

                <input
                  id="return-time"
                  className="time-input-field"
                  type="time"
                  value={returnTime}
                  min={MIN_RENTAL_TIME}
                  max={MAX_RENTAL_TIME}
                  onChange={(event) => setReturnTime(event.target.value)}
                />

                <div className="duration-row">
                  <span className="duration-label">Duration</span>
                  <span className="duration-value">{rentalDays} Days Total</span>
                </div>
              </div>

              <button className="confirm-schedule-btn" type="button" onClick={handleConfirm}>
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

export default DateTimePage;