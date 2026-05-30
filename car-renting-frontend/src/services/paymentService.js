import { apiRequest } from '../config/api';

export const PAYMENT_METHODS = {
  BANK_CARD: 'BANK_CARD',
  CASH: 'CASH',
};

export const PAYMENT_METHOD_LABELS = {
  BANK_CARD: 'Bank Card',
  DEMO_CARD: 'Bank Card',
  CARD: 'Bank Card',
  CASH: 'Cash',
};

export const PAYMENT_STATUS_LABELS = {
  PENDING: 'Pending',
  SUCCESS: 'Success',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};

export const createPayment = async ({ bookingId, amount, method }) => {
  const result = await apiRequest('/api/payments', {
    method: 'POST',
    auth: true,
    body: {
      bookingId,
      amount,
      method,
    },
  });

  return result.data;
};

export const getPaymentByBookingId = async (bookingId) => {
  const result = await apiRequest(`/api/payments/booking/${bookingId}`, {
    method: 'GET',
    auth: true,
  });

  return result.data;
};
