export const DEFAULT_API_BASE_URL = 'https://mini-coursera-backend.onrender.com/api';

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = rawApiBaseUrl && rawApiBaseUrl.length > 0
  ? rawApiBaseUrl.replace(/\/$/, '')
  : DEFAULT_API_BASE_URL;

export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');
