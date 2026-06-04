import React, { useEffect, useState } from 'react';
import { DarkNavbar } from '../../components/Navbar/Navbar';
import { FleetFooter } from '../../components/Footer/Footer';
import { getMyBookings, cancelMyBooking } from '../../services/bookingService';
import { useLanguage } from '../../i18n/LanguageContext';
import './MyBookingsPage.css';

function MyBookingsPage({
  onHome,
  onLogin,
  user,
  onLogout,
  onProfile,
  onChangePassword,
  onAdminPanel,
  onStaffPanel,
}) {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [cancelingId, setCancelingId] = useState(null);

  const isLoggedIn = Boolean(localStorage.getItem('token'));

  const formatPrice = (value) => {
    return Number(value || 0).toLocaleString('vi-VN');
  };

  const getStatusClass = (status) => {
    if (status === 'CONFIRMED' || status === 'SUCCESS' || status === 'PAID') {
      return 'my-bookings-status my-bookings-status--success';
    }

    if (status === 'PENDING' || status === 'UNPAID') {
      return 'my-bookings-status my-bookings-status--pending';
    }

    if (status === 'CANCELLED' || status === 'FAILED') {
      return 'my-bookings-status my-bookings-status--danger';
    }

    return 'my-bookings-status';
  };

  const getCarName = (booking) => {
    return booking.car_name || booking.car?.name || t('myBookings.rentalCar');
  };

  const getCarImage = (booking) => {
    return booking.image_url || booking.car?.image_url || '';
  };

  const getCarBrandModel = (booking) => {
    const brand = booking.brand || booking.car?.brand || '';
    const model = booking.model || booking.car?.model || '';
    const year = booking.year || booking.car?.year || '';

    return `${brand} ${model} ${year}`.trim();
  };

  const getPricePerDay = (booking) => {
    return booking.price_per_day || booking.car?.price_per_day || 0;
  };

  const getPaymentId = (booking) => {
    return booking.payment_id || booking.payment?.id || null;
  };

  const getPaymentStatus = (booking) => {
    return booking.payment_status || booking.payment?.status || 'UNPAID';
  };

  const getPaymentMethod = (booking) => {
    return (
      booking.payment_method ||
      booking.payment?.method ||
      booking.payment?.payment_method ||
      'BANK_CARD'
    );
  };

  const getPaymentMethodLabel = (method) => {
    if (method === 'CASH') {
      return t('myBookings.cashMethod');
    }

    return t('myBookings.bankCardMethod');
  };

  const canCancelBooking = (status) => ['PENDING', 'CONFIRMED'].includes(status);

  const loadMyBookings = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setMessage(t('myBookings.loginRequired'));
        setBookings([]);
        return;
      }

      const bookingsData = await getMyBookings();
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setMessage('');
    } catch (error) {
      console.error('Fetch my bookings error:', error);
      setMessage(error.message || t('myBookings.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const confirmed = window.confirm(t('myBookings.cancelConfirm'));

    if (!confirmed) return;

    try {
      setCancelingId(bookingId);
      await cancelMyBooking(bookingId);
      await loadMyBookings();
    } catch (error) {
      console.error('Cancel booking error:', error);
      alert(error.message || t('myBookings.cancelError'));
    } finally {
      setCancelingId(null);
    }
  };

  useEffect(() => {
    loadMyBookings();
  }, []);

  return (
    <div className="my-bookings-page">
      <DarkNavbar
        onHome={onHome}
        onLogin={onLogin}
        onLogout={onLogout}
        onMyBookings={() => {}}
        onProfile={onProfile}
        onChangePassword={onChangePassword}
        onAdminPanel={onAdminPanel}
        onStaffPanel={onStaffPanel}
        isLoggedIn={isLoggedIn}
        user={user}
      />

      <main className="my-bookings-container">
        <div className="my-bookings-header">
          <p className="my-bookings-eyebrow">{t('myBookings.eyebrow')}</p>
          <h1 className="my-bookings-title">{t('myBookings.title')}</h1>
        </div>

        {loading && (
          <div className="my-bookings-state-card">
            <p>{t('myBookings.loading')}</p>
          </div>
        )}

        {!loading && message && (
          <div className="my-bookings-state-card">
            <p>{message}</p>

            {message.toLowerCase().includes('login') && (
              <button
                className="my-bookings-primary-btn"
                type="button"
                onClick={onLogin}
              >
                {t('myBookings.loginButton')}
              </button>
            )}
          </div>
        )}

        {!loading && !message && bookings.length === 0 && (
          <div className="my-bookings-state-card">
            <p>{t('myBookings.empty')}</p>

            <button
              className="my-bookings-primary-btn"
              type="button"
              onClick={onHome}
            >
              {t('myBookings.browseCars')}
            </button>
          </div>
        )}

        {!loading && !message && bookings.length > 0 && (
          <div className="my-bookings-list">
            {bookings.map((booking) => {
              const carName = getCarName(booking);
              const carImage = getCarImage(booking);
              const carMeta = getCarBrandModel(booking);
              const pricePerDay = getPricePerDay(booking);
              const paymentId = getPaymentId(booking);
              const paymentStatus = getPaymentStatus(booking);
              const paymentMethod = getPaymentMethod(booking);
              const canCancel = canCancelBooking(booking.status);

              return (
                <article className="my-booking-card" key={booking.id}>
                  <div className="my-booking-img-wrap">
                    {carImage ? (
                      <img
                        src={carImage}
                        alt={carName}
                        className="my-booking-img"
                      />
                    ) : (
                      <div className="my-booking-placeholder">CAR</div>
                    )}
                  </div>

                  <div className="my-booking-content">
                    <div className="my-booking-top-row">
                      <div>
                        <p className="my-booking-ref">BOOKING-{booking.id}</p>

                        <h2 className="my-booking-car-name">
                          {carName}
                        </h2>

                        {carMeta && (
                          <p className="my-booking-car-meta">
                            {carMeta}
                          </p>
                        )}
                      </div>

                      <span className={getStatusClass(booking.status)}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="my-booking-info-grid">
                      <div className="my-booking-info-item">
                        <span>{t('myBookings.pickup')}</span>
                        <strong>{booking.pickup_date || booking.pickupDate}</strong>
                        <small>{booking.pickup_time || booking.pickupTime}</small>
                      </div>

                      <div className="my-booking-info-item">
                        <span>{t('myBookings.return')}</span>
                        <strong>{booking.return_date || booking.returnDate}</strong>
                        <small>{booking.return_time || booking.returnTime}</small>
                      </div>

                      <div className="my-booking-info-item">
                        <span>{t('myBookings.location')}</span>
                        <strong>
                          {booking.pickup_location || booking.pickupLocation}
                        </strong>
                        <small>
                          {booking.return_location || booking.returnLocation}
                        </small>
                      </div>

                      <div className="my-booking-info-item">
                        <span>{t('myBookings.total')}</span>
                        <strong>
                          {formatPrice(booking.total_price || booking.totalPrice)} VND
                        </strong>
                        <small>{formatPrice(pricePerDay)} {t('myBookings.perDay')}</small>
                      </div>
                    </div>

                    <div className="my-booking-bottom-row">
                      <div>
                        <span className="my-booking-payment-label">
                          {t('myBookings.payment')}
                        </span>

                        {paymentId ? (
                          <span className={getStatusClass(paymentStatus)}>
                            {paymentStatus}
                          </span>
                        ) : (
                          <span className="my-bookings-status my-bookings-status--pending">
                            {t('myBookings.unpaid')}
                          </span>
                        )}
                      </div>

                      {paymentId && (
                        <p className="my-booking-payment-ref">
                          PAYMENT-{paymentId} · {getPaymentMethodLabel(paymentMethod)}
                        </p>
                      )}

                      {paymentMethod === 'CASH' && paymentStatus === 'PENDING' && (
                        <p className="my-booking-cash-note">
                          {t('myBookings.cashPendingNote')}
                        </p>
                      )}

                      {canCancel && (
                        <button
                          className="my-booking-cancel-btn"
                          type="button"
                          disabled={cancelingId === booking.id}
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          {cancelingId === booking.id ? t('myBookings.cancelling') : t('myBookings.cancelBooking')}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <FleetFooter />
    </div>
  );
}

export default MyBookingsPage;