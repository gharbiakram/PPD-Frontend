import axios from 'axios';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { API_BASE_URL } from '@/constants/apiConfig';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add request interceptor to inject the access token
apiClient.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const accessToken = user.accessToken || user.token;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          API_ENDPOINTS.USERS.REFRESH_TOKEN,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data.token || refreshResponse.data.accessToken;
        const userJson = localStorage.getItem('user');

        if (userJson) {
          const user = JSON.parse(userJson);
          user.accessToken = newAccessToken;
          localStorage.setItem('user', JSON.stringify(user));
        }

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        const userJson = localStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          delete user.accessToken;
          localStorage.setItem('user', JSON.stringify(user));
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;