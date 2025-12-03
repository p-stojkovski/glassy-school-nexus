import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import ClassPageHeader from '@/domains/classes/components/unified/ClassPageHeader';
import CreateClassHeader from '@/domains/classes/components/unified/CreateClassHeader';
import { CreateClassSheet } from '@/domains/classes/components/dialogs/CreateClassSheet';
import ClassLessonsTab from '@/domains/classes/components/detail/ClassLessonsTab';
import ClassInfoTab from '@/domains/classes/components/tabs/ClassInfoTab';
import { LessonResponse } from '@/types/api/lesson';
import ClassScheduleTab from '@/domains/classes/components/tabs/ClassScheduleTab';
import ClassStudentsTab from '@/domains/classes/components/tabs/ClassStudentsTab';
import QuickConductLessonModal from '@/domains/lessons/components/modals/QuickConductLessonModal';
import QuickCancelLessonModal from '@/domains/lessons/components/modals/QuickCancelLessonModal';
import RescheduleLessonModal from '@/domains/lessons/components/modals/RescheduleLessonModal';
import LessonDetailsSheet from '@/domains/lessons/components/sheets/LessonDetailsSheet';
import { useClassPage } from '@/domains/classes/hooks/useClassPage';
import { useClassLessonContext } from '@/domains/classes/hooks/useClassLessonContext';
import { useQuickLessonActions } from '@/domains/lessons/hooks/useQuickLessonActions';

const ClassPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine if this is create mode (either via route param or pathname)
  const isCreateMode = id === 'new' || location.pathname.endsWith('/classes/new');
  
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [showCreateSheet, setShowCreateSheet] = useState(false); // Start closed, open via effect
  const [isLessonDetailsOpen, setIsLessonDetailsOpen] = useState(false);
  const [selectedLessonForDetails, setSelectedLessonForDetails] = useState<LessonResponse | null>(null);

  // Open create sheet after mount in create mode
  useEffect(() => {
    if (isCreateMode) {
      setShowCreateSheet(true);
    }
  }, [isCreateMode]);

  // Only use the hook if we have a valid ID (not in create mode)
  const {
    classData,
    activeTab,
    loading,
    error,
    setActiveTab,
    refetchClassData,
    registerTabUnsavedChanges,
    tabsWithUnsavedChanges,
    canSwitchTab,
    hasAnyUnsavedChanges,
    // Archived schedules state
    archivedSchedules,
    loadingArchived,
    archivedSchedulesExpanded,
    // Archived schedules actions
    toggleArchivedSchedules,
    refreshArchivedSchedules,
  } = useClassPage(isCreateMode ? '' : (id || ''));

  // Lesson context for hero section CTA
  const lessonContext = useClassLessonContext(isCreateMode ? null : (id || null));

  // Quick lesson actions for the dashboard widget
  const {
    modals: quickActionModals,
    openConductModal,
    closeConductModal,
    openCancelModal,
    closeCancelModal,
    openRescheduleModal,
    closeRescheduleModal,
    handleQuickConduct,
    handleQuickCancel,
    handleReschedule,
    conductingLesson,
    cancellingLesson,
    reschedulingLesson,
  } = useQuickLessonActions();

  // Memoize refetchClassData to prevent tab prop changes triggering re-renders
  const memoizedRefetchClassData = useCallback(() => refetchClassData(), [refetchClassData]);

  const handleInfoUnsavedChanges = useCallback(
    (hasChanges: boolean) => registerTabUnsavedChanges('info', hasChanges),
    [registerTabUnsavedChanges]
  );

  const handleScheduleUnsavedChanges = useCallback(
    (hasChanges: boolean) => registerTabUnsavedChanges('schedule', hasChanges),
    [registerTabUnsavedChanges]
  );

  // Handle successful class creation
  const handleClassCreated = useCallback((newClassId: string) => {
    // Navigate to the new class page
    navigate(`/classes/${newClassId}`, { replace: true });
  }, [navigate]);

  // Validate ID - but allow create mode (where id is undefined)
  useEffect(() => {
    if (!id && !isCreateMode) {
      navigate('/classes');
    }
  }, [id, isCreateMode, navigate]);

  const handleBack = () => {
    if (hasAnyUnsavedChanges()) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/classes');
      }
    } else {
      navigate('/classes');
    }
  };

  const handleTabChange = (newTab: string) => {
    const tabs = ['lessons', 'students', 'schedule', 'info'] as const;
    if ((tabs as readonly string[]).includes(newTab)) {
      // Check if we can switch tabs
      if (canSwitchTab(newTab as typeof tabs[number])) {
        setActiveTab(newTab as typeof tabs[number]);
      } else {
        // Show unsaved changes dialog
        setPendingTab(newTab);
        setShowUnsavedChangesDialog(true);
      }
    }
  };

  const handleDiscardChanges = () => {
    setShowUnsavedChangesDialog(false);
    if (pendingTab) {
      setActiveTab(pendingTab as any);
      setPendingTab(null);
    }
  };

  const handleStayOnTab = () => {
    setShowUnsavedChangesDialog(false);
    setPendingTab(null);
  };

  // Handle closing lesson details sheet from hero section
  const handleHeroLessonDetailsClose = useCallback((open: boolean) => {
    if (!open) {
      setIsLessonDetailsOpen(false);
      setSelectedLessonForDetails(null);
    }
  }, []);

  // Handle navigating to teaching mode from hero section
  const handleHeroStartTeaching = useCallback((lesson: LessonResponse) => {
    navigate(`/classes/${id}/teach/${lesson.id}`);
  }, [navigate, id]);

  // Handle navigating to teaching mode from hero lesson details
  const handleHeroEditLessonDetails = useCallback((lesson: LessonResponse) => {
    setIsLessonDetailsOpen(false);
    setSelectedLessonForDetails(null);
    navigate(`/classes/${id}/teach/${lesson.id}`);
  }, [navigate, id]);

  // Handle conduct lesson from hero section
  const handleHeroConductLesson = useCallback((lesson: LessonResponse) => {
    openConductModal(lesson);
  }, [openConductModal]);

  // Handle cancel lesson from hero section
  const handleHeroCancelLesson = useCallback((lesson: LessonResponse) => {
    openCancelModal(lesson);
  }, [openCancelModal]);

  // Wrapped quick conduct handler that also refreshes lesson context
  const handleQuickConductWithRefresh = useCallback(async (lessonId: string, notes?: string) => {
    await handleQuickConduct(lessonId, notes);
    lessonContext.refreshLessons();
    refetchClassData();
  }, [handleQuickConduct, lessonContext, refetchClassData]);

  // Wrapped quick cancel handler that also refreshes lesson context
  const handleQuickCancelWithRefresh = useCallback(async (lessonId: string, reason: string, makeupData?: any) => {
    await handleQuickCancel(lessonId, reason, makeupData);
    lessonContext.refreshLessons();
    refetchClassData();
  }, [handleQuickCancel, lessonContext, refetchClassData]);

  // Wrapped reschedule handler that also refreshes lesson context
  const handleRescheduleWithRefresh = useCallback(async (lessonId: string, request: any) => {
    await handleReschedule(lessonId, request);
    lessonContext.refreshLessons();
    refetchClassData();
  }, [handleReschedule, lessonContext, refetchClassData]);

  // Handle reschedule lesson from hero section or lesson details
  const handleHeroRescheduleLesson = useCallback((lesson: LessonResponse) => {
    openRescheduleModal(lesson);
  }, [openRescheduleModal]);

  // Warn before browser refresh if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasAnyUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasAnyUnsavedChanges]);

  // Create mode - show the create sheet
  if (isCreateMode) {
    return (
      <div className="space-y-6">
        <CreateClassHeader onOpenCreateSheet={() => setShowCreateSheet(true)} />
        
        {/* Placeholder content when in create mode */}
        <div className="text-center py-16">
          <div className="text-white/50 text-lg mb-4">
            Complete the form to create your new class
          </div>
        </div>

        {/* Create Class Sheet */}
        <CreateClassSheet
          open={showCreateSheet}
          onOpenChange={(open) => {
            if (!open) {
              // If user closes the sheet without creating, go back to classes list
              navigate('/classes');
            }
            setShowCreateSheet(open);
          }}
          onSuccess={handleClassCreated}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="space-y-6">
        <button
          onClick={handleBack}
          className="text-white/80 hover:text-white transition-colors mb-4"
        >
          ← Back to Classes
        </button>
        <ErrorMessage
          title="Error Loading Class"
          message={error || 'Class not found'}
          onRetry={() => window.location.reload()}
          showRetry
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Unified Header (includes class info + progress + next lesson) */}
      <ClassPageHeader
        classData={classData}
        onUpdate={memoizedRefetchClassData}
        lessonContext={lessonContext}
        onStartTeaching={handleHeroStartTeaching}
        onConductLesson={handleHeroConductLesson}
        onCancelLesson={handleHeroCancelLesson}
      />

      {/* Main Tabs - Minimal underline style */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="bg-transparent border-b border-white/10 rounded-none p-0 h-auto gap-1">
          <TabsTrigger
            value="lessons"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:shadow-none text-white/70 data-[state=active]:text-white rounded-none px-4 py-2 font-medium"
          >
            Lessons
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:shadow-none text-white/70 data-[state=active]:text-white rounded-none px-4 py-2 font-medium"
          >
            Students
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:shadow-none text-white/70 data-[state=active]:text-white rounded-none px-4 py-2 font-medium relative"
          >
            Schedule
            {tabsWithUnsavedChanges?.has('schedule') && (
              <span className="ml-1.5 inline-block w-1.5 h-1.5 bg-orange-500 rounded-full align-middle" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="info"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:shadow-none text-white/70 data-[state=active]:text-white rounded-none px-4 py-2 font-medium relative"
          >
            Details
            {tabsWithUnsavedChanges?.has('info') && (
              <span className="ml-1.5 inline-block w-1.5 h-1.5 bg-orange-500 rounded-full align-middle" />
            )}
          </TabsTrigger>
        </TabsList>

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="mt-6">
          <ClassLessonsTab 
            classData={classData}
            onScheduleTabClick={() => handleTabChange('schedule')}
            onLessonsUpdated={lessonContext.refreshLessons}
            externalLessonDetailsOpen={isLessonDetailsOpen}
            externalSelectedLesson={selectedLessonForDetails}
            onExternalLessonDetailsChange={setIsLessonDetailsOpen}
            onExternalSelectedLessonChange={setSelectedLessonForDetails}
          />
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="mt-6">
          <ClassStudentsTab
            mode="view"
            classData={classData}
            onRefetchClassData={refetchClassData}
          />
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="mt-6">
          <ClassScheduleTab
            classData={classData}
            onUpdate={memoizedRefetchClassData}
            onUnsavedChangesChange={handleScheduleUnsavedChanges}
            archivedSchedules={archivedSchedules}
            loadingArchived={loadingArchived}
            archivedSchedulesExpanded={archivedSchedulesExpanded}
            onToggleArchivedSchedules={toggleArchivedSchedules}
            onRefreshArchivedSchedules={refreshArchivedSchedules}
          />
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info" className="mt-6">
          <ClassInfoTab
            classData={classData}
            onUpdate={memoizedRefetchClassData}
            onUnsavedChangesChange={handleInfoUnsavedChanges}
          />
        </TabsContent>
      </Tabs>

      {/* Unsaved Changes Dialog */}
      <ConfirmationDialog
        isOpen={showUnsavedChangesDialog}
        onClose={handleStayOnTab}
        onConfirm={handleDiscardChanges}
        title="Unsaved Changes"
        description="You have unsaved changes in the current tab. Are you sure you want to discard them?"
        confirmText="Discard Changes"
        cancelText="Stay on Tab"
        variant="danger"
      />

      {/* Quick Conduct Lesson Modal (from Hero Section actions) */}
      <QuickConductLessonModal
        lesson={quickActionModals.conduct.lesson}
        open={quickActionModals.conduct.open}
        onOpenChange={(open) => !open && closeConductModal()}
        onConfirm={handleQuickConductWithRefresh}
        loading={conductingLesson}
      />

      {/* Lesson Details Sheet - rendered at page level for hero section "View Next Lesson" */}
      <LessonDetailsSheet
        lesson={selectedLessonForDetails}
        open={isLessonDetailsOpen}
        onOpenChange={handleHeroLessonDetailsClose}
        onConduct={openConductModal}
        onCancel={openCancelModal}
        onReschedule={handleHeroRescheduleLesson}
        onEditLessonDetails={handleHeroEditLessonDetails}
      />

      {/* Quick Cancel Lesson Modal */}
      <QuickCancelLessonModal
        lesson={quickActionModals.cancel.lesson}
        open={quickActionModals.cancel.open}
        onOpenChange={(open) => !open && closeCancelModal()}
        onConfirm={handleQuickCancelWithRefresh}
        loading={cancellingLesson}
      />

      {/* Reschedule Lesson Modal */}
      <RescheduleLessonModal
        lesson={quickActionModals.reschedule.lesson}
        open={quickActionModals.reschedule.open}
        onOpenChange={(open) => !open && closeRescheduleModal()}
        onConfirm={handleRescheduleWithRefresh}
        loading={reschedulingLesson}
      />
    </div>
  );
};

export default ClassPage;
