import { useState, useEffect } from 'react';
import lessonStudentApiService from '@/services/lessonStudentApiService';

export interface StudentRecord {
  studentId: string;
  studentName: string;
  attendanceStatus: string | null;
  homeworkStatus: string | null;
  comments: string | null;
  updatedAt: string | null;
}

interface StudentRecordsReturn {
  records: StudentRecord[];
  loading: boolean;
  error: string | null;
}

export const useLessonStudentRecords = (lessonId: string): StudentRecordsReturn => {
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonId) return;

    const fetchRecords = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await lessonStudentApiService.getLessonStudents(lessonId);
        setRecords(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load student records');
        console.error('Failed to load lesson student records:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [lessonId]);

  return { records, loading, error };
};
