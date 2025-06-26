import { useState, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import {
  PrivateLesson,
  addPrivateLesson,
  updatePrivateLesson,
  deletePrivateLesson,
  cancelPrivateLesson,
  completePrivateLesson,
  setLoading,
  setError,
  selectAllPrivateLessons,
  selectPrivateLessonsLoading,
  selectPrivateLessonsError,
} from '../privateLessonsSlice';
import { PrivateLessonStatus } from '@/types/enums';
import { toast } from 'sonner';

export interface PrivateLessonFormData {
  studentId: string;
  teacherId: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  classroomId: string;
  notes?: string;
}

export const usePrivateLessonsManagement = () => {
  const dispatch = useAppDispatch();
  const lessons = useAppSelector(selectAllPrivateLessons);
  const loading = useAppSelector(selectPrivateLessonsLoading);
  const error = useAppSelector(selectPrivateLessonsError);

  // Get related data for form dropdowns
  const students = useAppSelector(
    (state: RootState) => state.students.students
  );
  const teachers = useAppSelector(
    (state: RootState) => state.teachers.teachers
  );
  const classrooms = useAppSelector(
    (state: RootState) => state.classrooms.classrooms
  );

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PrivateLessonStatus | 'all'>(
    'all'
  );
  const [dateFilter, setDateFilter] = useState<string>('');

  // UI state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<PrivateLesson | null>(
    null
  );
  const [lessonToCancel, setLessonToCancel] = useState<PrivateLesson | null>(
    null
  );
  const [lessonToComplete, setLessonToComplete] =
    useState<PrivateLesson | null>(null);

  // Filtered lessons
  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const matchesSearch =
        lesson.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.classroomName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || lesson.status === statusFilter;
      const matchesDate = !dateFilter || lesson.date === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [lessons, searchTerm, statusFilter, dateFilter]);

  // CRUD operations
  const handleAddLesson = useCallback(() => {
    setSelectedLesson(null);
    setIsFormOpen(true);
  }, []);

  const handleEditLesson = useCallback((lesson: PrivateLesson) => {
    setSelectedLesson(lesson);
    setIsFormOpen(true);
  }, []);

  const handleDeleteLesson = useCallback((lesson: PrivateLesson) => {
    setLessonToCancel(lesson);
  }, []);

  const handleCompleteLesson = useCallback((lesson: PrivateLesson) => {
    setLessonToComplete(lesson);
  }, []);

  const handleSubmitLesson = useCallback(
    async (data: PrivateLessonFormData) => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        // Get related entity names for display
        const student = students.find((s) => s.id === data.studentId);
        const teacher = teachers.find((t) => t.id === data.teacherId);
        const classroom = classrooms.find((c) => c.id === data.classroomId);

        if (!student || !teacher || !classroom) {
          throw new Error('Required entities not found');
        }

        const lessonData: PrivateLesson = {
          id: selectedLesson ? selectedLesson.id : crypto.randomUUID(),
          studentId: data.studentId,
          studentName: student.name,
          teacherId: data.teacherId,
          teacherName: teacher.name,
          subject: data.subject,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          classroomId: data.classroomId,
          classroomName: classroom.name,
          status: selectedLesson
            ? selectedLesson.status
            : PrivateLessonStatus.Scheduled,
          notes: data.notes,
          createdAt: selectedLesson
            ? selectedLesson.createdAt
            : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (selectedLesson) {
          dispatch(updatePrivateLesson(lessonData));
          toast.success('Private lesson updated successfully');
        } else {
          dispatch(addPrivateLesson(lessonData));
          toast.success('Private lesson scheduled successfully');
        }

        setIsFormOpen(false);
        setSelectedLesson(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred';
        dispatch(setError(errorMessage));
        toast.error(errorMessage);
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, selectedLesson, students, teachers, classrooms]
  );

  const confirmCancelLesson = useCallback(async () => {
    if (!lessonToCancel) return;

    try {
      dispatch(setLoading(true));
      dispatch(cancelPrivateLesson(lessonToCancel.id));
      toast.success('Private lesson cancelled successfully');
      setLessonToCancel(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to cancel lesson';
      toast.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, lessonToCancel]);

  const confirmDeleteLesson = useCallback(async () => {
    if (!lessonToCancel) return;

    try {
      dispatch(setLoading(true));
      dispatch(deletePrivateLesson(lessonToCancel.id));
      toast.success('Private lesson deleted successfully');
      setLessonToCancel(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete lesson';
      toast.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, lessonToCancel]);

  const confirmCompleteLesson = useCallback(async () => {
    if (!lessonToComplete) return;

    try {
      dispatch(setLoading(true));
      dispatch(completePrivateLesson(lessonToComplete.id));
      toast.success('Private lesson marked as completed');
      setLessonToComplete(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to complete lesson';
      toast.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, lessonToComplete]);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setSelectedLesson(null);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('');
  }, []);

  // Check if filters are applied
  const hasFilters = useMemo(() => {
    return searchTerm !== '' || statusFilter !== 'all' || dateFilter !== '';
  }, [searchTerm, statusFilter, dateFilter]);

  return {
    // Data
    lessons: filteredLessons,
    allLessons: lessons,
    loading,
    error,
    students,
    teachers,
    classrooms,

    // Filter state
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    hasFilters,
    clearFilters,

    // UI state
    isFormOpen,
    setIsFormOpen,
    selectedLesson,
    setSelectedLesson,
    lessonToCancel,
    setLessonToCancel,
    lessonToComplete,
    setLessonToComplete,

    // Handlers
    handleAddLesson,
    handleEditLesson,
    handleDeleteLesson,
    handleCompleteLesson,
    handleSubmitLesson,
    handleCloseForm,
    confirmCancelLesson,
    confirmDeleteLesson,
    confirmCompleteLesson,

    // Computed
    isEditing: !!selectedLesson,
  };
};
