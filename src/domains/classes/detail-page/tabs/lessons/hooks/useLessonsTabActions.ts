import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { LessonResponse, CreateLessonRequest, MakeupLessonFormData, ClassLessonFilterParams } from '@/types/api/lesson';
import { useQuickLessonActions } from '@/domains/lessons/hooks/useQuickLessonActions';
import { useLessons } from '@/domains/lessons/hooks/useLessons';

interface UseLessonsTabActionsOptions {
  classId: string;
  loadLessons: (filters?: ClassLessonFilterParams) => Promise<void>;
  currentFilters: ClassLessonFilterParams;
  onLessonsUpdated?: () => void;
}

interface UseLessonsTabActionsResult {
  // Modal states
  isCreateLessonOpen: boolean;
  setIsCreateLessonOpen: (open: boolean) => void;
  isAcademicGenerationOpen: boolean;
  setIsAcademicGenerationOpen: (open: boolean) => void;
  // Quick action modals from hook
  modals: ReturnType<typeof useQuickLessonActions>['modals'];
  openConductModal: ReturnType<typeof useQuickLessonActions>['openConductModal'];
  closeConductModal: ReturnType<typeof useQuickLessonActions>['closeConductModal'];
  openCancelModal: ReturnType<typeof useQuickLessonActions>['openCancelModal'];
  closeCancelModal: ReturnType<typeof useQuickLessonActions>['closeCancelModal'];
  openRescheduleModal: ReturnType<typeof useQuickLessonActions>['openRescheduleModal'];
  closeRescheduleModal: ReturnType<typeof useQuickLessonActions>['closeRescheduleModal'];
  // Loading states
  conductingLesson: boolean;
  cancellingLesson: boolean;
  reschedulingLesson: boolean;
  creatingLesson: boolean;
  // Action handlers
  handleQuickConduct: (lessonId: string, notes?: string) => Promise<void>;
  handleQuickCancel: (lessonId: string, reason: string, makeupData?: MakeupLessonFormData) => Promise<void>;
  handleReschedule: (lessonId: string, request: { newDate: string; newStartTime: string; newEndTime: string; reason?: string }) => Promise<void>;
  handleCreateLesson: (lessonData: CreateLessonRequest) => Promise<void>;
  handleAcademicGenerationSuccess: (result: { generatedCount: number; skippedCount?: number }) => Promise<void>;
  // Makeup lesson creation
  createMakeup: ReturnType<typeof useLessons>['createMakeup'];
}

/**
 * Hook to manage lesson action handlers for the LessonsTab.
 * Handles quick conduct, cancel, reschedule, create, and generation actions.
 */
export function useLessonsTabActions({
  loadLessons,
  currentFilters,
  onLessonsUpdated,
}: UseLessonsTabActionsOptions): UseLessonsTabActionsResult {
  const [isCreateLessonOpen, setIsCreateLessonOpen] = useState(false);
  const [isAcademicGenerationOpen, setIsAcademicGenerationOpen] = useState(false);

  // Quick actions hook
  const {
    modals,
    openConductModal,
    closeConductModal,
    openCancelModal,
    closeCancelModal,
    openRescheduleModal,
    closeRescheduleModal,
    handleQuickConduct: originalQuickConduct,
    handleQuickCancel: originalQuickCancel,
    handleReschedule: originalReschedule,
    conductingLesson,
    cancellingLesson,
    reschedulingLesson,
  } = useQuickLessonActions();

  // Lesson creation from useLessons hook
  const { addLesson, creatingLesson, createMakeup } = useLessons();

  // Wrapper for quick conduct that refreshes with current filters
  const handleQuickConduct = useCallback(async (lessonId: string, notes?: string) => {
    try {
      await originalQuickConduct(lessonId, notes);
      await loadLessons(currentFilters);
      onLessonsUpdated?.();
    } catch {
      // Error already handled/toasted by the hook
    }
  }, [originalQuickConduct, loadLessons, currentFilters, onLessonsUpdated]);

  // Wrapper for quick cancel that refreshes with current filters
  const handleQuickCancel = useCallback(async (lessonId: string, reason: string, makeupData?: MakeupLessonFormData) => {
    try {
      await originalQuickCancel(lessonId, reason, makeupData);
      await loadLessons(currentFilters);
      onLessonsUpdated?.();
    } catch {
      // Error already handled/toasted by the hook
    }
  }, [originalQuickCancel, loadLessons, currentFilters, onLessonsUpdated]);

  // Wrapper for reschedule that refreshes with current filters
  const handleReschedule = useCallback(async (lessonId: string, request: Parameters<typeof originalReschedule>[1]) => {
    try {
      await originalReschedule(lessonId, request);
      await loadLessons(currentFilters);
      onLessonsUpdated?.();
    } catch {
      // Error already handled/toasted by the hook
    }
  }, [originalReschedule, loadLessons, currentFilters, onLessonsUpdated]);

  // Handle lesson creation
  const handleCreateLesson = useCallback(async (lessonData: CreateLessonRequest) => {
    try {
      await addLesson(lessonData).unwrap();
      setIsCreateLessonOpen(false);
      await loadLessons(currentFilters);
      onLessonsUpdated?.();
      toast.success('Lesson created successfully');
    } catch (error: unknown) {
      console.error('Failed to create lesson:', error);
      toast.error((error as Error)?.message || 'Failed to create lesson');
    }
  }, [addLesson, loadLessons, currentFilters, onLessonsUpdated]);

  // Handle academic lesson generation success
  const handleAcademicGenerationSuccess = useCallback(async (result: { generatedCount: number; skippedCount?: number }) => {
    await loadLessons(currentFilters);
    onLessonsUpdated?.();
    setIsAcademicGenerationOpen(false);

    const message = `Generated ${result.generatedCount} lessons`;
    const details = result.skippedCount && result.skippedCount > 0 ? ` (${result.skippedCount} skipped)` : '';
    toast.success(message + details);
  }, [loadLessons, currentFilters, onLessonsUpdated]);

  return {
    isCreateLessonOpen,
    setIsCreateLessonOpen,
    isAcademicGenerationOpen,
    setIsAcademicGenerationOpen,
    modals,
    openConductModal,
    closeConductModal,
    openCancelModal,
    closeCancelModal,
    openRescheduleModal,
    closeRescheduleModal,
    conductingLesson,
    cancellingLesson,
    reschedulingLesson,
    creatingLesson,
    handleQuickConduct,
    handleQuickCancel,
    handleReschedule,
    handleCreateLesson,
    handleAcademicGenerationSuccess,
    createMakeup,
  };
}
