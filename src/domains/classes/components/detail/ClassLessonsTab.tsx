import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ClassBasicInfoResponse } from '@/types/api/class';
import { LessonResponse, LessonStatusName, CreateLessonRequest, MakeupLessonFormData } from '@/types/api/lesson';
import { useLessonsForClass, useLessons } from '@/domains/lessons/hooks/useLessons';
import { useQuickLessonActions } from '@/domains/lessons/hooks/useQuickLessonActions';
import LessonTimeline from '@/domains/lessons/components/LessonTimeline';
import LessonsSummaryStrip from '@/domains/lessons/components/LessonsSummaryStrip';
import LessonsEnhancedFilters from '@/domains/lessons/components/LessonsEnhancedFilters';
import CreateLessonSidebar from '@/domains/lessons/components/modals/CreateLessonSidebar';
import QuickConductLessonModal from '@/domains/lessons/components/modals/QuickConductLessonModal';
import QuickCancelLessonModal from '@/domains/lessons/components/modals/QuickCancelLessonModal';
import LessonDetailsSheet from '@/domains/lessons/components/sheets/LessonDetailsSheet';
import AcademicLessonGenerationModal from '@/domains/lessons/components/modals/AcademicLessonGenerationModal';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import LessonActionButtons from '@/domains/lessons/components/LessonActionButtons';
import { hasActiveSchedules, getScheduleWarningMessage } from '@/domains/classes/utils/scheduleValidationUtils';
import { filterLessons, ScopeFilter } from '@/domains/lessons/utils/lessonFilters';

interface ClassLessonsTabProps {
  classData: ClassBasicInfoResponse;
  onScheduleTabClick?: () => void;
  /** Callback when lessons are created/updated - used to refresh hero section */
  onLessonsUpdated?: () => void;
  /** External control of lesson details sheet - open state */
  externalLessonDetailsOpen?: boolean;
  /** External control of lesson details sheet - selected lesson */
  externalSelectedLesson?: LessonResponse | null;
  /** Callback to update external lesson details open state */
  onExternalLessonDetailsChange?: (open: boolean) => void;
  /** Callback to update external selected lesson */
  onExternalSelectedLessonChange?: (lesson: LessonResponse | null) => void;
}

type LessonFilter = 'all' | LessonStatusName;

const ClassLessonsTab: React.FC<ClassLessonsTabProps> = ({
  classData,
  onScheduleTabClick,
  onLessonsUpdated,
  externalLessonDetailsOpen,
  externalSelectedLesson,
  onExternalLessonDetailsChange,
  onExternalSelectedLessonChange,
}) => {
  const navigate = useNavigate();
  const { lessons, loading, loadLessons, summary } = useLessonsForClass(classData.id);
  const [statusFilter, setStatusFilter] = useState<LessonFilter>('all');
  
  // Ref to scroll to next lesson
  const nextLessonRef = useRef<HTMLDivElement>(null);
  
  // Scope filter - default to 'upcoming' to show what matters most
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('upcoming');
  const [isCreateLessonOpen, setIsCreateLessonOpen] = useState(false);
  const [isAcademicGenerationOpen, setIsAcademicGenerationOpen] = useState(false);
  
  // Internal state for lesson details
  const [internalIsLessonDetailsOpen, setInternalIsLessonDetailsOpen] = useState(false);
  const [internalSelectedLessonIdForDetails, setInternalSelectedLessonIdForDetails] = useState<string | null>(null);
  const [makeupLesson, setMakeupLesson] = useState<LessonResponse | null>(null);
  
  // Determine effective state - use external if provided, otherwise internal
  const isLessonDetailsOpen = externalLessonDetailsOpen !== undefined 
    ? externalLessonDetailsOpen 
    : internalIsLessonDetailsOpen;
  
  const selectedLessonForDetails = externalSelectedLesson !== undefined
    ? externalSelectedLesson
    : lessons.find(lesson => lesson.id === internalSelectedLessonIdForDetails) || null;
  
  // Quick actions hook
  const {
    modals,
    openConductModal,
    closeConductModal,
    openCancelModal,
    closeCancelModal,
    handleQuickConduct,
    handleQuickCancel,
    conductingLesson,
    cancellingLesson,
  } = useQuickLessonActions();
  
  // Lesson creation from useLessons hook
  const { addLesson, creatingLesson, createMakeup, loadLessonById } = useLessons();

  // Compute next lesson
  const nextLesson = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = lessons
      .filter(l => {
        const lessonDate = new Date(l.scheduledDate);
        lessonDate.setHours(0, 0, 0, 0);
        return l.statusName === 'Scheduled' && lessonDate >= today;
      })
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
    return upcoming[0] || null;
  }, [lessons]);
  
  // Load lessons when component mounts
  useEffect(() => {
    loadLessons(); // Load all lessons for this class
  }, [loadLessons]);
  
  // Handle lesson creation
  const handleCreateLesson = async (lessonData: CreateLessonRequest) => {
    try {
      // Use unwrap() to properly await the thunk and catch errors
      await addLesson(lessonData).unwrap();
      setIsCreateLessonOpen(false);
      // Reload lessons to show the new one and update all related data
      await loadLessons();
      // Notify parent to refresh hero section (lesson context)
      onLessonsUpdated?.();
      toast.success('Lesson created successfully');
    } catch (error: any) {
      console.error('Failed to create lesson:', error);
      toast.error(error?.message || 'Failed to create lesson');
    }
  };

  // Handle opening lesson details
  const handleLessonDetails = async (lesson: LessonResponse) => {
    setInternalSelectedLessonIdForDetails(lesson.id);
    onExternalSelectedLessonChange?.(lesson);
    
    // Load makeup lesson if exists
    if (lesson.makeupLessonId) {
      try {
        const makeup = lessons.find(l => l.id === lesson.makeupLessonId);
        if (makeup) {
          setMakeupLesson(makeup);
        }
      } catch (error) {
        console.error('Failed to load makeup lesson:', error);
      }
    } else {
      setMakeupLesson(null);
    }
    
    setInternalIsLessonDetailsOpen(true);
    onExternalLessonDetailsChange?.(true);
  };

  // Handle closing lesson details sheet
  const handleLessonDetailsClose = (open: boolean) => {
    setInternalIsLessonDetailsOpen(open);
    onExternalLessonDetailsChange?.(open);
    if (!open) {
      setInternalSelectedLessonIdForDetails(null);
      onExternalSelectedLessonChange?.(null);
    }
  };

  // Handle viewing makeup lesson (opens that lesson's details)
  const handleViewMakeupLesson = async (lessonId: string) => {
    const makeupLesson = lessons.find(l => l.id === lessonId);
    if (makeupLesson) {
      setInternalSelectedLessonIdForDetails(makeupLesson.id);
      onExternalSelectedLessonChange?.(makeupLesson);
      setMakeupLesson(null); // Clear previous makeup reference
      // Note: This makeup lesson might itself have an original lesson, but we'll keep it simple for now
    }
  };

  // Handle creating makeup lesson from details modal
  const handleCreateMakeupFromDetails = async (originalLessonId: string, makeupData: MakeupLessonFormData) => {
    try {
      // Call the createMakeup API
      await createMakeup(originalLessonId, makeupData);
      
      // Reload lessons to show the new makeup lesson and updated original lesson
      await loadLessons();
      // Notify parent to refresh hero section
      onLessonsUpdated?.();
      
      // Update the current lesson details if it's still selected
      const currentSelectedLessonId =
        externalSelectedLesson?.id ?? internalSelectedLessonIdForDetails;
      if (currentSelectedLessonId === originalLessonId) {
        const updatedLesson = lessons.find(l => l.id === originalLessonId);
        if (updatedLesson) {
          // Load the newly created makeup lesson
          if (updatedLesson.makeupLessonId) {
            const newMakeupLesson = lessons.find(l => l.id === updatedLesson.makeupLessonId);
            if (newMakeupLesson) {
              setMakeupLesson(newMakeupLesson);
            }
          }
        }
      }
      
      const makeupDate = new Date(makeupData.scheduledDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      toast.success(`Makeup lesson created for ${makeupDate}`);
    } catch (error: any) {
      console.error('Failed to create makeup lesson:', error);
      toast.error(error?.message || 'Failed to create makeup lesson');
    }
  };

  // Handle academic lesson generation success
  const handleAcademicGenerationSuccess = async (result: { generatedCount: number; skippedCount?: number }) => {
    // Reload lessons to show the newly generated ones
    await loadLessons();
    // Notify parent to refresh hero section
    onLessonsUpdated?.();
    setIsAcademicGenerationOpen(false);
    
    const message = `Generated ${result.generatedCount} lessons`;
    const details = result.skippedCount && result.skippedCount > 0 ? ` (${result.skippedCount} skipped)` : '';
    toast.success(message + details);
  };

  // Apply all filters using the filterLessons utility
  const filteredLessons = useMemo(() => {
    return filterLessons(lessons, {
      status: statusFilter,
      scope: scopeFilter,
    });
  }, [lessons, statusFilter, scopeFilter]);
  
  // Memoize unique teachers computation
  const uniqueTeachers = useMemo(() => {
    return lessons.reduce((acc, lesson) => {
      if (!acc.find(t => t.id === lesson.teacherId)) {
        acc.push({ id: lesson.teacherId, name: lesson.teacherName });
      }
      return acc;
    }, [] as { id: string; name: string }[]);
  }, [lessons]);

  // Schedule validation
  const scheduleAvailable = hasActiveSchedules(classData);
  const scheduleWarning = getScheduleWarningMessage(classData);

  // Handler to navigate to teaching mode / edit lesson details
  const handleEditLessonDetails = useCallback((lesson: LessonResponse) => {
    navigate(`/classes/${classData.id}/teach/${lesson.id}`);
  }, [navigate, classData.id]);
  
  // Handler to start teaching (navigate to teaching mode)
  const handleStartTeaching = useCallback((lesson: LessonResponse) => {
    navigate(`/classes/${classData.id}/teach/${lesson.id}`);
  }, [navigate, classData.id]);
  
  // Handler to scroll to next lesson card
  const handleScrollToNextLesson = useCallback(() => {
    if (!nextLesson) return;
    
    // Find the lesson card element for the next lesson
    const lessonCard = document.querySelector(`[data-lesson-id="${nextLesson.id}"]`);
    if (lessonCard) {
      lessonCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a brief highlight animation
      lessonCard.classList.add('ring-2', 'ring-blue-400');
      setTimeout(() => {
        lessonCard.classList.remove('ring-2', 'ring-blue-400');
      }, 2000);
    }
  }, [nextLesson]);

  if (loading && lessons.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Empty state message based on filters
  const getEmptyMessage = () => {
    if (lessons.length === 0) {
      return "No lessons yet";
    }
    if (scopeFilter === 'upcoming' && filteredLessons.length === 0) {
      return "No upcoming lessons scheduled";
    }
    if (scopeFilter !== 'all' || statusFilter !== 'all') {
      return "No lessons found matching your filters";
    }
    return "No lessons available";
  };

  return (
    <div className="space-y-4">
      {/* Schedule Warning Banner */}
      {!scheduleAvailable && scheduleWarning && (
        <Alert className="bg-yellow-500/10 border-yellow-500/30">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-200 ml-2 flex items-center justify-between">
            <span>{scheduleWarning}</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Strip */}
      {lessons.length > 0 && (
        <LessonsSummaryStrip 
          summary={summary} 
          nextLesson={nextLesson}
          onUpcomingClick={() => {
            setScopeFilter('upcoming');
            setStatusFilter('all');
          }}
          onCompletedClick={() => {
            setScopeFilter('past');
            setStatusFilter('conducted');
          }}
          onNextLessonClick={handleScrollToNextLesson}
        />
      )}

      {/* Enhanced Filters and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Enhanced Filters */}
        <div className="flex items-center gap-2">
          <LessonsEnhancedFilters
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            scopeFilter={scopeFilter}
            onScopeChange={setScopeFilter}
            compact={true}
          />
          {filteredLessons.length !== lessons.length && (
            <span className="text-white/50 text-sm">
              Showing {filteredLessons.length} of {lessons.length}
            </span>
          )}
        </div>

        {/* Right: Action Buttons */}
        <LessonActionButtons
          onCreateLesson={() => setIsCreateLessonOpen(true)}
          onGenerateLessons={() => setIsAcademicGenerationOpen(true)}
          generateDisabled={!scheduleAvailable}
          disabledTooltip={scheduleWarning || undefined}
          hasLessons={lessons.length > 0}
        />
      </div>

      {/* Timeline View */}
      <LessonTimeline 
        lessons={filteredLessons}
        loading={loading}
        groupByMonth={true}
        showActions={true}
        nextLesson={nextLesson}
        onViewLesson={handleLessonDetails}
        onStartTeaching={handleStartTeaching}
        onQuickConduct={openConductModal}
        onQuickCancel={openCancelModal}
        emptyMessage={getEmptyMessage()}
      />
      
      {/* Quick Action Modals */}
      <QuickConductLessonModal
        lesson={modals.conduct.lesson}
        open={modals.conduct.open}
        onOpenChange={closeConductModal}
        onConfirm={handleQuickConduct}
        loading={conductingLesson}
      />
      
      <QuickCancelLessonModal
        lesson={modals.cancel.lesson}
        open={modals.cancel.open}
        onOpenChange={closeCancelModal}
        onConfirm={handleQuickCancel}
        loading={cancellingLesson}
      />
      
      {/* Academic Lesson Generation Modal */}
      <AcademicLessonGenerationModal
        open={isAcademicGenerationOpen}
        onOpenChange={setIsAcademicGenerationOpen}
        classId={classData.id}
        className={classData.name}
        onSuccess={handleAcademicGenerationSuccess}
      />
      
      {/* Create Lesson Sidebar */}
      <CreateLessonSidebar
        open={isCreateLessonOpen}
        onOpenChange={setIsCreateLessonOpen}
        onSubmit={handleCreateLesson}
        classId={classData.id}
        className={classData.name}
        loading={creatingLesson}
      />
      
      {/* Lesson Details Sheet */}
      <LessonDetailsSheet
        lesson={selectedLessonForDetails}
        open={isLessonDetailsOpen}
        onOpenChange={handleLessonDetailsClose}
        onConduct={openConductModal}
        onCancel={openCancelModal}
        onEditLessonDetails={handleEditLessonDetails}
      />
    </div>
  );
};

export default ClassLessonsTab;

