import { apiRequest } from '../config/api';
import { normalizeDateForApi } from '../utils/bookingFormat';

const normalizeCategoryForApi = (category) => {
  if (!category || category === 'ALL') return null;

  return String(category).trim().toUpperCase();
};

const buildCarQuery = (filters = {}) => {
  const params = new URLSearchParams();

  const pickupDate = normalizeDateForApi(filters.pickupDate);
  const returnDate = normalizeDateForApi(filters.returnDate);
  const category = normalizeCategoryForApi(filters.category);

  if (pickupDate) params.set('pickupDate', pickupDate);
  if (returnDate) params.set('returnDate', returnDate);
  if (filters.location) params.set('location', filters.location);
  if (category) params.set('category', category);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

export const getCars = async (filters = {}) => {
  const result = await apiRequest(`/api/cars${buildCarQuery(filters)}`);
  return Array.isArray(result) ? result : result.data || [];
};

export const getCarById = async (carId) => {
  const result = await apiRequest(`/api/cars/${carId}`);
  return result.data;
};