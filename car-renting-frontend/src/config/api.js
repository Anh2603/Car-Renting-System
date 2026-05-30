const rawApiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, '');

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const getAuthToken = () => localStorage.getItem('token');

export const authHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiRequest = async (path, options = {}) => {
  const { auth = false, headers = {}, body, ...restOptions } = options;

  const response = await fetch(apiUrl(path), {
    ...restOptions,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(auth ? authHeaders() : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

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
