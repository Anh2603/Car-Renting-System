import React, { useState } from 'react';
import { DarkNavbar } from '../../components/Navbar/Navbar';
import { FleetFooter } from '../../components/Footer/Footer';
import './ConfirmPage.css';

function ConfirmPage({
  booking,
  setBooking,
  car,
  onNext,
  onHome,
  user,
  isLoggedIn,
  onLogin,
  onLogout,
  onMyBookings,
  onProfile,
  onChangePassword,
  onAdminPanel,
  onStaffPanel,
}) {
  const [step, setStep] = useState('summary');
  const days = booking?.days || 3;

  const carPrice = Number(car?.price || car?.price_per_day || 0);
  const carImage = car?.image || car?.image_url;
  const carBags = car?.bags || 2;
  const carTransmission = car?.transmission || 'Automatic';
  const total = carPrice * days;

  const updateBookingField = (field, value) => {
    if (!setBooking) return;

    setBooking((currentBooking) => ({
      ...currentBooking,
      [field]: value,
    }));
  };


  if (!car) {
    return (
      <div className="confirm-page">
        <DarkNavbar
          onHome={onHome}
          onLogin={onLogin}
          onLogout={onLogout}
          onMyBookings={onMyBookings}
          onProfile={onProfile}
          onChangePassword={onChangePassword}
          onAdminPanel={onAdminPanel}
          onStaffPanel={onStaffPanel}
          isLoggedIn={isLoggedIn}
          user={user}
        />
        <div className="confirm-header">
          <h1 className="confirm-page-title">No car selected</h1>
        </div>
        <FleetFooter />
      </div>
    );
  }

  const renderCarSummary = () => (
    <div className="confirm-left">
      <div className="confirm-car-display">
        {carImage ? (
          <img
            src={carImage}
            alt={car.name}
            className="confirm-car-img"
          />
        ) : (
          <div className="confirm-car-placeholder">
            <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
              <rect x="10" y="20" width="100" height="28" rx="6" fill="#1E3A5F" />
              <rect x="25" y="10" width="70" height="22" rx="5" fill="#1E3A5F" />
              <circle cx="28" cy="50" r="9" fill="#0A192F" stroke="#22D3EE" strokeWidth="2" />
              <circle cx="92" cy="50" r="9" fill="#0A192F" stroke="#22D3EE" strokeWidth="2" />
            </svg>
          </div>
        )}
      </div>

      <h2 className="confirm-car-name">{car.name}</h2>

      <div className="confirm-car-attrs">
        <span className="confirm-attr">
          {car.seats || 5} SEATS
        </span>

        <span className="confirm-attr">
          {carBags} BAGS
        </span>

        <span className="confirm-attr">
          {carTransmission.toUpperCase()}
        </span>

        <span className="confirm-attr">
          AIR CONDITIONING
        </span>
      </div>
    </div>
  );

  const renderSummaryStep = () => (
    <div className="confirm-right">
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

      <div className="confirm-section">
        <p className="confirm-section-label">KILOMETER PACKAGE</p>
        <div className="confirm-km-card">
          <div className="confirm-option-left">
            <span className="confirm-option-title">Unlimited kilometers</span>
          </div>
          <span className="confirm-km-badge">INCLUDED</span>
        </div>
      </div>

      <div className="price-box">
        <p className="price-daily-label">DAILY RATE</p>

        <div className="price-amount-row">
          <span className="price-amount">
            {carPrice.toLocaleString('vi-VN')}
          </span>
          <span className="price-unit"> VND / day</span>
        </div>

        <div className="price-total-row">
          <span className="price-total-label">
            Estimated Total ({days} days)
          </span>
          <span className="price-total-val">
            {total.toLocaleString('vi-VN')} VNĐ
          </span>
        </div>
      </div>

      <button className="next-btn" onClick={() => setStep('driver-info')}>
        <span>NEXT</span>
      </button>
    </div>
  );

  const renderDriverInfoStep = () => (
    <div className="confirm-right driver-info-panel">
      <div className="driver-info-heading">
        <p className="confirm-section-label">RENTER INFORMATION</p>
        <h2>Driver Details</h2>
        <p>Please enter the renter information before creating the booking.</p>
      </div>

      <div className="driver-form-grid">
        <label className="driver-field">
          <span>Full Name</span>
          <input
            type="text"
            value={booking.customerFullName || ''}
            onChange={(e) => updateBookingField('customerFullName', e.target.value)}
            placeholder="Nguyễn Trung Anh"
          />
        </label>

        <label className="driver-field">
          <span>Phone Number</span>
          <input
            type="text"
            value={booking.customerPhone || ''}
            onChange={(e) => updateBookingField('customerPhone', e.target.value)}
            placeholder="0846260304"
          />
        </label>

        <label className="driver-field driver-field-full">
          <span>Driver's License Number</span>
          <input
            type="text"
            value={booking.driverLicenseNumber || ''}
            onChange={(e) => updateBookingField('driverLicenseNumber', e.target.value)}
            placeholder="Enter driver's license number"
          />
        </label>

        <label className="driver-field driver-field-full">
          <span>Specific Pickup Address</span>
          <input
            type="text"
            value={booking.pickupAddress || ''}
            onChange={(e) => updateBookingField('pickupAddress', e.target.value)}
            placeholder="Example: 123 Nguyen Hue Street"
          />
        </label>

        <label className="driver-field driver-field-full">
          <span>Note</span>
          <textarea
            value={booking.customerNote || ''}
            onChange={(e) => updateBookingField('customerNote', e.target.value)}
            placeholder="Optional note for the rental order"
            rows="3"
          />
        </label>
      </div>

      <div className="driver-action-row">
        <button className="back-btn" type="button" onClick={() => setStep('summary')}>
          BACK
        </button>

        <button className="next-btn" type="button" onClick={onNext}>
          <span>CREATE BOOKING</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="confirm-page">
      <DarkNavbar
          onHome={onHome}
          onLogin={onLogin}
          onLogout={onLogout}
          onMyBookings={onMyBookings}
          onProfile={onProfile}
          onChangePassword={onChangePassword}
          onAdminPanel={onAdminPanel}
          onStaffPanel={onStaffPanel}
          isLoggedIn={isLoggedIn}
          user={user}
        />

      <div className="confirm-header">
        <h1 className="confirm-page-title">
          {step === 'summary' ? 'Confirm Your Selection' : 'Renter Information'}
        </h1>
      </div>

      <div className="confirm-container">
        <div className="confirm-card">
          {renderCarSummary()}
          {step === 'summary' ? renderSummaryStep() : renderDriverInfoStep()}
        </div>
      </div>

      <FleetFooter />
    </div>
  );
}

export default ConfirmPage;