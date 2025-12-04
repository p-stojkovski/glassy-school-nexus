import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertCircle, AlertTriangle, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClassBasicInfoResponse } from '@/types/api/class';
import { LessonResponse, LessonStatusName, CreateLessonRequest, MakeupLessonFormData, ClassLessonFilterParams, LessonTimeWindow } from '@/types/api/lesson';
import { useLessonsForClass, useLessons } from '@/domains/lessons/hooks/useLessons';
import { useQuickLessonActions } from '@/domains/lessons/hooks/useQuickLessonActions';
import LessonTimeline from '@/domains/lessons/components/LessonTimeline';
import LessonsEnhancedFilters from '@/domains/lessons/components/LessonsEnhancedFilters';
import CreateLessonSidebar from '@/domains/lessons/components/modals/CreateLessonSidebar';
import QuickConductLessonModal from '@/domains/lessons/components/modals/QuickConductLessonModal';
import QuickCancelLessonModal from '@/domains/lessons/components/modals/QuickCancelLessonModal';
import RescheduleLessonModal from '@/domains/lessons/components/modals/RescheduleLessonModal';
import LessonDetailsSheet from '@/domains/lessons/components/sheets/LessonDetailsSheet';
import AcademicLessonGenerationModal from '@/domains/lessons/components/modals/AcademicLessonGenerationModal';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import LessonActionButtons from '@/domains/lessons/components/LessonActionButtons';
import GlassCard from '@/components/common/GlassCard';
import { hasActiveSchedules, getScheduleWarningMessage } from '@/domains/classes/utils/scheduleValidationUtils';
import { ScopeFilter } from '@/domains/lessons/utils/lessonFilters';
import { loadFromStorage, saveToStorage } from '@/lib/storage';

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
type TimeFilterState = {
  scope: ScopeFilter;
  timeWindow: LessonTimeWindow;
};

const DEFAULT_SCOPE: ScopeFilter = 'upcoming';
const DEFAULT_TIME_WINDOW: LessonTimeWindow = 'month';

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
  const { lessons, pastUnstartedLessons, loading, loadLessons, loadPastUnstartedLessons } = useLessonsForClass(classData.id);
  const [statusFilter, setStatusFilter] = useState<LessonFilter>('all');
  
  // Scope filter - default to 'upcoming' to show what matters most
  const storageKey = `class-lessons-time-filter-${classData.id}`;
  const loadStoredTimeFilters = useCallback((): TimeFilterState => {
    const stored = loadFromStorage<Partial<TimeFilterState>>(storageKey);
    return {
      scope: stored?.scope ?? DEFAULT_SCOPE,
      timeWindow: stored?.timeWindow ?? DEFAULT_TIME_WINDOW,
    };
  }, [storageKey]);

  const initialTimeFilters = loadStoredTimeFilters();
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>(initialTimeFilters.scope);
  const [timeWindow, setTimeWindow] = useState<LessonTimeWindow>(initialTimeFilters.timeWindow);
  const [isCreateLessonOpen, setIsCreateLessonOpen] = useState(false);
  const [isAcademicGenerationOpen, setIsAcademicGenerationOpen] = useState(false);
  
  // Review mode for past unstarted lessons
  const [reviewPastUnstarted, setReviewPastUnstarted] = useState(false);
  
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
  const { addLesson, creatingLesson, createMakeup, loadLessonById } = useLessons();

  // Persist time filters per class (session-level)
  useEffect(() => {
    saveToStorage(storageKey, { scope: scopeFilter, timeWindow });
  }, [scopeFilter, timeWindow, storageKey]);

  // Reload stored filters when switching classes
  useEffect(() => {
    const stored = loadStoredTimeFilters();
    setScopeFilter(stored.scope);
    setTimeWindow(stored.timeWindow);
  }, [classData.id, loadStoredTimeFilters]);

  const handleScopeChange = useCallback((value: ScopeFilter) => {
    setScopeFilter(value);
    if (value === 'all') {
      setTimeWindow('all');
    }
  }, []);

  // Build current filter params for API calls
  const currentFilters = useMemo((): ClassLessonFilterParams => ({
    scope: scopeFilter,
    statusName: statusFilter,
    timeWindow,
  }), [scopeFilter, statusFilter, timeWindow]);

  // Compute next lesson from the current lessons list
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
  
  // Load lessons with server-side filtering when filters change
  useEffect(() => {
    // Skip loading during review mode - we show pastUnstartedLessons instead
    if (reviewPastUnstarted) return;
    
    loadLessons(currentFilters);
  }, [loadLessons, currentFilters, reviewPastUnstarted]);

  // Load past unstarted lessons on mount and after mutations for the banner
  useEffect(() => {
    loadPastUnstartedLessons();
  }, [loadPastUnstartedLessons]);
  
  // Wrapper for quick conduct that refreshes with current filters
  const handleQuickConduct = useCallback(async (lessonId: string, notes?: string) => {
    try {
      await originalQuickConduct(lessonId, notes);
      // Refresh with current filters and update past unstarted count
      await Promise.all([
        loadLessons(currentFilters),
        loadPastUnstartedLessons()
      ]);
      onLessonsUpdated?.();
    } catch {
      // Error already handled/toasted by the hook
    }
  }, [originalQuickConduct, loadLessons, loadPastUnstartedLessons, currentFilters, onLessonsUpdated]);

  // Wrapper for quick cancel that refreshes with current filters
  const handleQuickCancel = useCallback(async (lessonId: string, reason: string, makeupData?: MakeupLessonFormData) => {
    try {
      await originalQuickCancel(lessonId, reason, makeupData);
      // Refresh with current filters and update past unstarted count
      await Promise.all([
        loadLessons(currentFilters),
        loadPastUnstartedLessons()
      ]);
      onLessonsUpdated?.();
    } catch {
      // Error already handled/toasted by the hook
    }
  }, [originalQuickCancel, loadLessons, loadPastUnstartedLessons, currentFilters, onLessonsUpdated]);

  // Wrapper for reschedule that refreshes with current filters
  const handleReschedule = useCallback(async (lessonId: string, request: Parameters<typeof originalReschedule>[1]) => {
    try {
      await originalReschedule(lessonId, request);
      // Refresh with current filters and update past unstarted count
      await Promise.all([
        loadLessons(currentFilters),
        loadPastUnstartedLessons()
      ]);
      onLessonsUpdated?.();
    } catch {
      // Error already handled/toasted by the hook
    }
  }, [originalReschedule, loadLessons, loadPastUnstartedLessons, currentFilters, onLessonsUpdated]);
  
  // Handle lesson creation
  const handleCreateLesson = async (lessonData: CreateLessonRequest) => {
    try {
      // Use unwrap() to properly await the thunk and catch errors
      await addLesson(lessonData).unwrap();
      setIsCreateLessonOpen(false);
      // Reload lessons with current filters to show the new one
      await Promise.all([
        loadLessons(currentFilters),
        loadPastUnstartedLessons()
      ]);
      // Notify parent to refresh hero section (lesson context)
      onLessonsUpdated?.();
      toast.success('Lesson created successfully');
    } catch (error: unknown) {
      console.error('Failed to create lesson:', error);
      toast.error((error as Error)?.message || 'Failed to create lesson');
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
      
      // Reload lessons with current filters
      await Promise.all([
        loadLessons(currentFilters),
        loadPastUnstartedLessons()
      ]);
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
    } catch (error: unknown) {
      console.error('Failed to create makeup lesson:', error);
      toast.error((error as Error)?.message || 'Failed to create makeup lesson');
    }
  };

  // Handle academic lesson generation success
  const handleAcademicGenerationSuccess = async (result: { generatedCount: number; skippedCount?: number }) => {
    // Reload lessons with current filters to show the newly generated ones
    await Promise.all([
      loadLessons(currentFilters),
      loadPastUnstartedLessons()
    ]);
    // Notify parent to refresh hero section
    onLessonsUpdated?.();
    setIsAcademicGenerationOpen(false);
    
    const message = `Generated ${result.generatedCount} lessons`;
    const details = result.skippedCount && result.skippedCount > 0 ? ` (${result.skippedCount} skipped)` : '';
    toast.success(message + details);
  };

  // The lessons are already server-side filtered, so we just use them directly
  // In review mode, we show pastUnstartedLessons instead
  const displayedLessons = useMemo(() => {
    if (reviewPastUnstarted) {
      return pastUnstartedLessons;
    }
    return lessons;
  }, [lessons, pastUnstartedLessons, reviewPastUnstarted]);

  // Display lessons in descending order by date for all scopes
  const timelineSortDirection = 'desc';

  // Schedule validation
  const scheduleAvailable = hasActiveSchedules(classData);
  const scheduleWarning = getScheduleWarningMessage(classData);
  
  // Count past unstarted lessons from the server-fetched data
  const pastUnstartedCount = pastUnstartedLessons.length;
  
  // Auto-exit review mode when all past unstarted lessons are resolved
  useEffect(() => {
    if (reviewPastUnstarted && pastUnstartedCount === 0) {
      setReviewPastUnstarted(false);
    }
  }, [reviewPastUnstarted, pastUnstartedCount]);
  
  // Handle review mode activation
  const handleReviewNow = useCallback(() => {
    setReviewPastUnstarted(true);
  }, []);
  
  // Handle exiting review mode
  const handleExitReviewMode = useCallback(() => {
    setReviewPastUnstarted(false);
  }, []);

  // Handler to navigate to teaching mode / edit lesson details
  const handleEditLessonDetails = useCallback((lesson: LessonResponse) => {
    navigate(`/classes/${classData.id}/teach/${lesson.id}`);
  }, [navigate, classData.id]);
  
  // Handler to start teaching (navigate to teaching mode)
  const handleStartTeaching = useCallback((lesson: LessonResponse) => {
    navigate(`/classes/${classData.id}/teach/${lesson.id}`);
  }, [navigate, classData.id]);

  if (loading && lessons.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Empty state message based on filters
  const getEmptyMessage = () => {
    if (reviewPastUnstarted && displayedLessons.length === 0) {
      return "All caught up!";
    }
    if (lessons.length === 0) {
      return "No lessons yet";
    }
    if (scopeFilter === 'upcoming' && displayedLessons.length === 0) {
      return "No upcoming lessons scheduled";
    }
    if (scopeFilter !== 'all' || statusFilter !== 'all') {
      return "No lessons found matching your filters";
    }
    return "No lessons available";
  };

  const getEmptyDescription = () => {
    if (reviewPastUnstarted && displayedLessons.length === 0) {
      return "All lessons have been documented. Great work!";
    }
    if (lessons.length === 0) {
      if (!scheduleAvailable) {
        return "To create lessons for this class, first add a weekly schedule in the Schedule tab, then return here and use Generate from schedule to create lessons for the term.";
      }
      return "Use Generate from schedule to create lessons for the upcoming period, or add a single lesson manually.";
    }
    if (scopeFilter === 'upcoming' && displayedLessons.length === 0) {
      return "Use Generate from schedule to create lessons for the upcoming period, or add a single lesson manually.";
    }
    return "There are no lessons to display with the current filters.";
  };
  
  // Render empty state with improved guidance
  const renderEmptyState = () => {
    const emptyMessage = getEmptyMessage();
    const emptyDescription = getEmptyDescription();
    
    // If all past unstarted lessons are done, show success message
    if (reviewPastUnstarted && displayedLessons.length === 0) {
      return (
        <GlassCard className="p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{emptyMessage}</h3>
          <p className="text-white/60 text-sm mb-4">{emptyDescription}</p>
          <Button
            variant="outline"
            onClick={handleExitReviewMode}
            className="text-white border-white/20 hover:bg-white/10"
          >
            Return to lessons
          </Button>
        </GlassCard>
      );
    }
    
    // If no lessons and no schedule, guide to schedule tab
    if (lessons.length === 0 && !scheduleAvailable) {
      return (
        <GlassCard className="p-8 text-center">
          <Calendar className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">{emptyMessage}</h3>
          <p className="text-white/60 text-sm mb-4 max-w-md mx-auto">{emptyDescription}</p>
          {onScheduleTabClick && (
            <Button
              onClick={onScheduleTabClick}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Go to Schedule tab
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </GlassCard>
      );
    }
    
    // Default empty state - handled by LessonTimeline
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Review Mode Banner - clear attention indicator, this should be the primary visual focus */}
      {reviewPastUnstarted && (
        <div className="flex items-center gap-3 bg-amber-500/20 border border-amber-400/40 rounded-lg px-4 py-3 shadow-sm shadow-amber-500/10">
          <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
          <span className="text-sm text-amber-100 flex-1">
            <span className="font-semibold">Reviewing {pastUnstartedCount} {pastUnstartedCount === 1 ? 'lesson' : 'lessons'} needing documentation.</span>
            <span className="ml-1 text-amber-200/70">
              Document each lesson by clicking "Document Lesson" to mark attendance and status.
            </span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExitReviewMode}
            className="text-amber-100 hover:text-amber-50 hover:bg-amber-500/25 flex-shrink-0 h-7 px-3 text-xs font-medium"
          >
            Exit review
          </Button>
        </div>
      )}

      {/* Past Unstarted Lessons Warning Banner - primary attention element on the page */}
      {!reviewPastUnstarted && pastUnstartedCount > 0 && (
        <div className="flex items-center gap-3 bg-amber-500/15 border border-amber-400/35 rounded-lg px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
          <span className="text-sm text-amber-100 flex-1">
            <span className="font-semibold">{pastUnstartedCount} {pastUnstartedCount === 1 ? 'lesson needs' : 'lessons need'} documentation.</span>
            <span className="ml-1 text-amber-200/70">
              These past lessons were never marked as conducted, cancelled, or no-show.
            </span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReviewNow}
            className="text-amber-200 hover:text-amber-100 hover:bg-amber-500/25 flex-shrink-0 h-7 px-3 text-xs font-medium"
          >
            Review now
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      )}

      {/* Schedule Warning Banner - informational, lower priority than documentation warnings */}
      {!scheduleAvailable && scheduleWarning && (
        <div className="flex items-center gap-3 bg-slate-500/10 border border-slate-500/20 rounded-lg px-4 py-2.5">
          <AlertCircle className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <span className="text-sm text-slate-300">{scheduleWarning}</span>
        </div>
      )}

      {/* Enhanced Filters and Actions - hide when in review mode */}
      {!reviewPastUnstarted && (
        <div className="flex flex-wrap items-end justify-between gap-3">
          {/* Left: Enhanced Filters */}
          <LessonsEnhancedFilters
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            scopeFilter={scopeFilter}
            onScopeChange={handleScopeChange}
            timeWindow={timeWindow}
            onTimeWindowChange={setTimeWindow}
            compact={true}
          />

          {/* Right: Action Buttons */}
          <LessonActionButtons
            onCreateLesson={() => setIsCreateLessonOpen(true)}
            onGenerateLessons={() => setIsAcademicGenerationOpen(true)}
            generateDisabled={!scheduleAvailable}
            disabledTooltip={scheduleWarning || undefined}
            hasLessons={lessons.length > 0}
          />
        </div>
      )}

      {/* Custom Empty State or Timeline View */}
      {displayedLessons.length === 0 && (reviewPastUnstarted || (lessons.length === 0 && !scheduleAvailable)) ? (
        renderEmptyState()
      ) : (
        <LessonTimeline 
          lessons={displayedLessons}
          loading={loading}
          groupByMonth={true}
          showActions={true}
          sortDirection={timelineSortDirection}
          nextLesson={nextLesson}
          showTeacherName={false} // Teacher is already shown in the class header
          onViewLesson={handleLessonDetails}
          onStartTeaching={handleStartTeaching}
          onQuickConduct={openConductModal}
          onQuickCancel={openCancelModal}
          onQuickReschedule={openRescheduleModal}
          emptyMessage={getEmptyMessage()}
          emptyDescription={getEmptyDescription()}
        />
      )}
      
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
      
      <RescheduleLessonModal
        lesson={modals.reschedule.lesson}
        open={modals.reschedule.open}
        onOpenChange={closeRescheduleModal}
        onConfirm={handleReschedule}
        loading={reschedulingLesson}
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
        onReschedule={openRescheduleModal}
        onEditLessonDetails={handleEditLessonDetails}
      />
    </div>
  );
};

export default ClassLessonsTab;

