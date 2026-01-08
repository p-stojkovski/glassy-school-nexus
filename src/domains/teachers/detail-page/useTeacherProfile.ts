import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { RootState } from '@/store';
import { setSelectedTeacher, Teacher } from '@/domains/teachers/teachersSlice';
import { getTeacherById, getTeacherOverview, getTeacherClassesPaymentSummary } from '@/services/teacherApiService';
import { TeacherOverviewResponse, PaymentSummary } from '@/types/api/teacher';

export const useTeacherProfile = () => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState('schedule');
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Overview tab lazy loading state
  const [overviewData, setOverviewData] = useState<TeacherOverviewResponse | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  // Payment summary for overview tab (studentsWithDues indicator)
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);

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
      // Fetch overview and payment summary in parallel
      const [overviewResult, paymentResult] = await Promise.allSettled([
        getTeacherOverview(teacherId),
        getTeacherClassesPaymentSummary(teacherId),
      ]);

      if (overviewResult.status === 'fulfilled') {
        setOverviewData(overviewResult.value);
      }

      if (paymentResult.status === 'fulfilled') {
        setPaymentSummary(paymentResult.value.summary);
      }
    } catch (err) {
      console.error('Failed to fetch teacher overview:', err);
      // Don't set error state - overview failure shouldn't block the page
    } finally {
      setOverviewLoading(false);
    }
  }, [teacherId]);

  // Lazy load overview data when switching to schedule tab
  useEffect(() => {
    if (activeTab === 'schedule' && teacher && !overviewData && !overviewLoading) {
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
    paymentSummary,

    // Edit sheet state
    isEditSheetOpen,
    handleOpenEditSheet,
    handleCloseEditSheet,
    handleEditSuccess,

    // Navigation
    handleBack,
  };
};
