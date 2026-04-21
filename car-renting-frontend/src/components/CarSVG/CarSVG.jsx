import React from 'react';

/* ===== CAR SVG ILLUSTRATIONS =====
 * Vẽ SVG xe theo loại (sedan, suv, pickup) và màu sắc truyền vào
 * Props:
 *   color  — màu hex thân xe
 *   type   — loại xe (string, VD: 'STANDARD SUV AUTOMATIC')
 */

/* --- Xe bán tải (Pickup) --- */
function PickupSVG({ color }) {
  return (
    <svg viewBox="0 0 280 140" style={{ width: '100%', height: '100%', maxHeight: '160px' }}>
      <defs>
        <linearGradient id={`pg${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <ellipse cx="140" cy="118" rx="120" ry="10" fill="rgba(0,0,0,0.15)" />
      <rect x="20" y="75" width="240" height="38" rx="4" fill={`url(#pg${color.replace('#','')})`} />
      <rect x="120" y="45" width="100" height="32" rx="8" fill={color} />
      <rect x="90" y="52" width="32" height="25" rx="4" fill={color} />
      <rect x="122" y="48" width="94" height="22" rx="4" fill="rgba(140,200,240,0.3)" />
      <circle cx="65" cy="113" r="18" fill="#1a1a2e" stroke="#333" strokeWidth="2" />
      <circle cx="65" cy="113" r="10" fill="#2a2a3a" />
      <circle cx="65" cy="113" r="4" fill="#444" />
      <circle cx="205" cy="113" r="18" fill="#1a1a2e" stroke="#333" strokeWidth="2" />
      <circle cx="205" cy="113" r="10" fill="#2a2a3a" />
      <circle cx="205" cy="113" r="4" fill="#444" />
    </svg>
  );
}

/* --- Xe SUV --- */
function SuvSVG({ color }) {
  return (
    <svg viewBox="0 0 280 140" style={{ width: '100%', height: '100%', maxHeight: '160px' }}>
      <defs>
        <linearGradient id={`sg${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.65" />
        </linearGradient>
      </defs>
      <ellipse cx="140" cy="118" rx="115" ry="9" fill="rgba(0,0,0,0.15)" />
      <rect x="15" y="72" width="250" height="40" rx="6" fill={`url(#sg${color.replace('#','')})`} />
      <path d="M 55 72 L 75 42 L 200 42 L 225 72 Z" fill={color} />
      <rect x="78" y="46" width="56" height="24" rx="3" fill="rgba(140,200,240,0.35)" />
      <rect x="142" y="46" width="56" height="24" rx="3" fill="rgba(140,200,240,0.25)" />
      <circle cx="62" cy="112" r="20" fill="#1a1a2e" stroke="#2a2a3a" strokeWidth="2" />
      <circle cx="62" cy="112" r="12" fill="#252535" />
      <circle cx="62" cy="112" r="5" fill="#333" />
      <circle cx="210" cy="112" r="20" fill="#1a1a2e" stroke="#2a2a3a" strokeWidth="2" />
      <circle cx="210" cy="112" r="12" fill="#252535" />
      <circle cx="210" cy="112" r="5" fill="#333" />
      <rect x="230" y="80" width="30" height="16" rx="3" fill="rgba(255,200,0,0.6)" />
      <rect x="18" y="80" width="24" height="16" rx="3" fill="rgba(255,100,0,0.5)" />
    </svg>
  );
}

/* --- Xe Sedan/Hatchback --- */
function SedanSVG({ color }) {
  return (
    <svg viewBox="0 0 280 140" style={{ width: '100%', height: '100%', maxHeight: '160px' }}>
      <defs>
        <linearGradient id={`sed${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <ellipse cx="140" cy="118" rx="110" ry="8" fill="rgba(0,0,0,0.12)" />
      <rect x="20" y="78" width="240" height="36" rx="8" fill={`url(#sed${color.replace('#','')})`} />
      <path d="M 60 78 L 85 52 L 195 52 L 218 78 Z" fill={color} />
      <rect x="88" y="56" width="50" height="20" rx="3" fill="rgba(160,210,250,0.4)" />
      <rect x="142" y="56" width="50" height="20" rx="3" fill="rgba(160,210,250,0.3)" />
      <circle cx="65" cy="114" r="18" fill="#1a1a2e" stroke="#2a2a3a" strokeWidth="2" />
      <circle cx="65" cy="114" r="10" fill="#252535" />
      <circle cx="65" cy="114" r="4" fill="#333" />
      <circle cx="208" cy="114" r="18" fill="#1a1a2e" stroke="#2a2a3a" strokeWidth="2" />
      <circle cx="208" cy="114" r="10" fill="#252535" />
      <circle cx="208" cy="114" r="4" fill="#333" />
    </svg>
  );
}

/* ===== COMPONENT CHÍNH ===== */
function CarSVG({ color, type }) {
  const isPickup = type.includes('PICKUP');
  const isSUV = type.includes('SUV');

  if (isPickup) return <PickupSVG color={color} />;
  if (isSUV) return <SuvSVG color={color} />;
  return <SedanSVG color={color} />;
}

export default CarSVG;
