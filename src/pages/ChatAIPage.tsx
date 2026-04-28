import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Lightbulb,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Search as SearchIcon,
  Sparkles,
  Trash2,
  Edit2,
  X,
  Zap,
} from 'lucide-react';
import { AiService } from '@/api/aiService';
import { CourseService } from '@/api/courseService';
import { EnrollmentService } from '@/api/enrollmentService';
import { UserContext } from '@/contexts/userContext';
import type { AiRecommendationsResult, AiTextResponse } from '@/types/AiTypes';
import type { CourseModule } from '@/types/CourseModule';
import QuizSlideshow from '@/components/AI/QuizSlideshow';
import { useNavigate } from 'react-router-dom';
import { resolveMediaUrl } from '@/lib/mediaUrl';

type Mode = 'chat' | 'summary' | 'quiz' | 'recommendations' | 'sentiment' | 'emotion' | 'monitoring';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type ResultState = {
  status: 'idle' | 'loading' | 'success' | 'error';
  title: string;
  message: string;
  response?: AiTextResponse;
  payload?: unknown;
};

type EnrolledCourseLite = {
  enrollmentId: number;
  courseId: number;
  courseTitle: string;
  isCompleted: boolean;
};

const DEFAULT_RESULT: ResultState = {
  status: 'idle',
  title: 'Ready to assist',
  message: 'Choose a mode, then send a request to the backend AI endpoints.',
};

const STORAGE_KEY = 'ppd-ai-chat-history';

const readRecentThreads = (): string[] => {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    if (!storedValue) {
      return [];
    }

    const parsed = JSON.parse(storedValue);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const wait = (ms: number) => new Promise<void>((resolve) => {
  setTimeout(resolve, ms);
});

const SummaryResult = ({ message }: { message: string }) => {
  const lines = message
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const bulletLines = lines
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, '').trim());

  const introLine = lines.find((line) => !/^[-*]\s+/.test(line));

  return (
    <div className="space-y-3 text-sm text-gray-700">
      {introLine && <p className="leading-6 text-gray-700">{introLine}</p>}

      {bulletLines.length > 0 ? (
        <ul className="space-y-2 rounded-xl bg-blue-50/60 p-4 leading-6 text-blue-950">
          {bulletLines.map((item, index) => (
            <li key={`${item}-${index}`} className="flex items-start gap-2">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        !introLine && <p className="leading-6 text-gray-700">{message}</p>
      )}
    </div>
  );
};

const ChatAIPage = () => {
  const { user } = useContext(UserContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('chat');
  const [inputValue, setInputValue] = useState('');
  const [secondaryValue, setSecondaryValue] = useState('');
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [recentThreads, setRecentThreads] = useState<string[]>(() => readRecentThreads());
  const [result, setResult] = useState<ResultState>(DEFAULT_RESULT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseLite[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<number | null>(null);
  const [courseModules, setCourseModules] = useState<CourseModule[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [isLoadingCourseContext, setIsLoadingCourseContext] = useState(false);
  const [emotionRequestState, setEmotionRequestState] = useState<'idle' | 'queued' | 'sending' | 'retrying'>('idle');
  const [recommendationResult, setRecommendationResult] = useState<AiRecommendationsResult | null>(null);
  const [recommendationProfileLoaded, setRecommendationProfileLoaded] = useState(false);
  const emotionCooldownRef = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentThreads.slice(0, 12)));
  }, [recentThreads]);

  const canUseMonitoring = user?.userType === 2;
  const isAuthenticated = Boolean(user?.accessToken);
  const isStudent = user?.userType === 1;

  useEffect(() => {
    if (!isAuthenticated || !isStudent) {
      setEnrolledCourses([]);
      setSelectedCourseId(null);
      setSelectedEnrollmentId(null);
      setCourseModules([]);
      setSelectedModuleId(null);
      return;
    }

    const loadEnrolledCourses = async () => {
      try {
        const data = await EnrollmentService.getEnrolledCoursesByStudentId();
        const mappedCourses: EnrolledCourseLite[] = (data || []).map((item: any) => ({
          enrollmentId: item.id,
          courseId: item.courseID,
          courseTitle: item.courseTitle || `Course ${item.courseID}`,
          isCompleted: Boolean(item.isCompleted),
        }));

        setEnrolledCourses(mappedCourses);
      } catch {
        setEnrolledCourses([]);
      }
    };

    loadEnrolledCourses();
  }, [isAuthenticated, isStudent]);

  useEffect(() => {
    if (mode !== 'summary' && mode !== 'quiz') {
      setSelectedModuleId(null);
      setCourseModules([]);
      setSelectedCourseId(null);
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== 'emotion') {
      setEmotionRequestState('idle');
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== 'recommendations' || !isStudent || !isAuthenticated || recommendationProfileLoaded) {
      return;
    }

    const loadRecommendationProfile = async () => {
      try {
        const profile = await AiService.getRecommendationsProfile();
        if (profile?.ambitions) {
          setInputValue(profile.ambitions);
        }
        if (profile?.interests) {
          setSecondaryValue(profile.interests);
        }
      } catch {
        // Ignore profile prefill errors to avoid blocking recommendation workflow.
      } finally {
        setRecommendationProfileLoaded(true);
      }
    };

    loadRecommendationProfile();
  }, [mode, isStudent, isAuthenticated, recommendationProfileLoaded]);

  const modeMeta = useMemo(() => {
    switch (mode) {
      case 'summary':
        return {
          title: 'Summary mode',
          helper: 'Paste text or learning content to generate a concise summary.',
          primaryLabel: 'Source text',
          secondaryLabel: 'Max bullets',
        };
      case 'quiz':
        return {
          title: 'Quiz mode',
          helper: 'Submit study material and ask for questions with answers.',
          primaryLabel: 'Source text',
          secondaryLabel: 'Questions count',
        };
      case 'recommendations':
        return {
          title: 'Course recommendations',
          helper: 'Share your ambitions and interests to get personalized course suggestions.',
          primaryLabel: 'Ambitions',
          secondaryLabel: 'Interests',
        };
      case 'sentiment':
        return {
          title: 'Sentiment mode',
          helper: 'Analyze message sentiment using the backend AI endpoint.',
          primaryLabel: 'Message',
          secondaryLabel: 'Module id (optional)',
        };
      case 'emotion':
        return {
          title: 'Emotion mode',
          helper: 'Analyze the dominant emotion for a message.',
          primaryLabel: 'Message',
          secondaryLabel: 'Module id (optional)',
        };
      case 'monitoring':
        return {
          title: 'Monitoring mode',
          helper: 'Inspect instructor-only AI monitoring metrics from the backend.',
          primaryLabel: 'Monitoring request',
          secondaryLabel: 'Not used',
        };
      default:
        return {
          title: 'Chat mode',
          helper: 'Chat with the AI endpoint and preserve the conversation history.',
          primaryLabel: 'Message',
          secondaryLabel: 'Context (optional)',
        };
    }
  }, [mode]);

  const toggleSidebar = () => setIsSidebarOpen((current) => !current);

  const resetConversation = () => {
    setConversation([]);
    setInputValue('');
    setSecondaryValue('');
    setResult(DEFAULT_RESULT);
    setRecommendationResult(null);
  };

  const handleCourseClick = async (course: EnrolledCourseLite) => {
    setSelectedCourseId(course.courseId);
    setSelectedEnrollmentId(course.enrollmentId);
    setSelectedModuleId(null);
    setCourseModules([]);
    setIsLoadingCourseContext(true);

    try {
      const modules = await CourseService.getCourseModulesByCourseId(course.courseId);
      setCourseModules(modules || []);
    } catch (error: any) {
      setCourseModules([]);
      setResult({
        status: 'error',
        title: 'Course context failed',
        message: error?.message || 'Could not load modules for this course.',
      });
    } finally {
      setIsLoadingCourseContext(false);
    }
  };

  const handleModuleClick = async (moduleId: number) => {
    setSelectedModuleId(moduleId);
    if (mode === 'summary' || mode === 'quiz') {
      await runRequest(moduleId);
    }
  };

  const analyzeEmotionWithRetry = async (message: string, moduleId: number | null) => {
    const now = Date.now();
    const cooldownRemaining = 350 - (now - emotionCooldownRef.current);
    if (cooldownRemaining > 0) {
      setEmotionRequestState('queued');
      await wait(cooldownRemaining);
    }

    emotionCooldownRef.current = Date.now();

    for (let attempt = 1; attempt <= 3; attempt++) {
      setEmotionRequestState(attempt === 1 ? 'sending' : 'retrying');
      try {
        const response = await Promise.race([
          AiService.analyzeEmotion({
            message,
            language: 'en',
            moduleId,
          }),
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Emotion analysis timed out.')), 10000);
          }),
        ]);

        setEmotionRequestState('idle');
        return response;
      } catch (error) {
        if (attempt === 3) {
          setEmotionRequestState('idle');
          throw error;
        }

        await wait(attempt * 400);
      }
    }

    setEmotionRequestState('idle');
    throw new Error('Emotion analysis failed after retries.');
  };

  const runRequest = async (forcedModuleId?: number) => {
    const trimmedInput = inputValue.trim();
    const trimmedSecondary = secondaryValue.trim();
    const targetModuleId = forcedModuleId ?? selectedModuleId;
    const usesStudentModuleContext = isStudent && (mode === 'summary' || mode === 'quiz');

    if (mode !== 'monitoring' && mode !== 'recommendations' && !usesStudentModuleContext && trimmedInput.length === 0) {
      setResult({ status: 'error', title: 'Input required', message: 'Enter text before calling the backend.' });
      return;
    }

    if (mode === 'recommendations') {
      if (!isStudent) {
        setResult({ status: 'error', title: 'Student access required', message: 'Recommendations are available for student accounts only.' });
        return;
      }

      if (!trimmedInput || !trimmedSecondary) {
        setResult({ status: 'error', title: 'Profile required', message: 'Please provide both ambitions and interests.' });
        return;
      }
    }

    if (usesStudentModuleContext && !targetModuleId) {
      setResult({
        status: 'error',
        title: 'Module selection required',
        message: 'Select an enrolled course and then a module to generate quiz or summary.',
      });
      return;
    }

    if (!isAuthenticated && mode !== 'monitoring') {
      setResult({ status: 'error', title: 'Sign in required', message: 'Log in before using AI features.' });
      return;
    }

    setIsSubmitting(true);
    setResult({ status: 'loading', title: 'Working', message: 'Calling backend AI service...' });

    try {
      if (mode === 'chat') {
        const nextConversation: ChatMessage[] = [...conversation, { role: 'user', content: trimmedInput }];
        const response = await AiService.chat({
          message: trimmedInput,
          history: conversation,
          context: trimmedSecondary || undefined,
          language: 'en',
          strictGrounded: Boolean(trimmedSecondary),
        });

        const updatedConversation: ChatMessage[] = [...nextConversation, { role: 'assistant', content: response.output }];
        setConversation(updatedConversation);
        setRecentThreads((current) => [trimmedInput.slice(0, 60), ...current.filter((item) => item !== trimmedInput.slice(0, 60))].slice(0, 12));
        setResult({
          status: 'success',
          title: response.isFallback ? 'Fallback response' : 'Chat response received',
          message: response.output,
          response,
        });
        setInputValue('');
        setSecondaryValue('');
        return;
      }

      if (mode === 'summary') {
        const response = usesStudentModuleContext
          ? await AiService.summarizeModule(targetModuleId!, {
            maxBullets: trimmedSecondary ? Number(trimmedSecondary) : 5,
            language: 'en',
            mode: 'Short',
          })
          : await AiService.summarize({
            text: trimmedInput,
            maxBullets: trimmedSecondary ? Number(trimmedSecondary) : 5,
            language: 'en',
            mode: 'Short',
          });

        setResult({
          status: 'success',
          title: response.isFallback ? 'Summary fallback' : 'Summary ready',
          message: response.output,
          response,
        });
        setRecentThreads((current) => [`Summary: ${usesStudentModuleContext ? `module ${targetModuleId}` : trimmedInput.slice(0, 40)}`, ...current].slice(0, 12));
        return;
      }

      if (mode === 'quiz') {
        const response = usesStudentModuleContext
          ? await AiService.generateModuleQuiz(targetModuleId!, {
            questionsCount: trimmedSecondary ? Number(trimmedSecondary) : 5,
            language: 'en',
            difficulty: 'Medium',
            includeExplanations: true,
          })
          : await AiService.generateQuiz({
            text: trimmedInput,
            questionsCount: trimmedSecondary ? Number(trimmedSecondary) : 5,
            language: 'en',
            difficulty: 'Medium',
            includeExplanations: true,
          });

        setResult({
          status: 'success',
          title: response.isFallback ? 'Quiz fallback' : 'Quiz ready',
          message: 'Quiz generated successfully. Use the interactive slideshow below to answer each question.',
          response,
        });
        setRecentThreads((current) => [`Quiz: ${usesStudentModuleContext ? `module ${targetModuleId}` : trimmedInput.slice(0, 40)}`, ...current].slice(0, 12));
        return;
      }

      if (mode === 'recommendations') {
        const response = await AiService.recommendCourses({
          ambitions: trimmedInput,
          interests: trimmedSecondary,
          maxRecommendations: 4,
          language: 'en',
        });

        setRecommendationResult(response);
        setResult({
          status: 'success',
          title: response.isFallback ? 'Recommendations (fallback)' : 'Recommendations ready',
          message: response.summary,
        });
        setRecentThreads((current) => [`Recommendations: ${trimmedInput.slice(0, 40)}`, ...current].slice(0, 12));
        return;
      }

      if (mode === 'sentiment') {
        const response = await AiService.analyzeSentiment({
          message: trimmedInput,
          language: 'en',
          moduleId: trimmedSecondary ? Number(trimmedSecondary) : null,
        });

        setResult({
          status: 'success',
          title: 'Sentiment analyzed',
          message: `${response.sentiment} (${Math.round(response.confidence * 100)}%)\n${response.rationale}`,
          payload: response,
        });
        setRecentThreads((current) => [`Sentiment: ${trimmedInput.slice(0, 40)}`, ...current].slice(0, 12));
        return;
      }

      if (mode === 'emotion') {
        const response = await analyzeEmotionWithRetry(trimmedInput, trimmedSecondary ? Number(trimmedSecondary) : null);

        setResult({
          status: 'success',
          title: 'Emotion analyzed',
          message: `${response.emotion} (${Math.round(response.confidence * 100)}%)\n${response.rationale}`,
          payload: response,
        });
        setRecentThreads((current) => [`Emotion: ${trimmedInput.slice(0, 40)}`, ...current].slice(0, 12));
        return;
      }

      if (mode === 'monitoring') {
        if (!canUseMonitoring) {
          setResult({ status: 'error', title: 'Instructor access required', message: 'Only instructors can view AI monitoring metrics.' });
          return;
        }

        const response = await AiService.getMonitoringSnapshot();
        setResult({
          status: 'success',
          title: 'Monitoring snapshot',
          message: 'Backend monitoring metrics loaded successfully.',
          payload: response,
        });
        setRecentThreads((current) => ['Monitoring snapshot', ...current].slice(0, 12));
      }
    } catch (error: any) {
      setResult({
        status: 'error',
        title: 'Request failed',
        message: error?.message || 'The backend request failed.',
      });
    } finally {
      setIsSubmitting(false);
      if (mode === 'emotion') {
        setEmotionRequestState('idle');
      }
    }
  };

  return (
    <div className="relative mb-100 flex h-[calc(100vh-76px)] overflow-hidden bg-gradient-to-br from-[#f8f9fa] via-[#f4f7fb] to-[#eef2ff] text-gray-800">
      <div className={`flex flex-1 flex-col transition-all duration-300 ${isSidebarOpen ? 'mr-80' : ''}`}>
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute right-6 top-6 z-10 shrink-0 rounded-xl bg-gray-200/50 p-3 transition-colors hover:bg-gray-200"
          >
            <MessageSquare size={20} className="text-gray-600" />
          </button>
        )}

        {!isSidebarOpen && (
          <div className="absolute right-0 top-1/2 z-10 flex -translate-y-1/2 cursor-pointer flex-col items-center justify-center gap-2 rounded-l-xl bg-blue-500 px-2 py-6 text-white shadow-lg transition-colors hover:bg-blue-600">
            <span className="writing-vertical text-sm font-medium tracking-wider" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              AI Workspace
            </span>
            <Sparkles size={16} />
          </div>
        )}

        <div className="flex flex-1 flex-col items-center overflow-y-auto px-4 pb-32 pt-10 md:px-10">
          <div className="mb-4 rounded-full border border-gray-100 bg-white px-6 py-2 text-sm font-bold tracking-widest shadow-sm">
            CHAT A.I+
          </div>

          <h1 className="mb-3 text-center text-3xl font-bold text-gray-900 md:text-4xl">
            {modeMeta.title}
          </h1>

          <p className="mb-8 max-w-3xl text-center text-sm text-gray-600 md:text-base">
            {modeMeta.helper}
          </p>

          <div className="mb-6 grid w-full max-w-4xl grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-7">
            {(['chat', 'summary', 'quiz', 'recommendations', 'sentiment', 'emotion', 'monitoring'] as Mode[]).map((item) => (
              <button
                key={item}
                onClick={() => setMode(item)}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold capitalize transition-all ${mode === item
                  ? 'border-blue-500 bg-blue-500 text-white shadow-md'
                  : 'border-white/70 bg-white text-gray-700 shadow-sm hover:border-blue-200 hover:text-blue-600'
                  }`}
              >
                {item}
              </button>
            ))}
          </div>

          {isStudent && (mode === 'summary' || mode === 'quiz') && (
            <div className="mb-6 w-full max-w-4xl rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
              <h3 className="mb-3 text-sm font-semibold text-blue-900">Learning context</h3>
              <p className="mb-3 text-xs text-blue-800">
                Choose one of your enrolled courses, then click a module to automatically generate a {mode} from that module context.
              </p>

              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <div className="mb-2 text-xs font-semibold text-blue-900">Enrolled courses</div>
                  <div className="space-y-2">
                    {enrolledCourses.length === 0 && (
                      <div className="rounded-xl border border-blue-100 bg-white px-3 py-2 text-xs text-blue-700">
                        No enrolled courses found for your account.
                      </div>
                    )}
                    {enrolledCourses.map((course) => (
                      <button
                        key={course.enrollmentId}
                        onClick={() => handleCourseClick(course)}
                        className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors ${selectedCourseId === course.courseId
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-blue-100 bg-white text-blue-900 hover:bg-blue-100'
                          }`}
                      >
                        {course.courseTitle}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-xs font-semibold text-blue-900">Modules</div>
                  {isLoadingCourseContext ? (
                    <div className="rounded-xl border border-blue-100 bg-white px-3 py-2 text-xs text-blue-700">Loading course modules...</div>
                  ) : (
                    <div className="space-y-2">
                      {selectedCourseId && courseModules.length === 0 && (
                        <div className="rounded-xl border border-blue-100 bg-white px-3 py-2 text-xs text-blue-700">No modules available in this course.</div>
                      )}
                      {courseModules.map((module) => (
                        <button
                          key={`${module.id}`}
                          onClick={() => handleModuleClick(module.id || 0)}
                          disabled={!module.id || isSubmitting}
                          className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors ${selectedModuleId === module.id
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-blue-100 bg-white text-blue-900 hover:bg-blue-100'
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          {module.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!isAuthenticated && mode !== 'monitoring' && (
            <div className="mb-6 w-full max-w-4xl rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900 shadow-sm">
              Sign in to call the AI endpoints. The page will still show the UI, but requests are blocked until you have an access token.
            </div>
          )}

          {mode === 'monitoring' && !canUseMonitoring && (
            <div className="mb-6 w-full max-w-4xl rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-700 shadow-sm">
              Instructor access is required for monitoring. The backend endpoint is wired, but this account does not have permission.
            </div>
          )}

          {mode === 'emotion' && emotionRequestState !== 'idle' && (
            <div className="mb-6 w-full max-w-4xl rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-800 shadow-sm">
              {emotionRequestState === 'queued'
                ? 'Emotion request queued...'
                : emotionRequestState === 'sending'
                  ? 'Analyzing emotion...'
                  : 'Retrying emotion analysis...'}
            </div>
          )}

          <div className="mb-6 w-full max-w-4xl">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                {result.status === 'loading' ? <Loader2 className="animate-spin text-blue-500" size={16} /> : <CheckCircle2 className={result.status === 'error' ? 'text-red-500' : 'text-emerald-500'} size={16} />}
                {result.title}
              </div>
              {mode === 'summary' && result.status === 'success' ? (
                <SummaryResult message={result.message} />
              ) : (
                <p className="whitespace-pre-line text-sm text-gray-600">{result.message}</p>
              )}
              {mode === 'recommendations' && recommendationResult && (
                <div className="mt-4 rounded-xl bg-gray-50 p-4 text-xs text-gray-600">
                  <div className="flex flex-wrap gap-3">
                    <span>Provider: {recommendationResult.provider || 'n/a'}</span>
                    <span>Model: {recommendationResult.model || 'n/a'}</span>
                    <span>Status: {recommendationResult.status || 'n/a'}</span>
                    <span>Fallback: {recommendationResult.isFallback ? 'yes' : 'no'}</span>
                  </div>
                </div>
              )}
              {result.response && (
                <div className="mt-4 rounded-xl bg-gray-50 p-4 text-xs text-gray-600">
                  <div className="flex flex-wrap gap-3">
                    <span>Provider: {result.response.provider || 'n/a'}</span>
                    <span>Model: {result.response.model || 'n/a'}</span>
                    <span>Status: {result.response.status || 'n/a'}</span>
                    <span>Fallback: {result.response.isFallback ? 'yes' : 'no'}</span>
                  </div>
                  {result.response.sentiment && <div className="mt-2">Sentiment: {result.response.sentiment}</div>}
                  {result.response.emotion && <div>Emotion: {result.response.emotion}</div>}
                </div>
              )}
              {mode !== 'quiz' && result.payload !== undefined && !result.response && (
                <pre className="mt-4 max-h-44 overflow-auto rounded-xl bg-gray-50 p-4 text-xs text-gray-600">{JSON.stringify(result.payload, null, 2)}</pre>
              )}
            </div>
          </div>

          {mode === 'recommendations' && recommendationResult?.courses?.length ? (
            <div className="mb-6 w-full max-w-4xl">
              <div className="mb-3 text-sm font-semibold text-slate-800">Recommended courses for you</div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {recommendationResult.courses.map((course) => (
                  <button
                    key={course.courseId}
                    onClick={() => navigate(`/course/${course.courseId}`)}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                  >
                    <div className="h-36 w-full bg-slate-100">
                      {course.imageUrl ? (
                        <img src={resolveMediaUrl(course.imageUrl)} alt={course.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-400">No image</div>
                      )}
                    </div>
                    <div className="space-y-2 p-4">
                      <div>
                        <h4 className="line-clamp-2 text-base font-semibold text-slate-900">{course.title}</h4>
                        <p className="mt-1 text-xs text-slate-600">Instructor: {course.instructorName || 'Unknown instructor'}</p>
                      </div>
                      <p className="line-clamp-3 text-sm leading-5 text-slate-700">{course.reason}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="rounded-full bg-blue-50 px-2 py-1 font-medium text-blue-700">
                          Match: {Math.round((course.matchScore || 0) * 100)}%
                        </span>
                        <span className="font-semibold text-slate-800">${course.price}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {mode === 'quiz' && result.response?.output && result.status === 'success' && (
            <div className="w-full max-w-4xl">
              <QuizSlideshow
                quizOutput={result.response.output}
                quizId={result.response.quizId ?? null}
                enrollmentId={selectedEnrollmentId}
                quizAssignmentId={null}
              />
            </div>
          )}

          <div className="w-full max-w-4xl rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-xl shadow-slate-200/60 backdrop-blur">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <div className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-600">{modeMeta.primaryLabel}</div>
              <div className="rounded-full bg-slate-50 px-3 py-1 font-medium text-slate-600">{modeMeta.secondaryLabel}</div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_220px]">
              <textarea
                rows={6}
                placeholder={isStudent && (mode === 'summary' || mode === 'quiz')
                  ? 'Select an enrolled course and module above. Generation will run automatically from module context.'
                  : mode === 'recommendations'
                    ? 'Describe your ambitions (e.g. become backend engineer, prepare for AI career, build strong portfolio)...'
                  : mode === 'summary' || mode === 'quiz'
                    ? 'Paste your course notes, lesson content, or article text here...'
                    : 'Type your message here...'}
                className="min-h-40 w-full rounded-3xl border border-gray-100 bg-gray-50 px-5 py-4 text-gray-700 outline-none transition-colors focus:border-blue-400 focus:bg-white"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                disabled={isStudent && (mode === 'summary' || mode === 'quiz')}
              />

              <div className="flex flex-col gap-3">
                <input
                  type={mode === 'summary' || mode === 'quiz' ? 'number' : 'text'}
                  min={3}
                  max={15}
                  placeholder={mode === 'chat' ? 'Context (optional)' : mode === 'monitoring' ? 'Not used' : mode === 'recommendations' ? 'Your interests (e.g. web dev, cloud, data structures, leadership)' : mode === 'sentiment' || mode === 'emotion' ? 'Module id (optional)' : '5'}
                  className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition-colors focus:border-blue-400 focus:bg-white"
                  value={secondaryValue}
                  onChange={(event) => setSecondaryValue(event.target.value)}
                  disabled={mode === 'monitoring'}
                />

                <button
                  onClick={() => runRequest()}
                  disabled={
                    isSubmitting ||
                    (mode === 'monitoring' && !canUseMonitoring) ||
                    (isStudent && (mode === 'summary' || mode === 'quiz') && !selectedModuleId)
                  }
                  className="flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-4 py-3 font-medium text-white shadow-md transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />}
                  {mode === 'summary' ? 'Generate summary' : mode === 'quiz' ? 'Generate quiz' : mode === 'recommendations' ? 'Get recommendations' : mode === 'sentiment' ? 'Analyze sentiment' : mode === 'emotion' ? 'Analyze emotion' : mode === 'monitoring' ? 'Load monitoring' : 'Send message'}
                </button>

                <button
                  onClick={resetConversation}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </div>

            {conversation.length > 0 && mode === 'chat' && (
              <div className="mt-6 space-y-3 rounded-3xl bg-gray-50 p-4">
                {conversation.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 shadow-sm ring-1 ring-gray-100'}`}>
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 grid max-w-4xl gap-4 md:grid-cols-3">
            <ActionCard icon={<BrainCircuit className="rounded-full bg-purple-100 p-1.5 text-purple-500" size={32} />} title="Chat" desc="Send a prompt and preserve the backend conversation history." />
            <ActionCard icon={<Lightbulb className="rounded-full bg-orange-100 p-1.5 text-orange-500" size={32} />} title="Summary and quiz" desc="Turn course text into summaries or study questions." />
            <ActionCard icon={<Zap className="rounded-full bg-sky-100 p-1.5 text-sky-500" size={32} />} title="Sentiment and monitoring" desc="Show sentiment, emotion, and instructor AI health data." />
          </div>
        </div>

        {mode === 'chat' && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center px-4 transition-all duration-300" style={{ right: isSidebarOpen ? '320px' : '0' }}>
            <div className="w-full max-w-3xl rounded-full border border-gray-100 bg-white p-2 pl-4 shadow-lg">
              <Bot className="mr-2 text-pink-500" size={24} />
              <input
                type="text"
                placeholder="What's in your mind?..."
                className="flex-1 border-none bg-transparent py-3 text-gray-700 outline-none"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
              />
              <button onClick={() => runRequest()} className="ml-2 flex items-center justify-center rounded-full bg-blue-500 p-3 text-white transition-colors hover:bg-blue-600">
                <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className="fixed right-0 top-0 z-40 flex h-full w-80 flex-col border-l border-gray-100 bg-white shadow-2xl transition-transform duration-300 ease-in-out"
        style={{ transform: isSidebarOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <div className="flex items-center justify-between border-b border-gray-50 p-6 pb-4">
          <span className="text-sm font-bold tracking-widest">AI HISTORY</span>
          <button onClick={toggleSidebar} className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-3 p-4">
          <button onClick={resetConversation} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-500 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-600">
            <Plus size={16} />
            New chat
          </button>
          <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white shadow-sm transition-colors hover:bg-gray-800">
            <SearchIcon size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between px-5 py-2 text-xs font-medium text-gray-500">
          <span>Your conversations</span>
          <button onClick={() => setRecentThreads([])} className="text-blue-500 hover:underline">Clear All</button>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {recentThreads.length === 0 && <div className="px-4 py-3 text-sm text-gray-500">No recent AI actions yet.</div>}
          {recentThreads.map((title, index) => (
            <HistoryItem key={`${title}-${index}`} title={title} isActive={index === 0} />
          ))}
        </div>

        <div className="space-y-3 border-t border-gray-50 p-4">
          <button className="flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100">
            <div className="rounded-lg bg-gray-200 p-1.5"><Zap size={16} className="text-gray-600" /></div>
            Settings
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100">
            <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User profile" className="h-7 w-7 rounded-full object-cover" />
            {user?.firstName || 'Guest user'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ActionCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => {
  return (
    <div className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 pl-5 pr-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-gray-900 transition-colors group-hover:text-blue-600">{title}</h4>
        <p className="mt-1 text-xs leading-snug text-gray-500">{desc}</p>
      </div>
      <ArrowRight size={18} className="text-gray-300 transition-colors group-hover:text-blue-500" />
    </div>
  );
};

const HistoryItem = ({ title, isActive }: { title: string; isActive: boolean }) => {
  return (
    <div className={`group flex cursor-pointer items-center justify-between rounded-xl px-3 py-3 transition-colors ${isActive ? 'bg-blue-50/80 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
      <div className="flex items-center gap-3 overflow-hidden">
        <MessageSquare size={16} className={isActive ? 'text-blue-500' : 'text-gray-400 transition-colors group-hover:text-gray-600'} />
        <span className="truncate text-sm font-medium">{title}</span>
      </div>
      {isActive && (
        <div className="flex items-center gap-2 text-gray-400">
          <button className="hover:text-blue-600"><Trash2 size={14} /></button>
          <button className="hover:text-blue-600"><Edit2 size={14} /></button>
        </div>
      )}
    </div>
  );
};

export default ChatAIPage;
