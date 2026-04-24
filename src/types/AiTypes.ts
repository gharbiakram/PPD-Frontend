export type AiSummaryMode = 'Short' | 'Detailed';
export type AiQuizDifficulty = 'Easy' | 'Medium' | 'Hard';
export type AiTextStatus = 'success' | 'fallback' | 'partial' | string;

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiChatRequest {
  message: string;
  language?: string;
  history?: AiChatMessage[];
  context?: string;
  strictGrounded?: boolean;
}

export interface AiSummaryRequest {
  text: string;
  maxBullets?: number;
  language?: string;
  mode?: AiSummaryMode;
}

export interface AiModuleSummaryRequest {
  maxBullets?: number;
  language?: string;
  mode?: AiSummaryMode;
}

export interface AiQuizRequest {
  text: string;
  questionsCount?: number;
  language?: string;
  difficulty?: AiQuizDifficulty;
  includeExplanations?: boolean;
}

export interface AiModuleQuizRequest {
  questionsCount?: number;
  language?: string;
  difficulty?: AiQuizDifficulty;
  includeExplanations?: boolean;
}

export interface AiQuizOption {
  label: string;
  text: string;
}

export interface AiQuizQuestion {
  question: string;
  options: Array<string | AiQuizOption>;
  correctAnswer?: string | string[];
  explanation?: string;
  allowMultiple?: boolean;
}

export interface AiQuizPayload {
  questions: AiQuizQuestion[];
  title?: string;
  description?: string;
}

export interface AiSentimentRequest {
  message: string;
  language?: string;
  moduleId?: number | null;
}

export interface AiEmotionRequest {
  message: string;
  language?: string;
  moduleId?: number | null;
}

export interface AiTextResponse {
  output: string;
  provider: string;
  model: string;
  conversationId?: string | null;
  quizId?: number | null;
  durationMs?: number | null;
  isFallback: boolean;
  status: AiTextStatus;
  sentiment?: string | null;
  emotion?: string | null;
  adaptationApplied: boolean;
}

export interface AiSentimentResponse {
  sentiment: string;
  confidence: number;
  rationale: string;
  provider: string;
  model: string;
}

export interface AiEmotionResponse {
  emotion: string;
  confidence: number;
  rationale: string;
  provider: string;
  model: string;
}

export interface AiMonitoringSnapshot {
  [key: string]: unknown;
}

export type AiMonitoringResponse = Record<string, AiMonitoringSnapshot>;
