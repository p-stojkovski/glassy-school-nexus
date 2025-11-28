import { useState, useEffect } from 'react';
import homeworkApiService from '@/services/homeworkApiService';

export interface HomeworkAssignment {
  id: string | null;
  lessonId: string;
  description: string | null;
  assignedDate: string | null;
  hasHomework: boolean;
}

interface HomeworkDisplay {
  homework: HomeworkAssignment | null;
  loading: boolean;
  error: string | null;
}

export const useLessonHomeworkDisplay = (lessonId: string): HomeworkDisplay => {
  const [homework, setHomework] = useState<HomeworkAssignment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonId) return;

    const fetchHomework = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await homeworkApiService.getHomeworkAssignment(lessonId);
        // Normalize null response to object with hasHomework = false
        if (response === null) {
          setHomework({
            id: null,
            lessonId,
            description: null,
            assignedDate: null,
            hasHomework: false
          });
        } else {
          setHomework(response);
        }
      } catch (err: any) {
        console.error('Failed to load homework:', err);
        // Silent fail - don't show error for homework
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHomework();
  }, [lessonId]);

  return { homework, loading, error };
};
