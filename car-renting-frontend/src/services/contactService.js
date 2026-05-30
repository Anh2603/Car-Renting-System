import { apiRequest, apiUrl, authHeaders } from '../config/api';

const parseResponse = async (response) => {
  let result = null;
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    result = await response.json();
  } else {
    result = { success: response.ok, message: await response.text() };
  }

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || 'Request failed');
  }

  return result;
};

export const createContactMessage = async (payload) => {
  if (payload instanceof FormData) {
    const response = await fetch(apiUrl('/api/contact'), {
      method: 'POST',
      headers: {
        ...authHeaders(),
      },
      body: payload,
    });

    const result = await parseResponse(response);
    return result.data;
  }

  const result = await apiRequest('/api/contact', {
    method: 'POST',
    auth: true,
    body: payload,
  });

  return result.data;
};

export const getContactMessages = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);

  const query = params.toString() ? `?${params.toString()}` : '';
  const result = await apiRequest(`/api/contact/messages${query}`, {
    method: 'GET',
    auth: true,
  });

  return result.data || [];
};

export const updateContactMessageStatus = async (messageId, status) => {
  const result = await apiRequest(`/api/contact/messages/${messageId}/status`, {
    method: 'PATCH',
    auth: true,
    body: { status },
  });

  return result.data;
};
