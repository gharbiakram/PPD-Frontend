import apiClient from "./apiClient";

export const EnrollmentService = {

  async enrollStudent(courseId: number) {
    try {
        const response = await apiClient.post(`enrollment`, {
            courseId: courseId
        });
        return response.data;
    } catch (error) {
        console.error("Error enrolling student:", error);
        throw error;
    }
  },

  async getEnrolledCoursesByStudentId(): Promise<any> {
    try {
        const response = await apiClient.get(`enrollment/studentEnrolledCourses`);
        return response.data;
    } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        throw error;

    }
  },

  async GetEnrolledCoursesByStudentId(): Promise<any> {
    return this.getEnrolledCoursesByStudentId();
  },

  async getEnrollmentByCourseIdAndStudentId(courseId: number): Promise<any> {
    try {
      const response = await apiClient.get(
        `enrollment/by-course-and-student`,
        {
          params: {
            courseId,
            // studentId,
          },
        }
      );

      return response.data; // this is the actual data returned by the API
    } catch (error) {
      console.error("Error fetching enrollment:", error);
      return null;
    }
  },

  async GetEnrollmentByCourseIdAndStudentId(courseId: number): Promise<any> {
    return this.getEnrollmentByCourseIdAndStudentId(courseId);
  },

  async createEnrollmentProgress(data: {
  enrollmentId: number;
  moduleContentId: number;
}): Promise<void> {
  try {
      await apiClient.post("/enrollmentProgress", data);

  } catch (error) {
    console.error("Error creating enrollment progress:", error);
    throw error;
  }
}


}