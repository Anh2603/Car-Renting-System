import { apiRequest } from '../config/api';

export const createBooking = async (payload) => {
  const result = await apiRequest('/api/bookings', {
    method: 'POST',
    auth: true,
    body: payload,
  });

  return result.data;
};

export const getMyBookings = async () => {
  const result = await apiRequest('/api/bookings/my-bookings', {
    method: 'GET',
    auth: true,
  });

  return result.data || [];
};


export const cancelMyBooking = async (bookingId) => {
  const result = await apiRequest(`/api/bookings/${bookingId}/cancel`, {
    method: 'PUT',
    auth: true,
  });

  return result.data;
};
