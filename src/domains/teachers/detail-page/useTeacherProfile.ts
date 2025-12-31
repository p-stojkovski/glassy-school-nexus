import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { RootState } from '@/store';
import { setSelectedTeacher, updateTeacher, Teacher } from '@/domains/teachers/teachersSlice';
import { getTeacherById, getTeacherOverview } from '@/services/teacherApiService';
import { TeacherOverviewResponse } from '@/types/api/teacher';

export const useTeacherProfile = () => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Overview tab lazy loading state
  const [overviewData, setOverviewData] = useState<TeacherOverviewResponse | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  // Get teacher data from Redux state
  const { teachers, selectedTeacher } = useAppSelector(
    (state: RootState) => state.teachers
  );

  // Try to find teacher in existing list, or use selectedTeacher
  const teacher = teachers.find((t) => t.id === teacherId) ||
    (selectedTeacher?.id === teacherId ? selectedTeacher : null);

  // Fetch teacher if not found in state
  useEffect(() => {
    const fetchTeacher = async () => {
      if (!teacherId) return;

      // If teacher is already in state, no need to fetch
      if (teacher) return;

      setIsLoading(true);
      setError(null);

      try {
        const fetchedTeacher = await getTeacherById(teacherId);
        dispatch(setSelectedTeacher(fetchedTeacher));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load teacher';
        setError(errorMessage);
        // Navigate back if teacher not found
        navigate('/teachers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacher();
  }, [teacherId, teacher, dispatch, navigate]);

  // Fetch overview data when on overview tab (lazy loading)
  const fetchOverviewData = useCallback(async () => {
    if (!teacherId) return;

    setOverviewLoading(true);
    try {
      const data = await getTeacherOverview(teacherId);
      setOverviewData(data);
    } catch (err) {
      console.error('Failed to fetch teacher overview:', err);
      // Don't set error state - overview failure shouldn't block the page
    } finally {
      setOverviewLoading(false);
    }
  }, [teacherId]);

  // Lazy load overview data when switching to overview tab
  useEffect(() => {
    if (activeTab === 'overview' && teacher && !overviewData && !overviewLoading) {
      fetchOverviewData();
    }
  }, [activeTab, teacher, overviewData, overviewLoading, fetchOverviewData]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    navigate('/teachers');
  }, [navigate]);

  // Edit sheet handlers
  const handleOpenEditSheet = useCallback(() => {
    setIsEditSheetOpen(true);
  }, []);

  const handleCloseEditSheet = useCallback(() => {
    setIsEditSheetOpen(false);
  }, []);

  const handleEditSuccess = useCallback(() => {
    setIsEditSheetOpen(false);
    // The teacher data will be updated via Redux when the update is successful
  }, []);

  // Handle teacher update from inline editing (Details tab)
  const handleTeacherUpdate = useCallback((updatedTeacher: Teacher) => {
    // Update both selectedTeacher and the teacher in the list
    dispatch(setSelectedTeacher(updatedTeacher));
    dispatch(updateTeacher(updatedTeacher));
  }, [dispatch]);

  return {
    // Data
    teacher,
    teacherId,

    // Loading/Error states
    isLoading,
    error,

    // Tab state
    activeTab,
    setActiveTab,

    // Overview data (lazy loaded)
    overviewData,
    overviewLoading,

    // Edit sheet state
    isEditSheetOpen,
    handleOpenEditSheet,
    handleCloseEditSheet,
    handleEditSuccess,

    // Teacher update (for inline editing in Details tab)
    handleTeacherUpdate,

    // Navigation
    handleBack,
  };
};
