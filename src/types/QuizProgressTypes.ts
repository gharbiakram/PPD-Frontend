export interface StudentQuizProgressItem {
  quizId: number;
  moduleId: number;
  moduleName: string;
  generationSource: string;
  isAssigned: boolean;
  assignmentId?: number | null;
  dueAt?: string | null;
  attemptsCount: number;
  latestScore?: number | null;
  latestCompleted: boolean;
  latestCompletedAt?: string | null;
  latestStudentResponses?: string;
}

export interface StudentQuizProgress {
  studentId: number;
  studentName: string;
  studentEmail: string;
  enrollmentId: number;
  isCourseCompleted: boolean;
  completedContentItems: number;
  quizzes: StudentQuizProgressItem[];
}

export interface InstructorCourseQuizProgress {
  courseId: number;
  courseTitle: string;
  students: StudentQuizProgress[];
}
