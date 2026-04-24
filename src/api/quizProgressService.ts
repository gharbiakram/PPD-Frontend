import apiClient from './apiClient';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import type { InstructorCourseQuizProgress } from '@/types/QuizProgressTypes';

export const QuizProgressService = {
  async getCourseProgress(courseId: number): Promise<InstructorCourseQuizProgress> {
    const response = await apiClient.get<InstructorCourseQuizProgress>(`${API_ENDPOINTS.QUIZ_PROGRESS.BASE}/courses/${courseId}`);
    return response.data;
  },

  async assignQuiz(payload: { quizId: number; enrollmentIds: number[]; dueAt?: string | null }) {
    const response = await apiClient.post(`${API_ENDPOINTS.QUIZ_PROGRESS.BASE}/assignments`, payload);
    return response.data;
  },

  async submitAttempt(payload: {
    quizId: number;
    enrollmentId: number;
    quizAssignmentId?: number | null;
    studentResponses: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    isCompleted: boolean;
    durationSeconds: number;
  }) {
    const response = await apiClient.post(`${API_ENDPOINTS.QUIZ_PROGRESS.BASE}/attempts`, payload);
    return response.data;
  },
};
