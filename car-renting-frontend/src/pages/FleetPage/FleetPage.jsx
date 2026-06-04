import React, { useEffect, useMemo, useState } from 'react';
import { DarkNavbar } from '../../components/Navbar/Navbar';
import { FleetFooter } from '../../components/Footer/Footer';
import CarCard from '../../components/CarCard/CarCard';
import { getCars } from '../../services/carService';
import { buildDateRangeLabel, normalizeDateForApi } from '../../utils/bookingFormat';
import './FleetPage.css';

const VEHICLE_CATEGORIES = [
  {
    key: 'ALL',
    label: 'All Cars',
    description: 'Show every available car for your selected schedule.',
  },
  {
    key: 'ECONOMY',
    label: 'Economy',
    description: 'Budget-friendly cars for city trips, daily errands, and simple rentals.',
  },
  {
    key: 'SUV',
    label: 'SUVs & 7-Seaters',
    description: 'Spacious vehicles for families, luggage, weekend trips, and longer journeys.',
  },
  {
    key: 'PREMIUM',
    label: 'Premium',
    description: 'High-end vehicles for business meetings, events, and premium comfort.',
  },
];

function FleetPage({
  booking,
  onSelectCar,
  onHome,
  onEditSchedule,
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
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('lowest');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  
  const rawPickupDate =
    booking?.pickupDate ||
    booking?.pickup_date ||
    booking?.startDate ||
    booking?.start_date;

  const rawReturnDate =
    booking?.returnDate ||
    booking?.return_date ||
    booking?.endDate ||
    booking?.end_date;

  const pickupLocation =
    booking?.location ||
    booking?.pickupLocation ||
    booking?.pickup_location ||
    booking?.pickupArea ||
    booking?.pickup_area;

  const pickupDateForApi = useMemo(
    () => normalizeDateForApi(rawPickupDate),
    [rawPickupDate]
  );

  const returnDateForApi = useMemo(
    () => normalizeDateForApi(rawReturnDate),
    [rawReturnDate]
  );

  const bookingForLabel = useMemo(
    () => ({
      ...booking,
      location: pickupLocation,
      pickupDate: rawPickupDate,
      returnDate: rawReturnDate,
    }),
    [booking, pickupLocation, rawPickupDate, rawReturnDate]
  );

  const activeCategory = VEHICLE_CATEGORIES.find(
    (category) => category.key === selectedCategory
  );

  useEffect(() => {
    let ignore = false;

    const fetchCars = async () => {
      try {
        setLoading(true);
        setError('');

        const carsData = await getCars({
          pickupDate: pickupDateForApi,
          returnDate: returnDateForApi,
          location: pickupLocation,
          category: selectedCategory,
        });

        if (!ignore) {
          setCars(Array.isArray(carsData) ? carsData : []);
        }
      } catch (err) {
        console.error('Failed to fetch cars:', err);

        if (!ignore) {
          setError('Cannot load cars from server. Please check backend.');
          setCars([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchCars();

    return () => {
      ignore = true;
    };
  }, [pickupDateForApi, returnDateForApi, pickupLocation, selectedCategory]);

  const filteredCars = cars
    .filter((car) => {
      const status = String(car.status || 'AVAILABLE').toUpperCase();
      return status === 'AVAILABLE';
    })
    .filter((car) => {
      const keyword = search.trim().toLowerCase();

      if (!keyword) return true;

      return (
        car.name?.toLowerCase().includes(keyword) ||
        car.brand?.toLowerCase().includes(keyword) ||
        car.model?.toLowerCase().includes(keyword) ||
        car.category?.toLowerCase().includes(keyword) ||
        car.category_label?.toLowerCase().includes(keyword) ||
        car.fuel_type?.toLowerCase().includes(keyword) ||
        car.fuelType?.toLowerCase().includes(keyword) ||
        car.transmission?.toLowerCase().includes(keyword)
      );
    })
    .sort((a, b) => {
      const priceA = Number(a.price_per_day || a.pricePerDay || a.price || 0);
      const priceB = Number(b.price_per_day || b.pricePerDay || b.price || 0);

      return sort === 'lowest' ? priceA - priceB : priceB - priceA;
    });

  return (
    <div className="fleet-page">
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

      <div className="fleet-container">
        <div className="fleet-header">
          <div>
            <p className="fleet-eyebrow">Choose your vehicle</p>
            <h1 className="fleet-h1">Which Car Do You Want To Drive?</h1>
          </div>

          <div className="fleet-filters">
            <button className="filter-summary-pill" type="button" onClick={onEditSchedule}>
              <div className="filter-summary-col">
                <span className="filter-pill-label">Location</span>
                <span className="filter-pill-value">
                  {pickupLocation || 'Select pickup area'}
                </span>
              </div>

              <div className="filter-divider" />

              <div className="filter-summary-col">
                <span className="filter-pill-label">Date & Time</span>
                <span className="filter-pill-value">{buildDateRangeLabel(bookingForLabel)}</span>
              </div>

              <span className="filter-edit-icon">✎</span>
            </button>

            <div className="fleet-search-wrap">
              <svg
                className="fleet-search-icon"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M11 11l3 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>

              <input
                className="fleet-search-input"
                type="text"
                placeholder="Search car keywords..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <button
              className="fleet-filter-btn"
              type="button"
              onClick={() =>
                setSort((currentSort) => (currentSort === 'lowest' ? 'highest' : 'lowest'))
              }
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M3 6h18M6 12h12M10 18h4" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {sort === 'lowest' ? 'Lowest price' : 'Highest price'} ▾
            </button>
          </div>
        </div>

        <section className="vehicle-category-section">
          <div className="vehicle-category-heading">
            <p className="vehicle-category-kicker">Vehicle Type</p>
            <h2>{activeCategory?.label || 'All Cars'}</h2>
            <p>{activeCategory?.description}</p>
          </div>

          <div className="vehicle-category-tabs">
            {VEHICLE_CATEGORIES.map((category) => (
              <button
                key={category.key}
                className={`vehicle-category-tab ${
                  selectedCategory === category.key ? 'vehicle-category-tab--active' : ''
                }`}
                type="button"
                onClick={() => setSelectedCategory(category.key)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="fleet-empty">
            <p>Loading cars for your selected schedule...</p>
          </div>
        ) : error ? (
          <div className="fleet-empty">
            <p>{error}</p>
          </div>
        ) : filteredCars.length > 0 ? (
          <div className="fleet-grid">
            {filteredCars.map((car) => (
              <CarCard key={car.id} car={car} onClick={onSelectCar} />
            ))}
          </div>
        ) : (
          <div className="fleet-empty">
            <p>
              {search
                ? `Cannot find available car with keyword "${search}".`
                : `No available cars in ${
                    activeCategory?.label || 'this category'
                  } for this schedule.`}
            </p>

            {selectedCategory !== 'ALL' && (
              <button
                className="fleet-empty-action"
                type="button"
                onClick={() => setSelectedCategory('ALL')}
              >
                View All Cars
              </button>
            )}
          </div>
        )}
      </div>

      <FleetFooter />
    </div>
  );
}

export default FleetPage;