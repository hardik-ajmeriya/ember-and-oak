import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 15000,
});

const TOKEN_KEY = 'emberoak.token';

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* storage unavailable — session-only auth */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* no-op */
    }
  },
};

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // A cancelled request is not a failure — let callers ignore it.
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
      return Promise.reject(Object.assign(error, { name: 'CanceledError' }));
    }
    if (error.response?.status === 401) tokenStore.clear();
    // Normalise every failure into a readable message for the UI layer.
    const message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED'
        ? 'The request timed out. Check that the API server is running.'
        : 'Could not reach the server. Is the API running on port 5001?');
    return Promise.reject(Object.assign(new Error(message), {
      status: error.response?.status,
      details: error.response?.data?.details,
    }));
  }
);

export default api;
