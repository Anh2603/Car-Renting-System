import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import BookingWidget from '../../components/BookingWidget/BookingWidget';
import './HomePage.css';

/* ===== HOMEPAGE COMPONENT ===== */
function HomePage({ booking, setBooking, onLogin, onSearch, onOpenCalendar }) {
  return (
    <div className="home-page">

      {/* ===== 1. HERO SECTION ===== */}
      <section className="hero-section">
        {/* Navbar trong suốt đè lên hero */}
        <Navbar onLogin={onLogin} showLogin={true} onHome={() => {}} />

        {/* Hình xe nền — blue_car.jpg */}
        <div className="hero-car-wrapper">
          <img
            src="/blue_car.jpg"
            alt="Premium Blue Sports Car"
            className="hero-car-img"
          />
          {/* Lớp overlay tối giúp xe blend vào nền */}
          <div className="hero-car-overlay" />
        </div>

        {/* Booking Widget — nổi giữa xe */}
        <div className="hero-widget-area">
          <BookingWidget
            booking={booking}
            setBooking={setBooking}
            onSearch={onSearch}
            onOpenCalendar={onOpenCalendar}
          />
        </div>
      </section>

      {/* ===== 2. TAGLINE SECTION ===== */}
      <section className="tagline-section">
        <h1 className="tagline-h1">
          PREMIUM CAR RENTAL
        </h1>
        <h1 className="tagline-h1 tagline-h1--cyan">
          AT PRICES YOU'LL LOVE
        </h1>
        <p className="tagline-sub">
          Experience the ultimate in automotive luxury without the commitment of
          ownership. From city sleekers to highway hunters, our curated fleet awaits
          your command.
        </p>
        <div className="tagline-divider" />
      </section>

      {/* ===== 3. BENTO FEATURES GRID ===== */}
      <section className="bento-section">
        <div className="bento-grid">

          {/* ─── Card lớn — Global Access (row 1, col 1) ─── */}
          <div className="bento-card bento-card--wide">
            <div className="bento-wide-content">
              <p className="bento-eyebrow">GLOBAL ACCESS</p>
              <h2 className="bento-title bento-title--large">
                Over 100 Stations Nationwide
              </h2>
              <p className="bento-desc">
                Wherever your journey begins, The Renting Car System is already
                there with a premium key waiting for you.
              </p>
              <div className="bento-link">Explore Locations →</div>
            </div>

            {/* Decorative globe SVG */}
            <div className="bento-globe-deco">
              <svg viewBox="0 0 160 160" fill="none" width="140" height="140">
                <circle cx="80" cy="80" r="70" stroke="rgba(0,212,255,0.25)" strokeWidth="1.2" />
                <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="1" strokeDasharray="6 4" />
                {/* Continents rough shapes */}
                <ellipse cx="80" cy="80" rx="35" ry="70" stroke="rgba(0,212,255,0.2)" strokeWidth="1" fill="none" />
                <path d="M 10 80 Q 80 45 150 80" stroke="rgba(0,212,255,0.2)" strokeWidth="1" fill="none" />
                <path d="M 10 80 Q 80 115 150 80" stroke="rgba(0,212,255,0.2)" strokeWidth="1" fill="none" />
                {/* Lat/lon lines */}
                <path d="M 10 55 Q 80 45 150 55" stroke="rgba(0,212,255,0.12)" strokeWidth="0.8" fill="none" />
                <path d="M 10 105 Q 80 115 150 105" stroke="rgba(0,212,255,0.12)" strokeWidth="0.8" fill="none" />
                <path d="M 50 10 Q 40 80 50 150" stroke="rgba(0,212,255,0.12)" strokeWidth="0.8" fill="none" />
                <path d="M 110 10 Q 120 80 110 150" stroke="rgba(0,212,255,0.12)" strokeWidth="0.8" fill="none" />
                {/* Globe fill */}
                <circle cx="80" cy="80" r="68" fill="rgba(0,40,80,0.25)" />
              </svg>
            </div>
          </div>

          {/* ─── Card — Elite Insurance (row 1, col 2) ─── */}
          <div className="bento-card bento-card--insurance">
            <div className="bento-icon-wrap">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path
                  d="M13 2.5L3.5 7.5v5.5c0 6 4 11 9.5 13 5.5-2 9.5-7 9.5-13V7.5L13 2.5z"
                  stroke="#00d4ff"
                  strokeWidth="1.5"
                  fill="rgba(0,212,255,0.1)"
                />
                <path
                  d="M9 13l3 3 5-5"
                  stroke="#00d4ff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="bento-title bento-title--medium">Elite Insurance</h3>
            <p className="bento-desc">
              Full coverage with 24/7 roadside assistance
              included in every premium rental.
            </p>
          </div>

          {/* ─── Card — Keyless Entry (row 2, col 1) ─── */}
          <div className="bento-card bento-card--keyless">
            <div className="bento-icon-wrap">
              <svg width="26" height="18" viewBox="0 0 26 18" fill="none">
                <circle cx="7" cy="9" r="6.5" stroke="#00d4ff" strokeWidth="1.5" fill="rgba(0,212,255,0.08)" />
                <path d="M13.5 9h13" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M22 6l4 3-4 3" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="7" cy="9" r="2.5" fill="#00d4ff" fillOpacity="0.6" />
              </svg>
            </div>
            <h3 className="bento-title bento-title--medium">Keyless Entry</h3>
            <p className="bento-desc">
              Unlock your vehicle via our app. No queues,
              no paperwork, just the open road.
            </p>
          </div>

          {/* ─── Card — Subscription (row 2, col 2 spanning) ─── */}
          <div className="bento-card bento-card--subscription">
            <div className="bento-sub-content">
              <h3 className="bento-title bento-title--medium">Subscription</h3>
              <p className="bento-desc">
                The freedom of a car with the flexibility of a
                monthly sub. Change your ride, change your vibe.
              </p>
              <button className="bento-learn-btn">Learn More</button>
            </div>
            {/* Wheel image decoration */}
            <div className="bento-wheel-deco">
              <img src="/wheel.jpg" alt="Car Wheel" className="bento-wheel-img" />
            </div>
          </div>

        </div>
      </section>

      {/* ===== 4. FOOTER ===== */}
      <Footer />
    </div>
  );
}

export default HomePage;
