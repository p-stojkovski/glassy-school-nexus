import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ClassBasicInfoResponse } from '@/types/api/class';
import { LessonResponse, LessonStatusName, CreateLessonRequest, MakeupLessonFormData } from '@/types/api/lesson';
import { useLessonsForClass, useLessons } from '@/domains/lessons/hooks/useLessons';
import { useQuickLessonActions } from '@/domains/lessons/hooks/useQuickLessonActions';
import LessonCalendar from '@/domains/lessons/components/LessonCalendar';
import CreateLessonSidebar from '@/domains/lessons/components/modals/CreateLessonSidebar';
import QuickConductLessonModal from '@/domains/lessons/components/modals/QuickConductLessonModal';
import QuickCancelLessonModal from '@/domains/lessons/components/modals/QuickCancelLessonModal';
import LessonDetailsSheet from '@/domains/lessons/components/sheets/LessonDetailsSheet';
import AcademicLessonGenerationModal from '@/domains/lessons/components/modals/AcademicLessonGenerationModal';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import LessonFiltersBar from '@/domains/lessons/components/LessonFiltersBar';
import LessonActionButtons from '@/domains/lessons/components/LessonActionButtons';
import { hasActiveSchedules, getScheduleWarningMessage } from '@/domains/classes/utils/scheduleValidationUtils';

interface ClassLessonsTabProps {
  classData: ClassBasicInfoResponse;
  onScheduleTabClick?: () => void;
  /** Callback when lessons are created/updated - used to refresh hero section */
  onLessonsUpdated?: () => void;
}

type LessonFilter = 'all' | LessonStatusName;
type TeacherFilter = 'all' | string; // 'all' or teacher ID

const ClassLessonsTab: React.FC<ClassLessonsTabProps> = ({
  classData,
  onScheduleTabClick,
  onLessonsUpdated,
}) => {
  const navigate = useNavigate();
  const { lessons, loading, loadLessons, summary } = useLessonsForClass(classData.id);
  const [statusFilter, setStatusFilter] = useState<LessonFilter>('all');
  const [teacherFilter, setTeacherFilter] = useState<TeacherFilter>('all');
  const [isCreateLessonOpen, setIsCreateLessonOpen] = useState(false);
  const [isAcademicGenerationOpen, setIsAcademicGenerationOpen] = useState(false);
  const [isLessonDetailsOpen, setIsLessonDetailsOpen] = useState(false);
  const [selectedLessonIdForDetails, setSelectedLessonIdForDetails] = useState<string | null>(null);
  const [makeupLesson, setMakeupLesson] = useState<LessonResponse | null>(null);
  
  // Get the current lesson data from Redux store based on selectedLessonIdForDetails
  const selectedLessonForDetails = useMemo(() => {
    if (!selectedLessonIdForDetails) return null;
    return lessons.find(lesson => lesson.id === selectedLessonIdForDetails) || null;
  }, [selectedLessonIdForDetails, lessons]);
  
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
    setSelectedLessonIdForDetails(lesson.id);
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
    setIsLessonDetailsOpen(true);
  };

  // Handle viewing makeup lesson (opens that lesson's details)
  const handleViewMakeupLesson = async (lessonId: string) => {
    const makeupLesson = lessons.find(l => l.id === lessonId);
    if (makeupLesson) {
      setSelectedLessonIdForDetails(makeupLesson.id);
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
      if (selectedLessonIdForDetails === originalLessonId) {
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

  // Filter lessons based on status and teacher filters
  const filteredLessons = lessons.filter(lesson => {
    const statusMatch = statusFilter === 'all' || lesson.statusName === statusFilter;
    const teacherMatch = teacherFilter === 'all' || lesson.teacherId === teacherFilter;
    return statusMatch && teacherMatch;
  });
  
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

  if (loading && lessons.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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

      {/* Compact Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Filter (only status, simplified) */}
        <div className="flex items-center gap-2">
          <LessonFiltersBar
            lessons={lessons}
            statusFilter={statusFilter}
            teacherFilter={teacherFilter}
            onStatusChange={setStatusFilter}
            onTeacherChange={setTeacherFilter}
            compact={true}
          />
          {(statusFilter !== 'all' || teacherFilter !== 'all') && (
            <span className="text-white/50 text-sm">
              {filteredLessons.length} of {lessons.length}
            </span>
          )}
        </div>

        {/* Right: Action Buttons */}
        <LessonActionButtons
          onCreateLesson={() => setIsCreateLessonOpen(true)}
          onGenerateLessons={() => setIsAcademicGenerationOpen(true)}
          generateDisabled={!scheduleAvailable}
          disabledTooltip={scheduleWarning || undefined}
          hasLessons={true}
        />
      </div>

      {/* Calendar View - Always show calendar regardless of lessons */}
      <LessonCalendar 
        lessons={filteredLessons}
        onLessonClick={handleLessonDetails}
        onConductLesson={openConductModal}
        onCancelLesson={openCancelModal}
        onLessonsUpdated={loadLessons}
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
        onOpenChange={setIsLessonDetailsOpen}
        onConduct={openConductModal}
        onCancel={openCancelModal}
        onEditLessonDetails={handleEditLessonDetails}
      />
    </div>
  );
};

export default ClassLessonsTab;

