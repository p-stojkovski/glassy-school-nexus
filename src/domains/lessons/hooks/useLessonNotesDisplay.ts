import { useState, useEffect } from 'react';
import lessonStudentApiService from '@/services/lessonStudentApiService';

interface LessonNotesDisplay {
  notes: string | null;
  loading: boolean;
  error: string | null;
}

export const useLessonNotesDisplay = (lessonId: string): LessonNotesDisplay => {
  const [notes, setNotes] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonId) return;

    const fetchNotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await lessonStudentApiService.getLessonNotes(lessonId);
        setNotes(response.notes || null);
      } catch (err: any) {
        console.error('Failed to load lesson notes:', err);
        // Silent fail - don't show error for notes
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [lessonId]);

  return { notes, loading, error };
};
