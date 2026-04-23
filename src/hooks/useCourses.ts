import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { CourseType } from '../types/CourseType';
import apiClient from '@/api/apiClient';



export function useCourses(sectionType: string) {
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

const getEndpoint = (): string => {
  switch (sectionType) {
    case 'NewCourses':
      return '/courses/new';
    case 'PopularCourses':
      return '/courses/popular';
    case 'DiscoverCourses':
      return '/courses/discover';
    case 'SearchCourses':
      return '/courses/search';
    case 'InstructorCourses':
      return '/courses/instructorCourses';
    default:
      return '/courses/new';
  }
};

  useEffect(() => {
    const endpoint = getEndpoint();
    const params = new URLSearchParams();

    const searchTerm = searchParams.get('q');
    if (searchTerm) params.append('searchTerm', searchTerm);

    searchParams.getAll('subjectIDs').forEach(id => params.append('subjectIDs', id));
    searchParams.getAll('languageIDs').forEach(id => params.append('languageIDs', id));
    searchParams.getAll('levels').forEach(level => params.append('levels', level));

    setIsLoading(true);
    setError(null);

    apiClient.get(endpoint, { params })
      .then(response => {
        setCourses(response.data);
      })
      .catch(error => {
        setCourses([]);
        setError(error.message || 'Something went wrong');
      })
      .finally(() => {
        setIsLoading(false);
      });

  }, [searchParams, sectionType]);

  return { courses, isLoading, error };
}
