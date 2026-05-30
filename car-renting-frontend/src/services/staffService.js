import { apiRequest } from '../config/api';

export const getStaffDashboard = async () => {
  const result = await apiRequest('/api/staff/dashboard', {
    method: 'GET',
    auth: true,
  });

  return result.data;
};

export const getStaffBookings = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);

  const query = params.toString() ? `?${params.toString()}` : '';
  const result = await apiRequest(`/api/staff/bookings${query}`, {
    method: 'GET',
    auth: true,
  });

  return result.data || [];
};

export const getStaffBookingById = async (bookingId) => {
  const result = await apiRequest(`/api/staff/bookings/${bookingId}`, {
    method: 'GET',
    auth: true,
  });

  return result.data;
};

export const markStaffBookingPickedUp = async (bookingId) => {
  const result = await apiRequest(`/api/staff/bookings/${bookingId}/pickup`, {
    method: 'PATCH',
    auth: true,
    body: {},
  });

  return result.data;
};

export const completeStaffBooking = async (bookingId, carStatus = 'AVAILABLE') => {
  const result = await apiRequest(`/api/staff/bookings/${bookingId}/complete`, {
    method: 'PATCH',
    auth: true,
    body: { carStatus },
  });

  return result.data;
};

export const cancelStaffBooking = async (bookingId) => {
  const result = await apiRequest(`/api/staff/bookings/${bookingId}/cancel`, {
    method: 'PATCH',
    auth: true,
    body: {},
  });

  return result.data;
};

export const getStaffCars = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);

  const query = params.toString() ? `?${params.toString()}` : '';
  const result = await apiRequest(`/api/staff/cars${query}`, {
    method: 'GET',
    auth: true,
  });

  return result.data || [];
};

export const updateStaffCarStatus = async (carId, status) => {
  const result = await apiRequest(`/api/staff/cars/${carId}/status`, {
    method: 'PATCH',
    auth: true,
    body: { status },
  });

  return result.data;
};
