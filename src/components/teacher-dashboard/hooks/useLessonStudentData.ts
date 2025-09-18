import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import lessonStudentApiService from '@/services/lessonStudentApiService';
import {
  LessonStudentResponse,
  AttendanceStatus,
  HomeworkStatus,
  SaveStatus,
  LessonStudentError,
} from '@/types/api/lesson-students';

interface StudentRowState extends LessonStudentResponse {
  attendanceSaveStatus: SaveStatus;
  homeworkSaveStatus: SaveStatus;
  commentsSaveStatus: SaveStatus;
}

interface UseLessonStudentDataReturn {
  students: StudentRowState[];
  loading: boolean;
  error: string | null;
  updateAttendance: (studentId: string, status: AttendanceStatus) => Promise<void>;
  updateHomework: (studentId: string, status: HomeworkStatus) => Promise<void>;
  updateComments: (studentId: string, comments: string) => void;
  refreshStudents: () => Promise<void>;
}

export const useLessonStudentData = (lessonId: string): UseLessonStudentDataReturn => {
  const [students, setStudents] = useState<StudentRowState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for managing debounced saves
  const commentTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const mounted = useRef(true);

  // Cleanup function
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      // Clear all pending comment timeouts
      commentTimeouts.current.forEach(timeout => clearTimeout(timeout));
      commentTimeouts.current.clear();
    };
  }, []);

  // Convert API response to internal state format
  const mapToStudentRowState = (student: LessonStudentResponse): StudentRowState => ({
    ...student,
    attendanceSaveStatus: 'idle' as SaveStatus,
    homeworkSaveStatus: 'idle' as SaveStatus,
    commentsSaveStatus: 'idle' as SaveStatus,
  });

  // Fetch students for the lesson
  const fetchStudents = useCallback(async () => {
    if (!lessonId) return;

    try {
      setLoading(true);
      setError(null);
      const studentsData = await lessonStudentApiService.getLessonStudents(lessonId);
      
      if (mounted.current) {
        setStudents(studentsData.map(mapToStudentRowState));
      }
    } catch (err: any) {
      if (mounted.current) {
        const errorMessage = err.message || 'Failed to load students';
        setError(errorMessage);
        toast({
          title: 'Error loading students',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [lessonId]);

  // Initial load
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Update student in local state
  const updateStudentInState = useCallback((
    studentId: string, 
    updates: Partial<StudentRowState>
  ) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.studentId === studentId 
          ? { ...student, ...updates }
          : student
      )
    );
  }, []);

  // Update attendance status with immediate save
  const updateAttendance = useCallback(async (studentId: string, status: AttendanceStatus) => {
    // Optimistic update
    updateStudentInState(studentId, {
      attendanceStatus: status,
      attendanceSaveStatus: 'saving',
    });

    try {
      const updatedStudent = await lessonStudentApiService.updateAttendance(
        lessonId,
        studentId,
        { status }
      );

      if (mounted.current) {
        updateStudentInState(studentId, {
          ...mapToStudentRowState(updatedStudent),
          attendanceSaveStatus: 'saved',
        });

        // Reset save status after a short delay
        setTimeout(() => {
          if (mounted.current) {
            updateStudentInState(studentId, { attendanceSaveStatus: 'idle' });
          }
        }, 2000);
      }
    } catch (err: any) {
      if (mounted.current) {
        // Revert optimistic update and show error
        updateStudentInState(studentId, {
          attendanceStatus: students.find(s => s.studentId === studentId)?.attendanceStatus || null,
          attendanceSaveStatus: 'error',
        });

        toast({
          title: 'Failed to save attendance',
          description: err.message || 'Please try again',
          variant: 'destructive',
        });

        // Reset error status after delay
        setTimeout(() => {
          if (mounted.current) {
            updateStudentInState(studentId, { attendanceSaveStatus: 'idle' });
          }
        }, 3000);
      }
    }
  }, [lessonId, students, updateStudentInState]);

  // Update homework status with immediate save
  const updateHomework = useCallback(async (studentId: string, status: HomeworkStatus) => {
    // Optimistic update
    updateStudentInState(studentId, {
      homeworkStatus: status,
      homeworkSaveStatus: 'saving',
    });

    try {
      const updatedStudent = await lessonStudentApiService.updateHomework(
        lessonId,
        studentId,
        { status }
      );

      if (mounted.current) {
        updateStudentInState(studentId, {
          ...mapToStudentRowState(updatedStudent),
          homeworkSaveStatus: 'saved',
        });

        // Reset save status after a short delay
        setTimeout(() => {
          if (mounted.current) {
            updateStudentInState(studentId, { homeworkSaveStatus: 'idle' });
          }
        }, 2000);
      }
    } catch (err: any) {
      if (mounted.current) {
        // Revert optimistic update and show error
        updateStudentInState(studentId, {
          homeworkStatus: students.find(s => s.studentId === studentId)?.homeworkStatus || null,
          homeworkSaveStatus: 'error',
        });

        toast({
          title: 'Failed to save homework status',
          description: err.message || 'Please try again',
          variant: 'destructive',
        });

        // Reset error status after delay
        setTimeout(() => {
          if (mounted.current) {
            updateStudentInState(studentId, { homeworkSaveStatus: 'idle' });
          }
        }, 3000);
      }
    }
  }, [lessonId, students, updateStudentInState]);

  // Update comments with debounced save (2 seconds)
  const updateComments = useCallback((studentId: string, comments: string) => {
    // Immediate UI update
    updateStudentInState(studentId, {
      comments,
      commentsSaveStatus: comments.trim() ? 'saving' : 'idle',
    });

    // Clear existing timeout for this student
    const existingTimeout = commentTimeouts.current.get(studentId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Don't save if comments are empty
    if (!comments.trim()) {
      updateStudentInState(studentId, { commentsSaveStatus: 'idle' });
      return;
    }

    // Set new debounced save timeout
    const timeoutId = setTimeout(async () => {
      if (!mounted.current) return;

      try {
        const updatedStudent = await lessonStudentApiService.updateComments(
          lessonId,
          studentId,
          { comments }
        );

        if (mounted.current) {
          updateStudentInState(studentId, {
            ...mapToStudentRowState(updatedStudent),
            commentsSaveStatus: 'saved',
          });

          // Reset save status after delay
          setTimeout(() => {
            if (mounted.current) {
              updateStudentInState(studentId, { commentsSaveStatus: 'idle' });
            }
          }, 2000);
        }
      } catch (err: any) {
        if (mounted.current) {
          updateStudentInState(studentId, { commentsSaveStatus: 'error' });
          
          toast({
            title: 'Failed to save comment',
            description: err.message || 'Please try again',
            variant: 'destructive',
          });

          // Reset error status after delay
          setTimeout(() => {
            if (mounted.current) {
              updateStudentInState(studentId, { commentsSaveStatus: 'idle' });
            }
          }, 3000);
        }
      }

      // Clean up timeout reference
      commentTimeouts.current.delete(studentId);
    }, 2000);

    commentTimeouts.current.set(studentId, timeoutId);
  }, [lessonId, updateStudentInState]);

  // Refresh students data
  const refreshStudents = useCallback(async () => {
    await fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    loading,
    error,
    updateAttendance,
    updateHomework,
    updateComments,
    refreshStudents,
  };
};