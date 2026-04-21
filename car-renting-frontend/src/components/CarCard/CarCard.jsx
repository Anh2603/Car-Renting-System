import React from "react";
import "./CarCard.css";

/* ===== CAR CARD COMPONENT =====
 * Hiển thị một thẻ xe trong trang Fleet
 * Props:
 *   car       — object xe từ data/cars.js
 *   onClick   — hàm chọn xe
 */
function CarCard({ car, onClick }) {
  return (
    <article className="car-card" onClick={() => onClick(car)}>
      {/* Phần header: tên xe, loại, thông số */}
      <div className="car-card__header">
        <h3 className="car-card__title">{car.name}</h3>
        <p className="car-card__type">{car.type}</p>

        {/* Số ghế + số túi */}
        <div className="car-card__specs">
          <span className="car-spec">
            {/* Icon người */}
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
            {car.seats}
          </span>
          <span className="car-spec">
            {/* Icon túi */}
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
            {car.bags}
          </span>
        </div>
      </div>

      {/* Hình minh hoạ xe */}
      <div className="car-card__img-wrap">
        <img src={car.image} alt={car.name} className="car-card__image" />
      </div>

      {/* Footer: km không giới hạn + giá */}
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
            {car.price.toLocaleString("vi-VN")}
          </span>
          <span className="car-card__price-unit"> /day</span>
        </div>
      </div>
    </article>
  );
}

export default CarCard;
