import React, { useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import BookingWidget from '../../components/BookingWidget/BookingWidget';
import { FleetFooter } from '../../components/Footer/Footer';
import MenuOverlay from '../../components/MenuOverlay/MenuOverlay';
import { useLanguage } from '../../i18n/LanguageContext';
import './HomePage.css';

const INFO_MODAL_CONTENT = {
  requirements: {
    eyebrow: 'Rental Requirements',
    title: 'What customers need before pickup',
    text:
      'Customers should prepare valid renter information, a phone number, pickup address, and driver license details before confirming a booking.',
    points: [
      'Valid driver license information',
      'Renter full name and phone number',
      'Pickup address or pickup instruction',
      'Booking confirmation from the system',
    ],
  },
  payment: {
    eyebrow: 'Payment Methods',
    title: 'Payment options prepared for checkout',
    text:
      'The latest flow supports a demo payment step and is ready for multiple payment methods such as card, cash, bank transfer, MOMO, or VNPAY demo.',
    points: [
      'Demo card payment for testing',
      'Cash or bank transfer direction for future versions',
      'Payment status linked to booking status',
      'Receipt information can be added later',
    ],
  },
  addons: {
    eyebrow: 'Add-ons',
    title: 'Optional extras for future booking flow',
    text:
      'Add-ons are planned for the confirmation step so customers can choose extra services before checkout.',
    points: [
      'Child seat',
      'Booster seat',
      'Extra driver',
      'Additional insurance or protection options',
    ],
  },

  terms: {
    eyebrow: 'Terms of Service',
    title: 'Rental rules and customer responsibilities',
    text:
      'These terms explain how customers should use the car renting system, confirm bookings, make payments, and return vehicles on time.',
    points: [
      'Customers must provide accurate renter information and driver license details.',
      'Confirmed bookings reserve the selected vehicle for the chosen pickup and return schedule.',
      'Cash payments are collected at pickup; bank card payments are marked as paid during checkout.',
      'Late return, vehicle damage, or incorrect pickup details may require staff or admin review.',
      'Cancelled bookings release the vehicle back to the available fleet when the schedule is no longer blocked.',
    ],
  },
  cancellation: {
    eyebrow: 'Cancellation Policy',
    title: 'Booking changes and cancellation',
    text:
      'Cancellation rules should depend on booking status. Pending and confirmed bookings can be cancelled before pickup, while picked-up rentals must be handled by staff.',
    points: [
      'Pending bookings can be cancelled before payment',
      'Confirmed bookings can be cancelled before handover',
      'Picked-up rentals must be closed by staff',
      'Refund handling can be added in the payment module',
    ],
  },
};

const FAQ_ITEMS = [
  {
    question: 'How do I start a booking?',
    answer:
      'Select a pickup district, choose real pickup and return date/time, then press Show Cars to view available vehicles.',
  },
  {
    question: 'Are cars filtered by my selected dates?',
    answer:
      'Yes. The latest backend accepts pickupDate and returnDate, then excludes cars that already have active bookings in that date range.',
  },
  {
    question: 'Can I manage my booking after payment?',
    answer:
      'Yes. Logged-in customers can open My Bookings to review booking status, payment status, car details, and rental time.',
  },
  {
    question: 'What information is needed to confirm a rental?',
    answer:
      'The confirmation step should collect renter name, phone number, driver license number, pickup address, and optional notes.',
  },
];

function HomePage({
  booking,
  setBooking,
  onSearch,
  onOpenCalendar,
  onLogin,
  onLogout,
  onMyBookings,
  onProfile,
  onChangePassword,
  onAdminPanel,
  onStaffPanel,
  onContact,
  user,
}) {
  const homeRef = useRef(null);
  const bookingWidgetRef = useRef(null);
  const overviewRef = useRef(null);
  const ratesRef = useRef(null);
  const guideRef = useRef(null);
  const faqRef = useRef(null);
  const contactRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDistrictSignal, setOpenDistrictSignal] = useState(0);
  const [isInsuranceOpen, setIsInsuranceOpen] = useState(false);
  const [infoModalKey, setInfoModalKey] = useState(null);
  const [activeFaqIndex, setActiveFaqIndex] = useState(0);
  const { t } = useLanguage();

  const isLoggedIn = useMemo(() => Boolean(user || localStorage.getItem('token')), [user]);

  const selectedInfoModal = infoModalKey ? INFO_MODAL_CONTENT[infoModalKey] : null;

  const scrollToRef = (ref, block = 'start') => {
    ref.current?.scrollIntoView({
      behavior: 'smooth',
      block,
    });
  };

  const handleHome = () => {
    scrollToRef(homeRef, 'start');
  };

  const handleOpenBooking = () => {
    scrollToRef(bookingWidgetRef, 'center');
  };

  const handleChoosePickupArea = () => {
    scrollToRef(bookingWidgetRef, 'center');
    setOpenDistrictSignal((current) => current + 1);
  };

  const handleOpenInsurance = () => {
    setIsInsuranceOpen(true);
  };

  const handleCloseInsurance = () => {
    setIsInsuranceOpen(false);
  };

  const handleOpenInfoModal = (key) => {
    setInfoModalKey(key);
  };

  const handleCloseInfoModal = () => {
    setInfoModalKey(null);
  };

  const handleAccountClick = () => {
    if (isLoggedIn && onMyBookings) {
      onMyBookings();
      return;
    }

    if (onLogin) onLogin();
  };

  const handleOpenMyBookings = () => {
    if (isLoggedIn && onMyBookings) {
      onMyBookings();
      return;
    }

    alert('Please log in first to view and manage your bookings.');

    if (onLogin) onLogin();
  };

  const handleOpenContact = () => {
    if (onContact) {
      onContact();
      return;
    }

    scrollToRef(contactRef, 'start');
  };

  const handleOpenTerms = () => {
    setInfoModalKey('terms');
  };

  const handleStartPlanning = () => {
    if (!booking?.location) {
      handleChoosePickupArea();
      return;
    }

    if (!booking?.pickupDate || !booking?.returnDate) {
      if (onOpenCalendar) onOpenCalendar();
      return;
    }

    if (onSearch) onSearch();
  };

  const handleCheckFleet = () => {
    if (booking?.location && booking?.pickupDate && booking?.returnDate) {
      if (onSearch) onSearch();
      return;
    }

    handleOpenBooking();
  };

  const handleMenuNavigate = (key) => {
  switch (key) {
    case 'home':
      handleHome();
      break;

    case 'book':
      handleOpenBooking();
      break;

    case 'fleet':
      handleCheckFleet();
      break;

    case 'guide':
      scrollToRef(guideRef, 'start');
      break;

    case 'contact':
      handleOpenContact();
      break;

    case 'terms':
      handleOpenTerms();
      break;

    default:
      handleOpenBooking();
      break;
  }
};

  const handleFooterHomeAction = (target) => {
    switch (target) {
      case 'book':
        handleOpenBooking();
        break;

      case 'contact':
        scrollToRef(contactRef, 'start');
        break;

      case 'home':
      default:
        handleHome();
        break;
    }
  };

  useEffect(() => {
    const handleHomeActionEvent = (event) => {
      handleFooterHomeAction(event.detail?.target || 'home');
    };

    window.addEventListener('car-rental:home-action', handleHomeActionEvent);

    const pendingTarget = sessionStorage.getItem('carRentalFooterTarget');
    let timeoutId;

    if (pendingTarget) {
      sessionStorage.removeItem('carRentalFooterTarget');

      timeoutId = window.setTimeout(() => {
        handleFooterHomeAction(pendingTarget);
      }, 120);
    }

    return () => {
      window.removeEventListener('car-rental:home-action', handleHomeActionEvent);

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <div className="home-page" ref={homeRef}>
      <Navbar
        onHome={handleHome}
        onLogin={onLogin}
        onLogout={onLogout}
        onMyBookings={onMyBookings}
        onProfile={onProfile}
        onChangePassword={onChangePassword}
        onAdminPanel={onAdminPanel}
        onStaffPanel={onStaffPanel}
        onMenu={() => setIsMenuOpen(true)}
        isLoggedIn={isLoggedIn}
        user={user}
      />

      <header className="home-hero">
        <div className="home-hero__bg-glow home-hero__bg-glow--one" />
        <div className="home-hero__bg-glow home-hero__bg-glow--two" />

        <div className="home-hero__inner">
          <div className="home-hero__content">
            <p className="home-eyebrow">{t('home.heroEyebrow')}</p>

            <h1>
              {t('home.heroTitleLine1')}
              <br />
              {t('home.heroTitleLine2')}
              <span>{t('home.heroTitleLine3')}</span>
            </h1>

            <p className="home-hero__description">
              {t('home.heroDescription')}
            </p>

            <div className="home-hero__actions">
              <button className="primary-cta" type="button" onClick={handleOpenBooking}>
                {t('home.startBooking')}
              </button>

              <button className="secondary-cta" type="button" onClick={onOpenCalendar}>
                {t('home.chooseDateTime')}
              </button>
            </div>
          </div>
        </div>

        <div ref={bookingWidgetRef} className="hero-booking-area">
          <BookingWidget
            booking={booking}
            setBooking={setBooking}
            onSearch={onSearch}
            onOpenCalendar={onOpenCalendar}
            openDistrictSignal={openDistrictSignal}
          />
        </div>
      </header>

      <main>
        <section className="service-overview-section" ref={overviewRef}>
          <div className="section-heading">
            <p className="home-eyebrow">Customer service overview</p>
            <h2>Everything customers need before booking</h2>
            <p>
              This section explains the rental service at a glance, then guides customers
              back to the booking widget when they are ready.
            </p>
          </div>

          <div className="overview-grid">
            <article className="overview-card overview-card--large">
              <div>
                <p className="overview-eyebrow">Global Access</p>
                <h3>Pickup Coverage Across HCMC Districts</h3>
                <p>
                  Choose a supported pickup area in Ho Chi Minh City and continue with
                  a guided reservation flow from location to checkout.
                </p>

                <button className="feature-link" type="button" onClick={handleChoosePickupArea}>
                  View Pickup Areas →
                </button>
              </div>

              <div className="overview-orbit" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </article>

            <article className="overview-card">
              <div className="overview-icon">
                <svg width="26" height="28" viewBox="0 0 26 28" fill="none" aria-hidden="true">
                  <path
                    d="M13 2l9 4v6.5c0 6.2-3.6 10.6-9 13.2-5.4-2.6-9-7-9-13.2V6l9-4z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path d="M9 13l2.4 2.4L17 9.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              <h3>Trip Protection Included</h3>
              <p>
                Each rental includes basic trip protection information, pickup verification,
                and roadside assistance details shown during the booking flow.
              </p>

              <button className="feature-link" type="button" onClick={handleOpenInsurance}>
                Learn About Protection →
              </button>
            </article>

            <article className="overview-card overview-card--wide">
              <div className="overview-icon">
                <svg width="28" height="22" viewBox="0 0 28 22" fill="none" aria-hidden="true">
                  <circle cx="8" cy="11" r="5" stroke="currentColor" strokeWidth="2" />
                  <path d="M13 11h13M21 11v-4M24 11v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="8" cy="11" r="1.5" fill="currentColor" />
                </svg>
              </div>

              <h3>Manage Your Bookings</h3>
              <p>
                Log in to review upcoming reservations, payment status, rental details,
                and your previous booking history in one place.
              </p>

              <button className="feature-link" type="button" onClick={handleOpenMyBookings}>
                {isLoggedIn ? 'View My Bookings →' : 'Login To Manage →'}
              </button>
            </article>

            <article className="overview-card overview-card--image">
              <div>
                <h3>Flexible Rental Plans</h3>
                <p>
                  Plan short city trips, weekend rentals, or longer journeys by selecting
                  real pickup and return dates that control your full reservation.
                </p>

                <button className="feature-secondary-btn" type="button" onClick={handleStartPlanning}>
                  Start Planning
                </button>
              </div>

              <div className="overview-wheel-visual" aria-hidden="true">
                <span />
              </div>
            </article>
          </div>
        </section>

        <section className="rates-section" ref={ratesRef}>
  <div className="section-heading">
    <p className="home-eyebrow">Vehicle Preview</p>

    <h2>Preview vehicle types & daily rates</h2>

    <p>
      These are sample rental categories to help customers understand the available
      price ranges. Actual cars will be shown on the Fleet page after pickup area
      and rental dates are selected.
    </p>
  </div>

  <div className="rates-grid">
    <article className="rate-card">
      <span className="rate-badge">Best Value</span>

      <h3>Economy Cars</h3>

      <p>
        Budget-friendly cars for daily city trips, short errands, and simple local
        rentals.
      </p>

      <strong>From 900,000 VND/day</strong>
    </article>

    <article className="rate-card">
      <span className="rate-badge">Family Choice</span>

      <h3>SUVs & 7-Seaters</h3>

      <p>
        Spacious vehicles for families, luggage, weekend trips, and comfortable
        longer journeys.
      </p>

      <strong>From 1,800,000 VND/day</strong>
    </article>

    <article className="rate-card">
      <span className="rate-badge">Premium</span>

      <h3>Premium Cars</h3>

      <p>
        High-end vehicles for business meetings, events, premium comfort, and a
        more luxurious rental experience.
      </p>

      <strong>From 3,200,000 VND/day</strong>
    </article>
  </div>

  <div className="section-center-action">
    <button className="primary-cta" type="button" onClick={handleCheckFleet}>
      Find Available Cars
    </button>
  </div>
</section>

        <section className="guide-section" ref={guideRef}>
          <div className="section-heading">
            <p className="home-eyebrow">Booking guide</p>
            <h2>How the reservation flow works</h2>
            <p>
              The latest version keeps the customer flow simple and connected from HomePage
              to checkout.
            </p>
          </div>

          <div className="guide-steps">
            <article className="guide-step">
              <span>01</span>
              <h3>Choose Pickup Area</h3>
              <p>Select a supported district in Ho Chi Minh City from the booking widget.</p>
            </article>

            <article className="guide-step">
              <span>02</span>
              <h3>Pick Date & Time</h3>
              <p>Choose real pickup and return date/time. This controls availability.</p>
            </article>

            <article className="guide-step">
              <span>03</span>
              <h3>Select Your Car</h3>
              <p>Compare cars returned by the backend and choose a vehicle for the trip.</p>
            </article>

            <article className="guide-step">
              <span>04</span>
              <h3>Confirm & Pay</h3>
              <p>Enter renter details, create booking, complete payment, and view success.</p>
            </article>
          </div>
        </section>

        <section className="faq-section" ref={faqRef}>
          <div className="section-heading">
            <p className="home-eyebrow">FAQ</p>
            <h2>Common questions before your rental</h2>
            <p>
              Quick answers help customers understand the rental process before they start.
            </p>
          </div>

          <div className="faq-list">
            {FAQ_ITEMS.map((item, index) => {
              const isActive = activeFaqIndex === index;

              return (
                <article key={item.question} className={`faq-item ${isActive ? 'faq-item--active' : ''}`}>
                  <button
                    type="button"
                    className="faq-question"
                    onClick={() => setActiveFaqIndex(isActive ? -1 : index)}
                  >
                    <span>{item.question}</span>
                    <strong>{isActive ? '−' : '+'}</strong>
                  </button>

                  {isActive && <p>{item.answer}</p>}
                </article>
              );
            })}
          </div>
        </section>

       <section className="support-section" ref={contactRef}>
  <div className="support-content">
    <p className="home-eyebrow">{t('home.supportEyebrow')}</p>

    <h2>{t('home.supportTitle')}</h2>

    <p>
      {t('home.supportText')}
    </p>

    <div className="support-actions">
      <button className="primary-cta" type="button" onClick={handleOpenContact}>
        {t('home.sendSupportRequest')}
      </button>

      <button className="secondary-cta" type="button" onClick={handleOpenMyBookings}>
        {isLoggedIn ? t('home.openMyBookings') : t('home.loginToViewBookings')}
      </button>
    </div>
  </div>

  <div className="support-contact-panel">
    <div className="support-contact-header">
      <span className="support-contact-icon" aria-hidden="true">
        ☎
      </span>

      <div>
        <h3>{t('home.rentalSupport')}</h3>
      </div>
    </div>

    <div className="support-contact-list">
      <div className="support-contact-row">
        <span>{t('home.hotline')}</span>
        <strong>+84 846 260 304</strong>
      </div>

      <div className="support-contact-row">
        <span>{t('home.email')}</span>
        <strong>suddenalice@gmail.com</strong>
      </div>

      <div className="support-contact-row">
        <span>{t('home.address')}</span>
        <strong>1034/26 Truong Sa, Nhieu Loc District, HCM City</strong>
      </div>
    </div>
  </div>
</section>  
      </main>

      <FleetFooter />

      <MenuOverlay
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={handleMenuNavigate}
      />

      {isInsuranceOpen && (
        <div className="home-modal-backdrop" onClick={handleCloseInsurance}>
          <div className="home-modal" onClick={(event) => event.stopPropagation()}>
            <button
              className="home-modal-close"
              type="button"
              onClick={handleCloseInsurance}
              aria-label="Close insurance details"
            >
              ×
            </button>

            <p className="home-modal-eyebrow">Trip Protection</p>
            <h2>Protection information is part of the rental flow</h2>

            <p>
              Every confirmed booking can show trip protection details, pickup verification,
              and roadside assistance information. This helps customers understand what is
              included before checkout and handover.
            </p>

            <div className="home-modal-list">
              <span>✓ Basic vehicle protection information</span>
              <span>✓ Pickup and return verification support</span>
              <span>✓ Roadside assistance details</span>
              <span>✓ Can be included again in checkout and agreement</span>
            </div>

            <button className="home-modal-btn" type="button" onClick={handleCloseInsurance}>
              Got It
            </button>
          </div>
        </div>
      )}

      {selectedInfoModal && (
        <div className="home-modal-backdrop" onClick={handleCloseInfoModal}>
          <div className="home-modal" onClick={(event) => event.stopPropagation()}>
            <button
              className="home-modal-close"
              type="button"
              onClick={handleCloseInfoModal}
              aria-label="Close details"
            >
              ×
            </button>

            <p className="home-modal-eyebrow">{selectedInfoModal.eyebrow}</p>
            <h2>{selectedInfoModal.title}</h2>
            <p>{selectedInfoModal.text}</p>

            <div className="home-modal-list">
              {selectedInfoModal.points.map((point) => (
                <span key={point}>✓ {point}</span>
              ))}
            </div>

            <button className="home-modal-btn" type="button" onClick={handleCloseInfoModal}>
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
  