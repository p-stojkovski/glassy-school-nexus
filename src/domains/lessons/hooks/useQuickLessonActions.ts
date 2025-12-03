import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { LessonResponse, MakeupLessonFormData, RescheduleLessonRequest, canRescheduleLesson as canRescheduleLessonStatus } from '@/types/api/lesson';
import { DEFAULT_CONDUCT_GRACE_MINUTES, canConductLesson as canConductLessonNow, getCannotConductReason } from '@/domains/lessons/lessonMode';
import { useLessons } from './useLessons';

interface QuickActionModals {
  conduct: {
    open: boolean;
    lesson: LessonResponse | null;
  };
  cancel: {
    open: boolean;
    lesson: LessonResponse | null;
  };
  reschedule: {
    open: boolean;
    lesson: LessonResponse | null;
  };
}

export const useQuickLessonActions = () => {
  const { 
    quickConduct, 
    quickCancel,
    rescheduleLessonById,
    conductingLesson, 
    cancellingLesson,
    reschedulingLesson,
    loadLessons 
  } = useLessons();

  const [modals, setModals] = useState<QuickActionModals>({
    conduct: { open: false, lesson: null },
    cancel: { open: false, lesson: null },
    reschedule: { open: false, lesson: null },
  });

  // Open conduct modal
  const openConductModal = useCallback((lesson: LessonResponse) => {
    const reason = getCannotConductReason(
      lesson.statusName,
      lesson.scheduledDate,
      lesson.startTime,
      DEFAULT_CONDUCT_GRACE_MINUTES
    );
    if (reason) {
      toast.error(reason);
      return;
    }

    setModals(prev => ({
      ...prev,
      conduct: { open: true, lesson }
    }));
  }, []);

  // Close conduct modal
  const closeConductModal = useCallback(() => {
    setModals(prev => ({
      ...prev,
      conduct: { open: false, lesson: null }
    }));
  }, []);

  // Open cancel modal
  const openCancelModal = useCallback((lesson: LessonResponse) => {
    // Check if lesson can be cancelled
    if (lesson.statusName !== 'Scheduled' && lesson.statusName !== 'Make Up') {
      toast.error('This lesson cannot be cancelled');
      return;
    }

    setModals(prev => ({
      ...prev,
      cancel: { open: true, lesson }
    }));
  }, []);

  // Close cancel modal
  const closeCancelModal = useCallback(() => {
    setModals(prev => ({
      ...prev,
      cancel: { open: false, lesson: null }
    }));
  }, []);

  // Open reschedule modal
  const openRescheduleModal = useCallback((lesson: LessonResponse) => {
    // Check if lesson can be rescheduled
    if (!canRescheduleLessonStatus(lesson.statusName)) {
      toast.error('This lesson cannot be rescheduled');
      return;
    }

    setModals(prev => ({
      ...prev,
      reschedule: { open: true, lesson }
    }));
  }, []);

  // Close reschedule modal
  const closeRescheduleModal = useCallback(() => {
    setModals(prev => ({
      ...prev,
      reschedule: { open: false, lesson: null }
    }));
  }, []);


  // Handle quick conduct
  const handleQuickConduct = useCallback(async (lessonId: string, notes?: string) => {
    try {
      await quickConduct(lessonId, notes);
      
      // Close modal and show success message
      closeConductModal();
      toast.success('Lesson marked as conducted successfully');
      
      // Refresh lessons list
      await loadLessons();
    } catch (error: unknown) {
      console.error('Failed to conduct lesson:', error);
      const message = error instanceof Error ? error.message : 'Failed to mark lesson as conducted';
      toast.error(message);
    }
  }, [quickConduct, closeConductModal, loadLessons]);

  // Handle quick cancel
  const handleQuickCancel = useCallback(async (lessonId: string, reason: string, makeupData?: MakeupLessonFormData) => {
    try {
      await quickCancel(lessonId, reason, makeupData);
      
      // Close modal and show success message
      closeCancelModal();
      
      if (makeupData) {
        const makeupDate = new Date(makeupData.scheduledDate).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
        toast.success(`Lesson cancelled and makeup scheduled for ${makeupDate}`);
      } else {
        toast.success('Lesson cancelled successfully');
      }
      
      // Refresh lessons list
      await loadLessons();
    } catch (error: unknown) {
      console.error('Failed to cancel lesson:', error);
      const message = error instanceof Error ? error.message : 'Failed to cancel lesson';
      toast.error(message);
    }
  }, [quickCancel, closeCancelModal, loadLessons]);

  // Handle reschedule
  const handleReschedule = useCallback(async (lessonId: string, request: RescheduleLessonRequest) => {
    try {
      await rescheduleLessonById(lessonId, request);
      
      // Close modal and show success message
      closeRescheduleModal();
      
      const newDate = new Date(request.newScheduledDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      toast.success(`Lesson rescheduled to ${newDate} at ${request.newStartTime}`);
      
      // Refresh lessons list
      await loadLessons();
    } catch (error: unknown) {
      console.error('Failed to reschedule lesson:', error);
      const message = error instanceof Error ? error.message : 'Failed to reschedule lesson';
      toast.error(message);
    }
  }, [rescheduleLessonById, closeRescheduleModal, loadLessons]);


  // Check if a lesson can be conducted
  const canConductLesson = useCallback((lesson: LessonResponse | null) => {
    if (!lesson) return false;
    return canConductLessonNow(
      lesson.statusName,
      lesson.scheduledDate,
      lesson.startTime,
      DEFAULT_CONDUCT_GRACE_MINUTES
    );
  }, []);

  // Check if a lesson can be cancelled
  const canCancelLesson = useCallback((lesson: LessonResponse | null) => {
    if (!lesson) return false;
    return lesson.statusName === 'Scheduled' || lesson.statusName === 'Make Up';
  }, []);


  // Check if a makeup lesson can be created
  const canCreateMakeup = useCallback((lesson: LessonResponse | null) => {
    if (!lesson) return false;
    return lesson.statusName === 'Cancelled' && !lesson.makeupLessonId;
  }, []);

  // Check if a lesson can be rescheduled
  const canRescheduleLesson = useCallback((lesson: LessonResponse | null) => {
    if (!lesson) return false;
    return canRescheduleLessonStatus(lesson.statusName);
  }, []);

  return {
    // Modal states
    modals,
    
    // Modal actions
    openConductModal,
    closeConductModal,
    openCancelModal,
    closeCancelModal,
    openRescheduleModal,
    closeRescheduleModal,
    
    // API actions
    handleQuickConduct,
    handleQuickCancel,
    handleReschedule,
    
    // Loading states
    conductingLesson,
    cancellingLesson,
    reschedulingLesson,
    
    // Validation helpers
    canConductLesson,
    canCancelLesson,
    canCreateMakeup,
    canRescheduleLesson,
  };
};

