import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/contexts/userContext';
import type { CourseType } from '@/types/CourseType';
import { CourseService } from '@/api/courseService';
import { QuizProgressService } from '@/api/quizProgressService';
import type { InstructorCourseQuizProgress } from '@/types/QuizProgressTypes';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { UserTypeEnum } from '@/types/UserType';

type AttemptResponseItem = {
  question?: string;
  selectedAnswers?: string[];
  correctAnswers?: string[];
  isCorrect?: boolean;
};

function parseLatestResponses(payload?: string): AttemptResponseItem[] | null {
  if (!payload) {
    return null;
  }

  try {
    const parsed = JSON.parse(payload);
    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed
      .filter((item) => item && typeof item === 'object')
      .map((item) => ({
        question: typeof item.question === 'string' ? item.question : 'Untitled question',
        selectedAnswers: Array.isArray(item.selectedAnswers) ? item.selectedAnswers.map(String) : [],
        correctAnswers: Array.isArray(item.correctAnswers) ? item.correctAnswers.map(String) : [],
        isCorrect: Boolean(item.isCorrect),
      }));
  } catch {
    return null;
  }
}

function LatestResponsesCell({ payload }: { payload?: string }) {
  if (!payload) {
    return <span className="text-slate-400">-</span>;
  }

  const parsedResponses = parseLatestResponses(payload);

  if (!parsedResponses || parsedResponses.length === 0) {
    return (
      <div className="max-w-80 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] leading-5 text-slate-600">
        {payload.length > 180 ? `${payload.slice(0, 180)}...` : payload}
      </div>
    );
  }

  const correctCount = parsedResponses.filter((item) => item.isCorrect).length;

  return (
    <div className="w-full max-w-[24rem] space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-slate-700">Attempt Review</span>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 font-medium text-slate-700">
          {correctCount}/{parsedResponses.length} correct
        </span>
      </div>

      <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
        {parsedResponses.map((item, index) => (
          <div key={`${item.question ?? 'question'}-${index}`} className="rounded-md border border-slate-200 bg-white p-2">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="line-clamp-2 text-[11px] font-semibold leading-4 text-slate-800">
                Q{index + 1}. {item.question}
              </p>
              <span
                className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${item.isCorrect
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700'
                  }`}
              >
                {item.isCorrect ? 'Correct' : 'Incorrect'}
              </span>
            </div>

            <p className="text-[10px] leading-4 text-slate-600">
              <span className="font-semibold text-slate-700">Selected:</span>{' '}
              {item.selectedAnswers && item.selectedAnswers.length > 0 ? item.selectedAnswers.join(', ') : 'No answer'}
            </p>
            <p className="text-[10px] leading-4 text-slate-600">
              <span className="font-semibold text-slate-700">Correct:</span>{' '}
              {item.correctAnswers && item.correctAnswers.length > 0 ? item.correctAnswers.join(', ') : 'N/A'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}


function InstructorCoursesPage() {
  const user = useContext(UserContext);
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressLoadingCourseId, setProgressLoadingCourseId] = useState<number | null>(null);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedProgress, setSelectedProgress] = useState<InstructorCourseQuizProgress | null>(null);
  const [assignmentLoadingKey, setAssignmentLoadingKey] = useState<string | null>(null);
  const [assignmentMessage, setAssignmentMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, [user.user]);

  if (!user.user) {
    return <div className="container text-red-500">Unauthenticated. You must be logged in to view this page.</div>;
  }
  if (user.user.userType === UserTypeEnum.Student) {
    return <div className="container text-red-500">Unauthorized. You must be an instructor to view this page.</div>;
  }

  async function fetchCourses() {
    try {
      setIsLoading(true);
      setError(null);
      if (user && user.user && user.user.userType === UserTypeEnum.Instructor) {
        const data = await CourseService.getInstructorCourses();
        setCourses(data);
      }
    } catch (error: any) {
      setError(error?.message || 'Failed to load your courses.');
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleUpdateCourse = (courseId: number) => {
    navigate(`/courses/${courseId}/edit`);
  };

  const handleAddCourse = () => {
    navigate('/courses/new');
  };

  const loadProgress = async (courseId: number): Promise<boolean> => {
    try {
      setProgressError(null);
      setProgressLoadingCourseId(courseId);
      const data = await QuizProgressService.getCourseProgress(courseId);
      setSelectedCourseId(courseId);
      setSelectedProgress(data);
      return true;
    } catch (error: any) {
      setProgressError(error?.message || 'Failed to load quiz progress for this course.');
      setSelectedProgress(null);
      setSelectedCourseId(courseId);
      return false;
    } finally {
      setProgressLoadingCourseId(null);
    }
  };

  const assignQuizToStudent = async (quizId: number, enrollmentId: number) => {
    const assignmentKey = `${quizId}-${enrollmentId}`;
    try {
      setAssignmentMessage(null);
      setAssignmentLoadingKey(assignmentKey);
      await QuizProgressService.assignQuiz({ quizId, enrollmentIds: [enrollmentId] });

      if (!selectedCourseId) {
        setAssignmentMessage('Quiz assigned successfully.');
        return;
      }

      const refreshed = await loadProgress(selectedCourseId);
      setAssignmentMessage(
        refreshed
          ? 'Quiz assigned successfully.'
          : 'Quiz assigned, but progress refresh failed. Click View Quiz Progress to retry.'
      );
    } catch (error: any) {
      setAssignmentMessage(error?.message || 'Failed to assign quiz to this student.');
    } finally {
      setAssignmentLoadingKey(null);
    }
  };

  return (
    <div className="container">
      <div className="mb-2 flex justify-between">
        <h2 className="mb-4 text-2xl font-bold">My Courses</h2>
        <button
          onClick={handleAddCourse}
          className="cursor-pointer flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-1 text-white shadow transition-all duration-200 hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Course
        </button>
      </div>

      {isLoading && <div>Loading courses...</div>}
      {error && <div className="mb-2 text-red-500">{error}</div>}

      {courses.length === 0 ? (
        <div>No courses found.</div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <li key={course.id} className="rounded border p-4 shadow">
              <button className="mb-3 block w-full text-left" onClick={() => handleUpdateCourse(course.id)}>
                <h3 className="text-lg font-semibold">{course.title}</h3>
                <p className="text-sm text-gray-600">Price: ${course.price}</p>
              </button>

              <button
                className="w-full rounded-md border border-emerald-600 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                onClick={() => loadProgress(course.id)}
                disabled={progressLoadingCourseId === course.id}
              >
                {progressLoadingCourseId === course.id ? 'Loading progress...' : 'View Quiz Progress'}
              </button>
            </li>
          ))}
        </ul>
      )}

      {progressError && <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{progressError}</div>}
      {assignmentMessage && <div className="mt-4 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">{assignmentMessage}</div>}

      {selectedCourseId && selectedProgress && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-xl font-semibold text-slate-900">
            Quiz Progress: {selectedProgress.courseTitle}
          </h3>

          {selectedProgress.students.length === 0 ? (
            <div className="text-sm text-slate-600">No enrolled students found in this course yet.</div>
          ) : (
            <div className="space-y-5">
              {selectedProgress.students.map((student) => (
                <div key={student.enrollmentId} className="rounded-xl border border-slate-100 p-3">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{student.studentName}</p>
                      <p className="text-xs text-slate-600">{student.studentEmail}</p>
                    </div>
                    <div className="text-xs text-slate-600">
                      Completed content items: {student.completedContentItems} | Course completed: {student.isCourseCompleted ? 'Yes' : 'No'}
                    </div>
                  </div>

                  {student.quizzes.length === 0 ? (
                    <div className="text-xs text-slate-500">No generated or assigned quizzes for this student yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-600">
                            <th className="px-2 py-2">Module</th>
                            <th className="px-2 py-2">Source</th>
                            <th className="px-2 py-2">Assigned</th>
                            <th className="px-2 py-2">Attempts</th>
                            <th className="px-2 py-2">Latest score</th>
                            <th className="px-2 py-2">Completed</th>
                            <th className="px-2 py-2">Latest responses</th>
                            <th className="px-2 py-2">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {student.quizzes.map((quiz) => (
                            <tr key={`${student.enrollmentId}-${quiz.quizId}`} className="border-b border-slate-100">
                              <td className="px-2 py-2">{quiz.moduleName}</td>
                              <td className="px-2 py-2">{quiz.generationSource}</td>
                              <td className="px-2 py-2">{quiz.isAssigned ? 'Yes' : 'No'}</td>
                              <td className="px-2 py-2">{quiz.attemptsCount}</td>
                              <td className="px-2 py-2">{quiz.latestScore ?? '-'}</td>
                              <td className="px-2 py-2">{quiz.latestCompleted ? 'Yes' : 'No'}</td>
                              <td className="px-2 py-2 align-top text-[11px] text-slate-600">
                                <LatestResponsesCell payload={quiz.latestStudentResponses} />
                              </td>
                              <td className="px-2 py-2">
                                <button
                                  className="rounded-md border border-blue-600 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  onClick={() => assignQuizToStudent(quiz.quizId, student.enrollmentId)}
                                  disabled={quiz.isAssigned || assignmentLoadingKey === `${quiz.quizId}-${student.enrollmentId}`}
                                >
                                  {quiz.isAssigned
                                    ? 'Assigned'
                                    : assignmentLoadingKey === `${quiz.quizId}-${student.enrollmentId}`
                                      ? 'Assigning...'
                                      : 'Assign'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default InstructorCoursesPage;
