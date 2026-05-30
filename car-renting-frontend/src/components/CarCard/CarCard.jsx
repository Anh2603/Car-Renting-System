import React, { useState } from "react";
import "./CarCard.css";

function CarCard({ car, onClick }) {
  const [imageError, setImageError] = useState(false);

  const carType = car.type || `${car.brand || ""} ${car.model || ""}`.trim();
  const carImage = car.image || car.image_url;
  const carPrice = Number(car.price || car.price_per_day || 0);
  const carBags = car.bags || 2;

  const fallbackImage =
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80";

  return (
    <article className="car-card" onClick={() => onClick(car)}>
      <div className="car-card__header">
        <h3 className="car-card__title">{car.name}</h3>
        <p className="car-card__type">{carType}</p>

        <div className="car-card__specs">
          <span className="car-spec">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle
                cx="7"
                cy="4.5"
                r="2.5"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M1.5 13c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
            {car.seats || 5}
          </span>

          <span className="car-spec">
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
              <rect
                x="1"
                y="3"
                width="10"
                height="10"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M4 3V2a2 2 0 0 1 4 0v1"
                stroke="currentColor"
                strokeWidth="1.3"
              />
            </svg>
            {carBags}
          </span>
        </div>
      </div>

      <div className="car-card__img-wrap">
        <img
          src={imageError ? fallbackImage : carImage}
          alt={car.name}
          className="car-card__image"
          onError={() => setImageError(true)}
        />
      </div>

      <div className="car-card__footer">
        <div className="car-card__unlimited">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6l3 3 5-5"
              stroke="#16a34a"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Unlimited kilometers
        </div>

        <div>
          <span className="car-card__price">
            {carPrice.toLocaleString("vi-VN")}
          </span>
          <span className="car-card__price-unit"> VND/day</span>
        </div>
      </div>
    </article>
  );
}

export default CarCard;