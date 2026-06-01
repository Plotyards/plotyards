const normalizeApiBaseUrl = (url) => String(url || '').replace(/\/+$/, '');

const API_BASE_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000/api')
);

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
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is required for production builds.');
  }

  const token = getToken();
  const shouldBypassNgrokWarning = API_BASE_URL.includes('.ngrok-free.');
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
    response = await fetch(`${API_BASE_URL}${path}`, {
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
    if (!errorMessage) {
      if (response.status === 401 || response.status === 403) {
        errorMessage = 'Backend authentication failed. Please verify your login session or premium subscription status.';
      } else {
        errorMessage = `Request failed with status ${response.status}`;
      }
    }
    throw new Error(errorMessage);
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
