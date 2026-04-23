import { useEffect, useState } from 'react';
import apiClient from '@/api/apiClient';

export function useFetchCourseById(id: string | undefined) {
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(`/courses/${id}`);
        setCourse(response.data);
      } catch (err: any) {
        setError(err.response?.data || 'Failed to fetch course');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { course, isLoading, error };
}
