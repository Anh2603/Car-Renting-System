import { apiRequest } from '../config/api';

const saveUserSession = ({ token, user }) => {
  if (token) {
    localStorage.setItem('token', token);
  }

  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const login = async ({ email, password }) => {
  const result = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  saveUserSession({ token: result.token, user: result.data });

  return result.data;
};

export const register = async ({ fullName, email, password, phone }) => {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: {
      full_name: fullName,
      email,
      password,
      phone,
    },
  });
};

export const getMyProfile = async () => {
  const result = await apiRequest('/api/auth/me', {
    method: 'GET',
    auth: true,
  });

  if (result.data) {
    localStorage.setItem('user', JSON.stringify(result.data));
  }

  return result.data;
};

export const updateMyProfile = async ({ fullName, email, phone }) => {
  const result = await apiRequest('/api/auth/profile', {
    method: 'PUT',
    auth: true,
    body: {
      full_name: fullName,
      email,
      phone,
    },
  });

  if (result.data) {
    localStorage.setItem('user', JSON.stringify(result.data));
  }

  return result.data;
};

export const changeMyPassword = async ({ currentPassword, newPassword, confirmPassword }) => {
  return apiRequest('/api/auth/change-password', {
    method: 'PUT',
    auth: true,
    body: {
      currentPassword,
      newPassword,
      confirmPassword,
    },
  });
};
