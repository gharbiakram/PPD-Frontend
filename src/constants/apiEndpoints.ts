import { API_BASE_URL } from './apiConfig';

export const API_ENDPOINTS = {
  COURSES: {
    NEW: `${API_BASE_URL}/courses/new`,
    POPULAR: `${API_BASE_URL}/courses/popular`,
    DISCOVER: `${API_BASE_URL}/courses/discover`,
    SEARCH: `${API_BASE_URL}/courses/search`,
    GET: `${API_BASE_URL}/courses/`,
    INSTRUCTOR: `${API_BASE_URL}/courses/instructorCourses`,
  },
  USERS: {
    CREATE: `${API_BASE_URL}/user`,
    LOGIN: `${API_BASE_URL}/user/login`,
    REFRESH_TOKEN: `${API_BASE_URL}/user/refreshToken`,
  },
  AI: {
    BASE: `${API_BASE_URL}/ai`,
    CHAT: `${API_BASE_URL}/ai/chat`,
    SUMMARY: `${API_BASE_URL}/ai/summary`,
    QUIZ: `${API_BASE_URL}/ai/quiz`,
    SENTIMENT: `${API_BASE_URL}/ai/sentiment`,
    EMOTION: `${API_BASE_URL}/ai/emotion`,
    MONITORING: `${API_BASE_URL}/ai/monitoring`,
    HEALTH: `${API_BASE_URL}/ai/health`,
  },
} as const;