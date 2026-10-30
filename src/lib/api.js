const normalizeApiBaseUrl = (url) => {
  let cleaned = String(url || '').trim().replace(/\/+$/, '');
  if (!cleaned) return 'https://srv1853103.hstgr.cloud/api';

  // Replace legacy or insecure IP addresses with the secure domain
  if (cleaned.includes('187.127.153.144') || cleaned.includes('187.127.175.192')) {
    cleaned = cleaned.replace(/https?:\/\/(?:187\.127\.(?:153\.144|175\.192))(?::\d+)?(\/api)?/i, 'https://srv1853103.hstgr.cloud/api');
  }

  // Ensure HTTPS when page is loaded over HTTPS to prevent Mixed Content blocking
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && cleaned.startsWith('http://')) {
    if (cleaned.includes('localhost') || cleaned.includes('127.0.0.1')) {
      return 'https://srv1853103.hstgr.cloud/api';
    }
    cleaned = cleaned.replace(/^http:\/\//i, 'https://');
  }

  return cleaned;
};

export const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    const rawUrl = process.env.NEXT_PUBLIC_API_URL;
    if (rawUrl && !rawUrl.includes('localhost') && !rawUrl.includes('127.0.0.1')) {
      return normalizeApiBaseUrl(rawUrl);
    }
    return 'https://srv1853103.hstgr.cloud/api';
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);
  }
  return 'https://srv1853103.hstgr.cloud/api';
};

export const API_BASE_URL = getBaseUrl();

export const getToken = () => {
  if (typeof window !== 'undefined') return localStorage.getItem('token');
  return null;
};

export const setSession = ({ token, user }) => {
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('token', token);
    if (user) localStorage.setItem('user', JSON.stringify(user));
  }
};

export const clearSession = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    clearSession();
    return null;
  }
};

export const apiRequest = async (path, options = {}) => {
  const activeBaseUrl = getBaseUrl();
  const shouldBypassNgrokWarning = String(activeBaseUrl).includes('.ngrok-free.');

  const token = getToken();
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(shouldBypassNgrokWarning ? { 'ngrok-skip-browser-warning': 'true' } : {}),
    ...options.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${activeBaseUrl}${path}`, {
      cache: 'no-store',
      ...options,
      headers,
      body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined
    });
  } catch (error) {
    throw new Error(`Network/Connection Error: ${error.message}. Please check if the server is running or if there's a CORS issue.`);
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : {};

  if (!response.ok) {
    let errorMessage = data.message;

    // Include field-level validation errors from express-validator
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const fieldErrors = data.errors
        .map((e) => e.message || e.msg)
        .filter(Boolean)
        .join('. ');
      errorMessage = fieldErrors || errorMessage;
    }

    if (!errorMessage) {
      if (response.status === 401 || response.status === 403) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else {
        errorMessage = `Request failed with status ${response.status}`;
      }
    }
    const err = new Error(errorMessage);
    if (Array.isArray(data.errors)) {
      err.fieldErrors = data.errors;
    }
    throw err;
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
