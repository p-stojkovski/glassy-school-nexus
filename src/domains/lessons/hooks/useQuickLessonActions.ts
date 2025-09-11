import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { LessonResponse, MakeupLessonFormData } from '@/types/api/lesson';
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
}

export const useQuickLessonActions = () => {
  const { 
    quickConduct, 
    quickCancel, 
    conductingLesson, 
    cancellingLesson,
    loadLessons 
  } = useLessons();

  const [modals, setModals] = useState<QuickActionModals>({
    conduct: { open: false, lesson: null },
    cancel: { open: false, lesson: null },
  });

  // Open conduct modal
  const openConductModal = useCallback((lesson: LessonResponse) => {
    // Check if lesson can be conducted
    if (lesson.statusName !== 'Scheduled' && lesson.statusName !== 'Make Up') {
      toast.error('This lesson cannot be marked as conducted');
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


  // Handle quick conduct
  const handleQuickConduct = useCallback(async (lessonId: string, notes?: string) => {
    try {
      await quickConduct(lessonId, notes);
      
      // Close modal and show success message
      closeConductModal();
      toast.success('Lesson marked as conducted successfully');
      
      // Refresh lessons list
      await loadLessons();
    } catch (error: any) {
      console.error('Failed to conduct lesson:', error);
      toast.error(error?.message || 'Failed to mark lesson as conducted');
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
    } catch (error: any) {
      console.error('Failed to cancel lesson:', error);
      toast.error(error?.message || 'Failed to cancel lesson');
    }
  }, [quickCancel, closeCancelModal, loadLessons]);


  // Check if a lesson can be conducted
  const canConductLesson = useCallback((lesson: LessonResponse | null) => {
    if (!lesson) return false;
    return lesson.statusName === 'Scheduled' || lesson.statusName === 'Make Up';
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

  return {
    // Modal states
    modals,
    
    // Modal actions
    openConductModal,
    closeConductModal,
    openCancelModal,
    closeCancelModal,
    
    // API actions
    handleQuickConduct,
    handleQuickCancel,
    
    // Loading states
    conductingLesson,
    cancellingLesson,
    
    // Validation helpers
    canConductLesson,
    canCancelLesson,
    canCreateMakeup,
  };
};
