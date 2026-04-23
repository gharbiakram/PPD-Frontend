import apiClient from "./apiClient";
import type { CourseLevel, CourseType, FilterCoursesDTO } from "@/types/CourseType";
export type { CourseLevel } from "@/types/CourseType";

export interface CreateCourseInput {
  title: string;
  description: string;
  price: number;
  subjectId: number | null;
  languageId: number;
  level: CourseLevel;
  imageFile: File | null;
  instructorId: number;
  imageUrl:string;
}


export const CourseService = {
  async getNewCourses(limit = 4): Promise<CourseType[]> {
    try {
      const response = await apiClient.get('/courses/new', { params: { limit } });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      throw new Error(`Failed to fetch new courses: ${message}`);
    }
  },

  async getPopularCourses(limit = 4): Promise<CourseType[]> {
    try {
      const response = await apiClient.get('/courses/popular', { params: { limit } });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      throw new Error(`Failed to fetch popular courses: ${message}`);
    }
  },

  async getDiscoverCourses(limit = 4): Promise<CourseType[]> {
    try {
      const response = await apiClient.get('/courses/discover', { params: { limit } });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      throw new Error(`Failed to fetch discover courses: ${message}`);
    }
  },

  async searchCourses(filters: FilterCoursesDTO = {}): Promise<CourseType[]> {
    try {
      const response = await apiClient.get('/courses/search', { params: filters });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      throw new Error(`Failed to search courses: ${message}`);
    }
  },

  
  async getCourseModulesByCourseId(courseId: number): Promise<any> {
    try {
      const response = await apiClient.get(`/courses/modules?courseId=${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course modules:', error);
      throw error;
    }
},
 
 async createCourse(courseData:CreateCourseInput){
    const data = new FormData();
    data.append("title", courseData.title);
    data.append("description", courseData.description);
    data.append("price", courseData.price.toString());
    if (courseData.subjectId !== null) {
      data.append("subjectId", courseData.subjectId.toString());
    }
    data.append("languageId", courseData.languageId.toString());
    data.append("level", courseData.level);
    if (courseData.imageFile) {
      data.append("image", courseData.imageFile);
    }
    if(courseData.instructorId){
      data.append("instructorID",courseData.instructorId.toString());
    }

     try {
    const response =  await apiClient.post("/courses", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    throw new Error(`Course creation failed: ${message}`);
  }
},

async getCourseById(courseId: number | null): Promise<any> {
  try {
    const response = await apiClient.get(`/courses/${courseId}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    throw new Error(`Failed to fetch course: ${message}`);
  }
},

async updateCourse(courseId: number | null, courseData: CreateCourseInput): Promise<void> {
  const data = new FormData();
  data.append("title", courseData.title);
  data.append("description", courseData.description);
  data.append("price", courseData.price.toString());
  if (courseData.subjectId) {
    data.append("subjectId", courseData.subjectId.toString());
  }

  data.append("languageId", courseData.languageId.toString());
  data.append("level", courseData.level);
  if (courseData.imageFile) {
    data.append("image", courseData.imageFile);
  }

  try {
    const response = await apiClient.put(`/courses/${courseId}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("Course updated successfully", response.data);
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    throw new Error(`Course update failed: ${message}`);
  }
},

async getInstructorCourses(): Promise<CourseType[]> {
  try {
    const response = await apiClient.get('/courses/instructorCourses');
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    throw new Error(`Failed to fetch instructor courses: ${message}`);
  }
},

async getEnrollmentsCountByCourseId(courseId: number): Promise<number> {
  try {
    const response = await apiClient.get('/courses/enrollmentsCount', {
      params: { courseId },
    });
    return response.data; // This should be the integer count
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    throw new Error(`Failed to fetch enrollments count: ${message}`);
  }
}


}