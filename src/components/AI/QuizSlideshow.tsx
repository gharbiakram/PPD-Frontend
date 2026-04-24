import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';
import type { AiQuizPayload, AiQuizQuestion } from '@/types/AiTypes';
import { QuizProgressService } from '@/api/quizProgressService';

type NormalizedQuizOption = {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
};

type NormalizedQuizQuestion = {
  question: string;
  options: NormalizedQuizOption[];
  explanation?: string;
  allowMultiple: boolean;
};

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const stripJsonFence = (value: string) => {
  return value
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
};

const tryParseJson = (value: string): unknown | null => {
  const cleaned = stripJsonFence(value);

  try {
    return JSON.parse(cleaned);
  } catch {
    const arrayStart = cleaned.indexOf('[');
    const arrayEnd = cleaned.lastIndexOf(']');
    if (arrayStart >= 0 && arrayEnd > arrayStart) {
      try {
        return JSON.parse(cleaned.slice(arrayStart, arrayEnd + 1));
      } catch {
        return null;
      }
    }

    const objectStart = cleaned.indexOf('{');
    const objectEnd = cleaned.lastIndexOf('}');
    if (objectStart >= 0 && objectEnd > objectStart) {
      try {
        return JSON.parse(cleaned.slice(objectStart, objectEnd + 1));
      } catch {
        return null;
      }
    }

    return null;
  }
};

const toComparableText = (value: string) => value
  .toLowerCase()
  .trim()
  .replace(/^[a-h]\s*[.)\-:]\s*/i, '')
  .replace(/^option\s+/i, '')
  .replace(/\s+/g, ' ');

const getOptionText = (option: string | Record<string, unknown>, fallbackIndex: number) => {
  if (typeof option === 'string') {
    return option.trim();
  }

  const candidate = option.text ?? option.label ?? option.value ?? option.option;
  if (typeof candidate === 'string' && candidate.trim().length > 0) {
    return candidate.trim();
  }

  return `Option ${fallbackIndex + 1}`;
};

const getAnswerLabels = (correctAnswer: unknown, options: NormalizedQuizOption[]) => {
  const values = Array.isArray(correctAnswer) ? correctAnswer : correctAnswer == null ? [] : [correctAnswer];
  const normalizedValues = values
    .map((item) => (typeof item === 'string' ? toComparableText(item) : String(item).toLowerCase().trim()))
    .filter((item) => item.length > 0);

  return options
    .filter((option) => {
      const normalizedOptionText = toComparableText(option.text);
      return normalizedValues.some((answer) => {
        if (answer === normalizedOptionText) {
          return true;
        }

        if (answer === option.label.toLowerCase()) {
          return true;
        }

        if (answer === `option ${option.label.toLowerCase()}`) {
          return true;
        }

        if (answer === `${option.label.toLowerCase()}.`) {
          return true;
        }

        return false;
      });
    })
    .map((option) => option.label);
};

const normalizeQuestion = (question: AiQuizQuestion, questionIndex: number): NormalizedQuizQuestion | null => {
  const questionText = typeof question?.question === 'string' ? question.question.trim() : '';
  const rawOptions = Array.isArray(question?.options) ? question.options : [];

  if (!questionText || rawOptions.length === 0) {
    return null;
  }

  const options = rawOptions.slice(0, OPTION_LABELS.length).map((option, optionIndex) => {
    const text = getOptionText(option as string | Record<string, unknown>, optionIndex);
    return {
      id: `${questionIndex}-${optionIndex}`,
      label: OPTION_LABELS[optionIndex] ?? String(optionIndex + 1),
      text,
      isCorrect: false,
    };
  });

  const correctLabels = getAnswerLabels(question.correctAnswer, options);
  const allowMultiple = Boolean(question.allowMultiple) || correctLabels.length > 1;

  return {
    question: questionText,
    options: options.map((option) => ({
      ...option,
      isCorrect: correctLabels.includes(option.label),
    })),
    explanation: typeof question.explanation === 'string' ? question.explanation.trim() : undefined,
    allowMultiple,
  };
};

const parseQuizPayload = (rawOutput: string): NormalizedQuizQuestion[] | null => {
  const parsed = tryParseJson(rawOutput);
  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  const payload = parsed as AiQuizPayload & { quiz?: AiQuizQuestion[]; items?: AiQuizQuestion[] };
  const sourceQuestions = Array.isArray(payload.questions)
    ? payload.questions
    : Array.isArray(payload.quiz)
      ? payload.quiz
      : Array.isArray(payload.items)
        ? payload.items
        : Array.isArray(parsed)
          ? (parsed as AiQuizQuestion[])
          : null;

  if (!sourceQuestions) {
    return null;
  }

  const normalizedQuestions = sourceQuestions
    .map((question, index) => normalizeQuestion(question, index))
    .filter((question): question is NormalizedQuizQuestion => Boolean(question));

  return normalizedQuestions.length > 0 ? normalizedQuestions : null;
};

interface QuizSlideshowProps {
  quizOutput: string;
  quizId?: number | null;
  enrollmentId?: number | null;
  quizAssignmentId?: number | null;
}

const QuizSlideshow = ({ quizOutput, quizId = null, enrollmentId = null, quizAssignmentId = null }: QuizSlideshowProps) => {
  const questions = useMemo(() => parseQuizPayload(quizOutput), [quizOutput]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string[]>>({});
  const [revealedQuestions, setRevealedQuestions] = useState<Record<number, boolean>>({});
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [isSubmittingAttempt, setIsSubmittingAttempt] = useState(false);
  const startedAtRef = useRef(Date.now());
  const resolvedQuizId = quizId ?? 0;
  const resolvedEnrollmentId = enrollmentId ?? 0;
  const resolvedQuizAssignmentId = quizAssignmentId ?? 0;

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setRevealedQuestions({});
    setSubmitMessage(null);
    startedAtRef.current = Date.now();
  }, [quizOutput]);

  if (!questions) {
    return (
      <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles size={16} />
          Quiz preview unavailable
        </div>
        <p className="mt-2 text-sm text-amber-800">
          The quiz response could not be parsed into interactive questions, so the raw JSON is hidden.
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return null;
  }

  const currentSelection = selectedAnswers[currentQuestionIndex] ?? [];
  const currentSelectionSet = new Set(currentSelection);
  const revealed = Boolean(revealedQuestions[currentQuestionIndex]);
  const correctLabels = currentQuestion.options.filter((option) => option.isCorrect).map((option) => option.label);
  const hasCorrectAnswer = correctLabels.length > 0;
  const isSelectionCorrect = hasCorrectAnswer
    && currentSelection.length > 0
    && currentSelection.length === correctLabels.length
    && currentSelection.every((label) => correctLabels.includes(label));

  const updateSelection = (label: string) => {
    setSelectedAnswers((current) => {
      const nextSelection = currentQuestion.allowMultiple
        ? Array.from(new Set([...(current[currentQuestionIndex] ?? []), label])).sort()
        : [label];

      return {
        ...current,
        [currentQuestionIndex]: nextSelection,
      };
    });

    if (!currentQuestion.allowMultiple) {
      setRevealedQuestions((current) => ({ ...current, [currentQuestionIndex]: true }));
    }
  };

  const toggleMultipleSelection = (label: string) => {
    setSelectedAnswers((current) => {
      const existing = current[currentQuestionIndex] ?? [];
      const nextSelection = existing.includes(label)
        ? existing.filter((item) => item !== label)
        : [...existing, label].sort();

      return {
        ...current,
        [currentQuestionIndex]: nextSelection,
      };
    });
  };

  const revealAnswer = () => {
    setRevealedQuestions((current) => ({ ...current, [currentQuestionIndex]: true }));
  };

  const goToQuestion = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= questions.length) {
      return;
    }

    setCurrentQuestionIndex(nextIndex);
  };

  const submitAttempt = async () => {
    if (!quizId || !enrollmentId) {
      setSubmitMessage('Quiz submission is unavailable for this quiz context.');
      return;
    }

    try {
      setIsSubmittingAttempt(true);
      setSubmitMessage(null);

      const responsePayload = questions.map((question, questionIndex) => {
        const selected = selectedAnswers[questionIndex] ?? [];
        const correct = question.options.filter((option) => option.isCorrect).map((option) => option.label);
        const matched = selected.length > 0
          && selected.length === correct.length
          && selected.every((label) => correct.includes(label));

        return {
          question: question.question,
          selectedAnswers: selected,
          correctAnswers: correct,
          isCorrect: matched,
        };
      });

      const correctAnswers = responsePayload.filter((item) => item.isCorrect).length;
      const totalQuestions = questions.length;
      const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

      await QuizProgressService.submitAttempt({
        quizId: resolvedQuizId,
        enrollmentId: resolvedEnrollmentId,
        quizAssignmentId: resolvedQuizAssignmentId > 0 ? resolvedQuizAssignmentId : null,
        studentResponses: JSON.stringify(responsePayload),
        score,
        correctAnswers,
        totalQuestions,
        isCompleted: true,
        durationSeconds: Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)),
      });

      setSubmitMessage('Your answers were saved successfully.');
    } catch (error: any) {
      setSubmitMessage(error?.message || 'Failed to save this quiz attempt.');
    } finally {
      setIsSubmittingAttempt(false);
    }
  };

  return (
    <div className="mt-4 overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-lg shadow-slate-200/50">
      <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 px-5 py-4 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">Quiz slideshow</div>
            <h3 className="mt-1 text-lg font-semibold">Interactive multiple-choice review</h3>
          </div>
          <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>

        <div className="mt-4 h-2 rounded-full bg-white/20">
          <div
            className="h-2 rounded-full bg-white transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            {currentQuestion.allowMultiple ? 'Multi-select question' : 'Single-choice question'}
          </span>
          <span>{hasCorrectAnswer ? 'Answer key detected' : 'Answer key unavailable'}</span>
        </div>

        <div className="min-h-[220px] rounded-[1.75rem] border border-slate-100 bg-slate-50 p-5 md:p-6">
          <div key={currentQuestionIndex} className="animate-[fadeIn_220ms_ease-out]">
            <p className="text-lg font-semibold leading-8 text-slate-900">
              {currentQuestion.question}
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {currentQuestion.options.map((option) => {
                const selected = currentSelectionSet.has(option.label);
                const isAnswer = revealed && option.isCorrect;
                const isWrongSelection = revealed && selected && !option.isCorrect;

                return (
                  <button
                    key={option.id}
                    onClick={() => (currentQuestion.allowMultiple ? toggleMultipleSelection(option.label) : updateSelection(option.label))}
                    className={`flex min-h-[84px] items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${selected
                      ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/60'
                      } ${isAnswer ? 'ring-2 ring-emerald-400' : ''} ${isWrongSelection ? 'ring-2 ring-rose-300' : ''}`}
                  >
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isAnswer
                      ? 'bg-emerald-500 text-white'
                      : selected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                      }`}>
                      {option.label}
                    </div>
                    <span className="text-sm leading-6">{option.text}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToQuestion(currentQuestionIndex - 1)}
                  disabled={currentQuestionIndex === 0}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => goToQuestion(currentQuestionIndex + 1)}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="inline-flex items-center gap-2 rounded-full border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>

              {currentQuestion.allowMultiple && (
                <button
                  type="button"
                  onClick={revealAnswer}
                  disabled={currentSelection.length === 0}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 size={16} />
                  Check answer
                </button>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={submitAttempt}
                  disabled={isSubmittingAttempt || resolvedQuizId <= 0 || resolvedEnrollmentId <= 0}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmittingAttempt ? 'Saving...' : 'Save attempt'}
              </button>

              {submitMessage && (
                <span className="text-sm text-slate-600">{submitMessage}</span>
              )}
            </div>

            {revealed && (
              <div className={`mt-5 rounded-2xl border px-4 py-4 text-sm ${isSelectionCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'}`}>
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 size={16} />
                  {isSelectionCorrect ? 'Correct answer selected' : 'Selection reviewed'}
                </div>
                <p className="mt-2 whitespace-pre-line leading-6">
                  {hasCorrectAnswer
                    ? `Correct choice${correctLabels.length > 1 ? 's' : ''}: ${correctLabels.join(', ')}`
                    : 'This quiz item does not include a detectable answer key.'}
                </p>
                {currentQuestion.explanation && (
                  <p className="mt-2 whitespace-pre-line leading-6 text-slate-700">
                    {currentQuestion.explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToQuestion(index)}
              className={`h-2.5 rounded-full transition-all ${index === currentQuestionIndex ? 'w-8 bg-blue-600' : 'w-2.5 bg-slate-300 hover:bg-slate-400'}`}
              aria-label={`Go to question ${index + 1}`}
            />
          ))}

          <button
            type="button"
            onClick={() => {
              setCurrentQuestionIndex(0);
              setSelectedAnswers({});
              setRevealedQuestions({});
            }}
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            <RotateCcw size={16} />
            Restart quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizSlideshow;