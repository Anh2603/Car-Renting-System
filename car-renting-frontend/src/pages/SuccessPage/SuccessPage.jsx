import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import './SuccessPage.css';

function SuccessPage({ car, booking, createdBooking, createdPayment, onHome }) {
  const { t } = useLanguage();
  const days = createdBooking?.rental_days || booking?.days || 5;

  const carPrice = Number(car?.price || car?.price_per_day || 0);

  const total = Number(
    createdPayment?.amount ||
    createdBooking?.total_price ||
    carPrice * days
  );

  const bookingId = createdBooking?.id || createdBooking?.booking_id;

  const bookingRef = bookingId
    ? `BOOKING-${bookingId}`
    : 'BOOKING-DEMO';

  const paymentRef = createdPayment?.payment_id || createdPayment?.id
    ? `PAYMENT-${createdPayment.payment_id || createdPayment.id}`
    : 'PAYMENT-DEMO';

  const pickupDate =
    createdBooking?.pickup_date ||
    booking?.pickupDate ||
    '2026-11-14';

  const returnDate =
    createdBooking?.return_date ||
    booking?.returnDate ||
    '2026-11-19';

  const pickupTime =
    createdBooking?.pickup_time ||
    booking?.pickupTime ||
    '09:00 AM';

  const returnTime =
    createdBooking?.return_time ||
    booking?.returnTime ||
    '06:30 PM';

  const pickupLocation =
    createdBooking?.pickup_location ||
    booking?.location ||
    'Rental Office';

  const returnLocation =
    createdBooking?.return_location ||
    createdBooking?.pickup_location ||
    booking?.location ||
    'Rental Office';

  const bookingStatus =
    createdPayment?.booking_status ||
    createdBooking?.status ||
    'CONFIRMED';

  const paymentStatus =
    createdPayment?.payment_status ||
    createdPayment?.status ||
    'SUCCESS';

  const paymentMethod =
    createdPayment?.payment_method ||
    createdPayment?.method ||
    'BANK_CARD';

  const isCashPayment = paymentMethod === 'CASH';

  const paymentMethodLabel = isCashPayment ? t('success.cash') : t('success.bankCard');
  const totalLabel = isCashPayment ? t('success.amountDueAtPickup') : t('success.totalPaid');
  const successMessage = isCashPayment
    ? t('success.cashMessage')
    : t('success.cardMessage');

  const renterName =
    createdBooking?.renter_name ||
    booking?.customerFullName ||
    t('success.notProvided');

  const renterPhone =
    createdBooking?.renter_phone ||
    booking?.customerPhone ||
    t('success.notProvided');

  const renterLicense =
    createdBooking?.driver_license_number ||
    booking?.driverLicenseNumber ||
    t('success.notProvided');

  const pickupAddress =
    createdBooking?.pickup_address ||
    booking?.pickupAddress ||
    pickupLocation;

  const customerNote =
    createdBooking?.customer_note ||
    booking?.customerNote ||
    t('success.noNote');

  const carName = car?.name || t('success.selectedCar');
  const carBrand = car?.brand || 'N/A';
  const carModel = car?.model || 'N/A';
  const carYear = car?.year || 'N/A';
  const carSeats = car?.seats || 'N/A';
  const carTransmission = car?.transmission || 'N/A';
  const carFuelType = car?.fuel_type || car?.fuelType || 'N/A';
  const licensePlate = car?.license_plate || car?.plate_number || t('success.updating');

  if (!car) {
    return (
      <div className="success-page">
        <h1 className="success-title">{t('success.noBookingTitle')}</h1>
        <p className="success-sub">
          {t('success.noBookingSubtitle')}
        </p>

        <button className="success-home-btn" onClick={onHome}>
          {t('success.backHome')}
        </button>
      </div>
    );
  }

  return (
    <div className="success-page">
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

        <div className="success-ring success-ring--1" />
        <div className="success-ring success-ring--2" />
      </div>

      <h1 className="success-title">{t('success.bookingConfirmed')}</h1>

      <p className="success-sub">
        {t('success.your')} <strong>{carName}</strong> {t('success.bookedSuccessfully')}
        <br />
        {days} days — {pickupDate} to {returnDate}.
        <br />
        {successMessage}
      </p>

      <div className="success-ref-box">
        <p className="success-ref-label">{t('success.bookingReference')}</p>
        <p className="success-ref-val">{bookingRef}</p>
      </div>

      <div className="success-ref-box">
        <p className="success-ref-label">{t('success.paymentReference')}</p>
        <p className="success-ref-val">{paymentRef}</p>
      </div>

      <div className="success-price-row">
        <span className="success-price-label">{totalLabel}</span>
        <span className="success-price-val">
          {total.toLocaleString('vi-VN')} VND
        </span>
      </div>

      <div className="success-price-row">
        <span className="success-price-label">{t('success.bookingStatus')}</span>
        <span className="success-price-val success-status-badge">
          {bookingStatus}
        </span>
      </div>

      <div className="success-price-row">
        <span className="success-price-label">{t('success.paymentMethod')}</span>
        <span className="success-price-val success-status-badge">
          {paymentMethodLabel}
        </span>
      </div>

      <div className="success-price-row">
        <span className="success-price-label">{t('success.paymentStatus')}</span>
        <span className={`success-price-val success-status-badge ${paymentStatus === 'PENDING' ? 'success-price-val--pending' : ''}`}>
          {paymentStatus}
        </span>
      </div>

      {isCashPayment && (
        <div className="success-cash-note">
          {t('success.cashNote')}
        </div>
      )}

      <div className="confirmation-section">
        <h2 className="confirmation-title">{t('success.rentalConfirmation')}</h2>

        <div className="confirmation-grid">
          <div className="confirmation-card">
            <div className="confirmation-card-header">
              <span className="confirmation-card-icon">🏢</span>
              <div>
                <h3>{t('success.rentalProvider')}</h3>
              </div>
            </div>

            <div className="confirmation-info-list">
              <div className="confirmation-info-row">
                <span>{t('success.company')}</span>
                <strong>Car Renting System</strong>
              </div>

              <div className="confirmation-info-row">
                <span>{t('success.representative')}</span>
                <strong>Rental Office Staff</strong>
              </div>

              <div className="confirmation-info-row">
                <span>{t('success.phone')}</span>
                <strong>+84 846 260 304</strong>
              </div>

              <div className="confirmation-info-row">
                <span>{t('success.branch')}</span>
                <strong>{booking?.location || pickupLocation}</strong>
              </div>

              <div className="confirmation-info-row">
                <span>{t('success.handoverStatus')}</span>
                <strong>{t('success.readyForPickup')}</strong>
              </div>
            </div>
          </div>

          <div className="confirmation-card">
            <div className="confirmation-card-header">
              <span className="confirmation-card-icon">👤</span>
              <div>
                <h3>{t('success.receiver')}</h3>
              </div>
            </div>

            <div className="confirmation-info-list">
              <div className="confirmation-info-row">
                <span>{t('success.fullName')}</span>
                <strong>{renterName}</strong>
              </div>

              <div className="confirmation-info-row">
                <span>{t('success.phone')}</span>
                <strong>{renterPhone}</strong>
              </div>

              <div className="confirmation-info-row">
                <span>{t('success.driverLicense')}</span>
                <strong>{renterLicense}</strong>
              </div>

              <div className="confirmation-info-row">
                <span>{t('success.pickupAddress')}</span>
                <strong>{pickupAddress}</strong>
              </div>

              <div className="confirmation-info-row">
                <span>{t('success.customerNote')}</span>
                <strong>{customerNote}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="confirmation-card confirmation-card-wide">
          <div className="confirmation-card-header">
            <span className="confirmation-card-icon">🚘</span>
            <div>
              <h3>{t('success.vehicleRentalInfo')}</h3>
            </div>
          </div>

          <div className="confirmation-info-table">
            <div className="confirmation-info-row">
              <span>{t('success.car')}</span>
              <strong>{carName}</strong>
            </div>

            <div className="confirmation-info-row">
              <span>{t('success.brandModel')}</span>
              <strong>{carBrand} {carModel}</strong>
            </div>

            <div className="confirmation-info-row">
              <span>{t('success.year')}</span>
              <strong>{carYear}</strong>
            </div>

            <div className="confirmation-info-row">
              <span>{t('success.licensePlate')}</span>
              <strong>{licensePlate}</strong>
            </div>

            <div className="confirmation-info-row">
              <span>{t('success.seats')}</span>
              <strong>{carSeats}</strong>
            </div>

            <div className="confirmation-info-row">
              <span>{t('success.transmission')}</span>
              <strong>{carTransmission}</strong>
            </div>

            <div className="confirmation-info-row">
              <span>{t('success.fuelType')}</span>
              <strong>{carFuelType}</strong>
            </div>

            <div className="confirmation-info-row">
              <span>{t('success.pickupTime')}</span>
              <strong>{pickupDate} — {pickupTime}</strong>
            </div>

            <div className="confirmation-info-row">
              <span>{t('success.returnTime')}</span>
              <strong>{returnDate} — {returnTime}</strong>
            </div>

            <div className="confirmation-info-row">
              <span>{t('success.pickupLocation')}</span>
              <strong>{pickupLocation}</strong>
            </div>

            <div className="confirmation-info-row">
              <span>{t('success.returnLocation')}</span>
              <strong>{returnLocation}</strong>
            </div>
          </div>
        </div>
      </div>

      <button className="success-home-btn" onClick={onHome}>
        {t('success.backHome')}
      </button>
    </div>
  );
}

export default SuccessPage;
