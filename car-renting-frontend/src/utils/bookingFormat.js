const MONTH_INDEX_FOR_LEGACY_DAYS = 10; // November, zero-based
const YEAR_FOR_LEGACY_DAYS = 2026;

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_24H_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const TIME_12H_REGEX = /^(0?[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM)$/i;

const pad2 = (value) => String(value).padStart(2, '0');

export const toDateInputValue = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;

  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

export const getTodayDateInputValue = () => toDateInputValue(new Date());

export const parseDateOnly = (dateValue) => {
  const normalizedDate = normalizeDateForApi(dateValue);
  if (!normalizedDate) return null;

  const [year, month, day] = normalizedDate.split('-').map(Number);
  const parsedDate = new Date(year, month - 1, day);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

export const addDaysToDate = (dateValue, dayCount = 1) => {
  const parsedDate = parseDateOnly(dateValue);
  if (!parsedDate) return null;

  parsedDate.setDate(parsedDate.getDate() + dayCount);
  return toDateInputValue(parsedDate);
};

export const calculateRentalDays = (pickupDate, returnDate) => {
  const pickup = parseDateOnly(pickupDate);
  const dropoff = parseDateOnly(returnDate);

  if (!pickup || !dropoff) return 1;

  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.ceil((dropoff.getTime() - pickup.getTime()) / msPerDay);

  return Math.max(1, diffDays);
};

export const normalizeDateForApi = (dateValue) => {
  if (!dateValue) return null;

  if (typeof dateValue === 'number') {
    return `${YEAR_FOR_LEGACY_DAYS}-11-${pad2(dateValue)}`;
  }

  if (dateValue instanceof Date) {
    return toDateInputValue(dateValue);
  }

  if (typeof dateValue === 'string') {
    const trimmedDate = dateValue.trim();

    if (/^\d{1,2}$/.test(trimmedDate)) {
      return `${YEAR_FOR_LEGACY_DAYS}-11-${trimmedDate.padStart(2, '0')}`;
    }

    if (DATE_ONLY_REGEX.test(trimmedDate)) {
      return trimmedDate;
    }

    if (trimmedDate.includes('T')) {
      const maybeDateOnly = trimmedDate.split('T')[0];
      return DATE_ONLY_REGEX.test(maybeDateOnly) ? maybeDateOnly : null;
    }

    const slashParts = trimmedDate.split('/');
    if (slashParts.length === 3) {
      const [day, month, year] = slashParts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    const parsedDate = new Date(trimmedDate);
    if (!Number.isNaN(parsedDate.getTime())) {
      return toDateInputValue(parsedDate);
    }
  }

  return null;
};

export const normalizeTimeForInput = (timeValue, fallback = '09:00') => {
  if (!timeValue || typeof timeValue !== 'string') return fallback;

  const trimmedTime = timeValue.trim();

  if (TIME_24H_REGEX.test(trimmedTime)) {
    return trimmedTime;
  }

  const match12h = trimmedTime.match(TIME_12H_REGEX);
  if (match12h) {
    let hour = Number(match12h[1]);
    const minute = match12h[2];
    const period = match12h[3].toUpperCase();

    if (period === 'AM' && hour === 12) hour = 0;
    if (period === 'PM' && hour !== 12) hour += 12;

    return `${pad2(hour)}:${minute}`;
  }

  return fallback;
};

export const formatTimeLabel = (timeValue, fallback = '') => {
  if (!timeValue) return fallback;

  const normalizedTime = normalizeTimeForInput(timeValue, null);
  if (!normalizedTime) return timeValue;

  return normalizedTime;
};

export const formatDateLabel = (dateValue, fallback = 'Select date') => {
  if (!dateValue) return fallback;

  if (typeof dateValue === 'number') {
    const legacyDate = new Date(YEAR_FOR_LEGACY_DAYS, MONTH_INDEX_FOR_LEGACY_DAYS, dateValue);
    return legacyDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const parsedDate = parseDateOnly(dateValue);
  if (!parsedDate) return fallback;

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateTimeLabel = (dateValue, timeValue, fallback = 'Select date') => {
  if (!dateValue) return fallback;

  const timeLabel = formatTimeLabel(timeValue);
  return `${formatDateLabel(dateValue)}${timeLabel ? ` | ${timeLabel}` : ''}`;
};

export const buildDateRangeLabel = (booking) => {
  if (!booking?.pickupDate || !booking?.returnDate) {
    return 'Choose rental schedule';
  }

  return `${formatDateTimeLabel(booking.pickupDate, booking.pickupTime)} - ${formatDateTimeLabel(
    booking.returnDate,
    booking.returnTime
  )}`;
};