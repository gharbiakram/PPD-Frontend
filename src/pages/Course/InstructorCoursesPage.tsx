import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/contexts/userContext';
import type { CourseType } from '@/types/CourseType';
import { CourseService } from '@/api/courseService';
import { QuizProgressService } from '@/api/quizProgressService';
import type { InstructorCourseQuizProgress } from '@/types/QuizProgressTypes';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { UserTypeEnum } from '@/types/UserType';


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

  const loadProgress = async (courseId: number) => {
    try {
      setProgressError(null);
      setProgressLoadingCourseId(courseId);
      const data = await QuizProgressService.getCourseProgress(courseId);
      setSelectedCourseId(courseId);
      setSelectedProgress(data);
    } catch (error: any) {
      setProgressError(error?.message || 'Failed to load quiz progress for this course.');
      setSelectedProgress(null);
      setSelectedCourseId(courseId);
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
      setAssignmentMessage('Quiz assigned successfully.');
      if (selectedCourseId) {
        await loadProgress(selectedCourseId);
      }
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
                                {quiz.latestStudentResponses ? (
                                  <pre className="max-w-72 whitespace-pre-wrap rounded-md bg-slate-50 p-2 font-mono text-[10px] leading-4 text-slate-700">
                                    {quiz.latestStudentResponses}
                                  </pre>
                                ) : (
                                  '-'
                                )}
                              </td>
                              <td className="px-2 py-2">
                                <button
                                  className="rounded-md border border-blue-600 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  onClick={() => assignQuizToStudent(quiz.quizId, student.enrollmentId)}
                                  disabled={assignmentLoadingKey === `${quiz.quizId}-${student.enrollmentId}`}
                                >
                                  {assignmentLoadingKey === `${quiz.quizId}-${student.enrollmentId}` ? 'Assigning...' : 'Assign'}
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
