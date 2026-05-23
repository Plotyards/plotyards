const normalizeApiBaseUrl = (url) => String(url || '').replace(/\/+$/, '');

const DEFAULT_API_BASE_URL = import.meta.env.PROD
  ? 'https://relive-shiftless-small.ngrok-free.dev/api'
  : 'http://localhost:5000/api';

const API_BASE_URL = normalizeApiBaseUrl(
  import.meta.env.PROD ? DEFAULT_API_BASE_URL : import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL
);

export const getToken = () => localStorage.getItem('token');

export const setSession = ({ token, user }) => {
  if (token) localStorage.setItem('token', token);
  if (user) localStorage.setItem('user', JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    clearSession();
    return null;
  }
};

export const apiRequest = async (path, options = {}) => {
  const token = getToken();
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    'ngrok-skip-browser-warning': 'true',
    ...options.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : {};

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  return searchParams.toString() ? `?${searchParams.toString()}` : '';
};
