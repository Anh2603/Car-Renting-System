import { apiRequest } from '../config/api';

export const getAdminDashboard = async () => {
  const result = await apiRequest('/api/admin/dashboard', {
    method: 'GET',
    auth: true,
  });

  return result.data;
};

export const getAdminCars = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
  if (filters.category && filters.category !== 'ALL') params.set('category', filters.category);
  if (filters.search) params.set('search', filters.search);

  const query = params.toString() ? `?${params.toString()}` : '';
  const result = await apiRequest(`/api/admin/cars${query}`, {
    method: 'GET',
    auth: true,
  });

  return result.data || [];
};

export const createAdminCar = async (payload) => {
  const result = await apiRequest('/api/admin/cars', {
    method: 'POST',
    auth: true,
    body: payload,
  });

  return result.data;
};

export const updateAdminCar = async (carId, payload) => {
  const result = await apiRequest(`/api/admin/cars/${carId}`, {
    method: 'PUT',
    auth: true,
    body: payload,
  });

  return result.data;
};

export const updateAdminCarStatus = async (carId, status) => {
  const result = await apiRequest(`/api/admin/cars/${carId}/status`, {
    method: 'PATCH',
    auth: true,
    body: { status },
  });

  return result.data;
};

export const getAdminBookings = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);

  const query = params.toString() ? `?${params.toString()}` : '';
  const result = await apiRequest(`/api/admin/bookings${query}`, {
    method: 'GET',
    auth: true,
  });

  return result.data || [];
};

export const updateAdminBookingStatus = async (bookingId, status) => {
  const result = await apiRequest(`/api/admin/bookings/${bookingId}/status`, {
    method: 'PATCH',
    auth: true,
    body: { status },
  });

  return result.data;
};

export const getAdminUsers = async (filters = {}) => {
  const params = new URLSearchParams();

  params.set('role', filters.role || 'USER');
  if (filters.search) params.set('search', filters.search);

  const result = await apiRequest(`/api/admin/users?${params.toString()}`, {
    method: 'GET',
    auth: true,
  });

  return result.data || [];
};

export const updateAdminUserStatus = async (userId, status) => {
  const result = await apiRequest(`/api/admin/users/${userId}/status`, {
    method: 'PATCH',
    auth: true,
    body: { status },
  });

  return result.data;
};

export const getAdminStaff = async () => {
  const result = await apiRequest('/api/admin/staff', {
    method: 'GET',
    auth: true,
  });

  return result.data || [];
};

export const createAdminStaff = async (payload) => {
  const result = await apiRequest('/api/admin/staff', {
    method: 'POST',
    auth: true,
    body: payload,
  });

  return result.data;
};

export const updateAdminStaffStatus = async (staffId, status) => {
  const result = await apiRequest(`/api/admin/staff/${staffId}/status`, {
    method: 'PATCH',
    auth: true,
    body: { status },
  });

  return result.data;
};

export const getAdminPayments = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
  if (filters.method && filters.method !== 'ALL') params.set('method', filters.method);

  const query = params.toString() ? `?${params.toString()}` : '';
  const result = await apiRequest(`/api/admin/payments${query}`, {
    method: 'GET',
    auth: true,
  });

  return result.data || [];
};

export const updateAdminPaymentStatus = async (paymentId, status) => {
  const result = await apiRequest(`/api/admin/payments/${paymentId}/status`, {
    method: 'PATCH',
    auth: true,
    body: { status },
  });

  return result.data;
};
