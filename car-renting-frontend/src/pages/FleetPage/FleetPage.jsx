import React, { useState } from 'react';
import { DarkNavbar } from '../../components/Navbar/Navbar';
import { FleetFooter } from '../../components/Footer/Footer';
import CarCard from '../../components/CarCard/CarCard';
import CARS from '../../data/cars';
import './FleetPage.css';

function FleetPage({ booking, onSelectCar, onHome }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('lowest'); 

  const filteredCars = CARS
    .filter((car) =>
      car.name.toLowerCase().includes(search.toLowerCase()) ||
      car.type.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sort === 'lowest' ? a.price - b.price : b.price - a.price
    );

  return (
    <div className="fleet-page">
      <DarkNavbar onHome={onHome} />
      <div className="fleet-container">
        
        {/* ===== HEADER: Tiêu đề + Bộ lọc ===== */}
        <div className="fleet-header">
          <h1 className="fleet-h1">Which Car Do You Want To Drive?</h1>

          <div className="fleet-filters">
            {/* Pill hiển thị tóm tắt booking */}
            <div className="filter-summary-pill">
              <div className="filter-summary-col">
                <span className="filter-pill-label">Location</span>
                <span className="filter-pill-value">
                  {booking?.location || 'Perth Airport'}
                </span>
              </div>
              <div className="filter-divider" />
              <div className="filter-summary-col">
                <span className="filter-pill-label">Date & Time</span>
                <span className="filter-pill-value">
                  Apr 15, 12:00 PM - Apr 16, 12:00 PM
                </span>
              </div>
              <span className="filter-edit-icon">✎</span>
            </div>

            {/* Ô tìm kiếm */}
            <div className="fleet-search-wrap">
              <svg className="fleet-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                className="fleet-search-input"
                type="text"
                placeholder="Search car keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Nút Sort */}
            <button
              className="fleet-filter-btn"
              onClick={() => setSort((s) => (s === 'lowest' ? 'highest' : 'lowest'))}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 6h18M6 12h12M10 18h4" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {sort === 'lowest' ? 'Lowest price' : 'Highest price'} ▾
            </button>

          </div>
        </div>

        {/* ===== GRID XE ===== */}
        {filteredCars.length > 0 ? (
          <div className="fleet-grid">
            {filteredCars.map((car) => (
              <CarCard key={car.id} car={car} onClick={onSelectCar} />
            ))}
          </div>
        ) : (
          <div className="fleet-empty">
            <p>Can not find car with keyword "<strong>{search}</strong>"</p>
          </div>
        )}
      </div>

      <FleetFooter />
    </div>
  );
}

export default FleetPage;