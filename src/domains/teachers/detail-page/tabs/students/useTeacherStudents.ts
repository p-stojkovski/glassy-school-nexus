import { useState, useEffect, useCallback, useMemo } from 'react';
import { teacherApiService } from '@/services/teacherApiService';
import { TeacherStudentDto, TeacherStudentsStats, TeacherClassDto } from '@/types/api/teacher';

interface UseTeacherStudentsOptions {
  teacherId: string;
}

interface UseTeacherStudentsResult {
  /** All students loaded from API */
  students: TeacherStudentDto[];
  /** Aggregated student statistics */
  stats: TeacherStudentsStats | null;
  /** Loading state */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;

  /** Selected class filter (null = all classes) */
  selectedClassId: string | null;
  /** Set class filter */
  setSelectedClassId: (value: string | null) => void;

  /** Show only active enrollments toggle */
  activeEnrollmentsOnly: boolean;
  /** Toggle active enrollments filter */
  setActiveEnrollmentsOnly: (value: boolean) => void;

  /** Students filtered by current filter state */
  filteredStudents: TeacherStudentDto[];

  /** Unique classes derived from students */
  classes: { id: string; name: string }[];

  /** Teacher's classes for filter dropdown */
  teacherClasses: TeacherClassDto[];

  /** Refresh data from API */
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching and filtering students taught by a teacher.
 * Fetches all students on mount and provides frontend filtering.
 */
export function useTeacherStudents({ teacherId }: UseTeacherStudentsOptions): UseTeacherStudentsResult {
  // Data state
  const [students, setStudents] = useState<TeacherStudentDto[]>([]);
  const [stats, setStats] = useState<TeacherStudentsStats | null>(null);
  const [teacherClasses, setTeacherClasses] = useState<TeacherClassDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [activeEnrollmentsOnly, setActiveEnrollmentsOnly] = useState(false);

  // Load students from API
  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all students (no filters - we filter on frontend for responsiveness)
      const [studentsResponse, classesResponse] = await Promise.all([
        teacherApiService.getTeacherStudents(teacherId),
        teacherApiService.getTeacherClasses(teacherId),
      ]);
      setStudents(studentsResponse.students);
      setStats(studentsResponse.stats);
      setTeacherClasses(classesResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  // Fetch on mount
  useEffect(() => {
    loadStudents();
  }, [teacherId]); // Only refetch when teacherId changes

  // Derive unique classes from loaded students
  const classes = useMemo(() => {
    const classesMap = new Map<string, { id: string; name: string }>();
    students.forEach(student => {
      if (!classesMap.has(student.classId)) {
        classesMap.set(student.classId, {
          id: student.classId,
          name: student.className,
        });
      }
    });
    return Array.from(classesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);

  // Apply frontend filters
  const filteredStudents = useMemo(() => {
    let result = [...students];

    // Filter by class
    if (selectedClassId) {
      result = result.filter(s => s.classId === selectedClassId);
    }

    // Filter by active enrollments
    if (activeEnrollmentsOnly) {
      result = result.filter(s => s.enrollmentStatus === 'Active');
    }

    return result;
  }, [students, selectedClassId, activeEnrollmentsOnly]);

  return {
    students,
    stats,
    loading,
    error,
    selectedClassId,
    setSelectedClassId,
    activeEnrollmentsOnly,
    setActiveEnrollmentsOnly,
    filteredStudents,
    classes,
    teacherClasses,
    refresh: loadStudents,
  };
}
