import apiClient from './apiClient';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import type {
  AiChatRequest,
  AiEmotionRequest,
  AiEmotionResponse,
  AiModuleQuizRequest,
  AiModuleSummaryRequest,
  AiMonitoringResponse,
  AiRecommendationsProfile,
  AiRecommendationsRequest,
  AiRecommendationsResult,
  AiQuizRequest,
  AiSentimentRequest,
  AiSentimentResponse,
  AiSummaryRequest,
  AiTextResponse,
} from '@/types/AiTypes';

const handleApiError = (error: any, fallbackMessage: string): never => {
  const message = error?.response?.data?.message || error?.response?.data?.error || error?.message || fallbackMessage;
  throw new Error(message);
};

export const AiService = {
  async chat(request: AiChatRequest): Promise<AiTextResponse> {
    try {
      const response = await apiClient.post<AiTextResponse>(API_ENDPOINTS.AI.CHAT, request);
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'AI chat request failed');
    }
  },

  async summarize(request: AiSummaryRequest): Promise<AiTextResponse> {
    try {
      const response = await apiClient.post<AiTextResponse>(API_ENDPOINTS.AI.SUMMARY, request);
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'AI summary request failed');
    }
  },

  async generateQuiz(request: AiQuizRequest): Promise<AiTextResponse> {
    try {
      const response = await apiClient.post<AiTextResponse>(API_ENDPOINTS.AI.QUIZ, request);
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'AI quiz request failed');
    }
  },

  async summarizeModule(moduleId: number, request: AiModuleSummaryRequest): Promise<AiTextResponse> {
    try {
      const response = await apiClient.post<AiTextResponse>(`${API_ENDPOINTS.AI.MODULES}/${moduleId}/summary`, request);
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'AI module summary request failed');
    }
  },

  async generateModuleQuiz(moduleId: number, request: AiModuleQuizRequest): Promise<AiTextResponse> {
    try {
      const response = await apiClient.post<AiTextResponse>(`${API_ENDPOINTS.AI.MODULES}/${moduleId}/quiz`, request);
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'AI module quiz request failed');
    }
  },

  async analyzeSentiment(request: AiSentimentRequest): Promise<AiSentimentResponse> {
    try {
      const response = await apiClient.post<AiSentimentResponse>(API_ENDPOINTS.AI.SENTIMENT, request);
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'AI sentiment request failed');
    }
  },

  async analyzeEmotion(request: AiEmotionRequest): Promise<AiEmotionResponse> {
    try {
      const response = await apiClient.post<AiEmotionResponse>(API_ENDPOINTS.AI.EMOTION, request);
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'AI emotion request failed');
    }
  },

  async getMonitoringSnapshot(): Promise<AiMonitoringResponse> {
    try {
      const response = await apiClient.get<AiMonitoringResponse>(API_ENDPOINTS.AI.MONITORING);
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'AI monitoring request failed');
    }
  },

  async getRecommendationsProfile(): Promise<AiRecommendationsProfile> {
    try {
      const response = await apiClient.get<AiRecommendationsProfile>(API_ENDPOINTS.AI.RECOMMENDATIONS_PROFILE);
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'AI recommendations profile request failed');
    }
  },

  async recommendCourses(request: AiRecommendationsRequest): Promise<AiRecommendationsResult> {
    try {
      const response = await apiClient.post<AiRecommendationsResult>(API_ENDPOINTS.AI.RECOMMENDATIONS, request);
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'AI recommendations request failed');
    }
  },
};
