import React, { useEffect, useMemo, useRef, useState } from 'react';
import { formatDateTimeLabel } from '../../utils/bookingFormat';
import { useLanguage } from '../../i18n/LanguageContext';
import './BookingWidget.css';

const HCM_DISTRICTS = [
  'District 1',
  'District 2',
  'District 3',
  'District 4',
  'District 5',
  'District 6',
  'District 7',
  'District 8',
  'District 9',
  'District 10',
  'District 11',
  'District 12',
  'Binh Thanh District',
  'Go Vap District',
  'Phu Nhuan District',
  'Tan Binh District',
  'Tan Phu District',
  'Binh Tan District',
  'Thu Duc City',
];

const LEGACY_DISTRICT_MAP = {
  'Quận 1': 'District 1',
  'Quận 2': 'District 2',
  'Quận 3': 'District 3',
  'Quận 4': 'District 4',
  'Quận 5': 'District 5',
  'Quận 6': 'District 6',
  'Quận 7': 'District 7',
  'Quận 8': 'District 8',
  'Quận 9': 'District 9',
  'Quận 10': 'District 10',
  'Quận 11': 'District 11',
  'Quận 12': 'District 12',
  'Quận Bình Thạnh': 'Binh Thanh District',
  'Quận Gò Vấp': 'Go Vap District',
  'Quận Phú Nhuận': 'Phu Nhuan District',
  'Quận Tân Bình': 'Tan Binh District',
  'Quận Tân Phú': 'Tan Phu District',
  'Quận Bình Tân': 'Binh Tan District',
  'Thành phố Thủ Đức': 'Thu Duc City',
};

function BookingWidget({
  booking,
  setBooking,
  onSearch,
  onOpenCalendar,
  openDistrictSignal = 0,
}) {
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const districtDropdownRef = useRef(null);
  const { t } = useLanguage();

  const selectedDistrict = useMemo(() => {
    if (!booking.location) return '';
    return LEGACY_DISTRICT_MAP[booking.location] || booking.location;
  }, [booking.location]);

  useEffect(() => {
    if (!booking.location || !LEGACY_DISTRICT_MAP[booking.location]) return;

    setBooking((currentBooking) => ({
      ...currentBooking,
      location: LEGACY_DISTRICT_MAP[currentBooking.location] || currentBooking.location,
    }));
  }, [booking.location, setBooking]);

  useEffect(() => {
    if (!openDistrictSignal) return;

    setIsDistrictOpen(true);

    setTimeout(() => {
      districtDropdownRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 80);
  }, [openDistrictSignal]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        districtDropdownRef.current &&
        !districtDropdownRef.current.contains(event.target)
      ) {
        setIsDistrictOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleDistrictSelect = (district) => {
    setBooking((currentBooking) => ({
      ...currentBooking,
      location: district,
    }));
    setIsDistrictOpen(false);
  };

  const handleSearchClick = () => {
    if (!selectedDistrict) {
      alert(t('bookingWidget.selectPickupAlert'));
      return;
    }

    onSearch();
  };

  return (
    <div className="widget-wrapper">
      <div className="booking-widget">
        <div className="booking-tabs">
          <button className="booking-tab" type="button">
            <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
              <path
                d="M3 8h12M1 5l2-4h10l2 4M2 8v5h2v-1h10v1h2V8"
                stroke="#00d4ff"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <circle cx="5" cy="11" r="1.5" fill="#00d4ff" />
              <circle cx="13" cy="11" r="1.5" fill="#00d4ff" />
            </svg>
            {t('bookingWidget.cars')}
          </button>
        </div>

        <div className="booking-inputs">
          <div className="booking-field booking-field--location" ref={districtDropdownRef}>
            <div className="booking-label">{t('bookingWidget.pickupArea')}</div>

            <button
              className={`booking-input-box district-select-trigger ${
                isDistrictOpen ? 'district-select-trigger--open' : ''
              }`}
              type="button"
              onClick={() => setIsDistrictOpen((isOpen) => !isOpen)}
              aria-haspopup="listbox"
              aria-expanded={isDistrictOpen}
            >
              <svg className="booking-field-icon" width="16" height="20" viewBox="0 0 16 20" fill="none">
                <path
                  d="M8 0C4.686 0 2 2.686 2 6c0 5.25 6 14 6 14s6-8.75 6-14c0-3.314-2.686-6-6-6zm0 8.5A2.5 2.5 0 1 1 8 3.5a2.5 2.5 0 0 1 0 5z"
                  fill="#00d4ff"
                />
              </svg>

              <span className={selectedDistrict ? 'booking-input-value' : 'booking-input-placeholder'}>
                {selectedDistrict || t('bookingWidget.selectDistrict')}
              </span>

              <span className="district-select-chevron" aria-hidden="true">▾</span>
            </button>

            {isDistrictOpen && (
              <div className="district-dropdown" role="listbox">
                <div className="district-dropdown-header">{t('bookingWidget.city')}</div>

                {HCM_DISTRICTS.map((district) => (
                  <button
                    key={district}
                    className={`district-option ${
                      selectedDistrict === district ? 'district-option--selected' : ''
                    }`}
                    type="button"
                    role="option"
                    aria-selected={selectedDistrict === district}
                    onClick={() => handleDistrictSelect(district)}
                  >
                    <span>{district}</span>
                    {selectedDistrict === district && <span className="district-option-check">✓</span>}
                  </button>
                ))}
              </div>
            )}

            <p className="booking-location-note">
              {t('bookingWidget.note')}
            </p>
          </div>

          <div
            className="booking-field booking-field--clickable"
            onClick={onOpenCalendar}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') onOpenCalendar();
            }}
          >
            <div className="booking-label">{t('bookingWidget.pickupDate')}</div>

            <div className="booking-input-box">
              <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                <rect
                  x="1"
                  y="3"
                  width="16"
                  height="16"
                  rx="2"
                  stroke="#00d4ff"
                  strokeWidth="1.5"
                />
                <path
                  d="M5 1v4M13 1v4M1 8h16"
                  stroke="#00d4ff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>

              <span className={booking.pickupDate ? 'booking-input-value' : 'booking-input-placeholder'}>
                {formatDateTimeLabel(booking.pickupDate, booking.pickupTime, t('bookingWidget.pickupDatePlaceholder'))}
              </span>
            </div>
          </div>

          <div
            className="booking-field booking-field--clickable"
            onClick={onOpenCalendar}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') onOpenCalendar();
            }}
          >
            <div className="booking-label">{t('bookingWidget.returnDate')}</div>

            <div className="booking-input-box">
              <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                <rect
                  x="1"
                  y="3"
                  width="16"
                  height="16"
                  rx="2"
                  stroke="#00d4ff"
                  strokeWidth="1.5"
                />
                <path
                  d="M5 1v4M13 1v4M1 8h16"
                  stroke="#00d4ff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>

              <span className={booking.returnDate ? 'booking-input-value' : 'booking-input-placeholder'}>
                {formatDateTimeLabel(booking.returnDate, booking.returnTime, t('bookingWidget.returnDatePlaceholder'))}
              </span>
            </div>
          </div>

          <button className="show-cars-btn" type="button" onClick={handleSearchClick}>
            {t('bookingWidget.showCars')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingWidget;
