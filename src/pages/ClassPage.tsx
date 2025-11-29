import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Calendar, Users, BookmarkCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import ClassPageHeader from '@/domains/classes/components/unified/ClassPageHeader';
import CreateClassHeader from '@/domains/classes/components/unified/CreateClassHeader';
import { CreateClassSheet } from '@/domains/classes/components/dialogs/CreateClassSheet';
import ClassLessonsTab from '@/domains/classes/components/detail/ClassLessonsTab';
import ClassInfoTab from '@/domains/classes/components/tabs/ClassInfoTab';
import ClassScheduleTab from '@/domains/classes/components/tabs/ClassScheduleTab';
import ClassStudentsTab from '@/domains/classes/components/tabs/ClassStudentsTab';
import QuickConductLessonModal from '@/domains/lessons/components/modals/QuickConductLessonModal';
import { useClassPage } from '@/domains/classes/hooks/useClassPage';
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

  // Quick lesson actions for the dashboard widget
  const {
    modals: quickActionModals,
    openConductModal,
    closeConductModal,
    handleQuickConduct,
    conductingLesson,
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
      if (canSwitchTab(newTab as any)) {
        setActiveTab(newTab as any);
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
    <div className="space-y-6">
      {/* Header */}
      <ClassPageHeader
        classData={classData}
        onBack={handleBack}
        onUpdate={memoizedRefetchClassData}
      />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="bg-white/10 border-white/20">
          <TabsTrigger
            value="lessons"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <BookmarkCheck className="w-4 h-4 mr-2" />
            Lessons
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <Users className="w-4 h-4 mr-2" />
            Students
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            className="data-[state=active]:bg-white/20 text-white relative"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
            {tabsWithUnsavedChanges?.has('schedule') && (
              <span className="ml-1.5 inline-block w-2 h-2 bg-orange-500 rounded-full align-middle" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="info"
            className="data-[state=active]:bg-white/20 text-white relative"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Overview
            {tabsWithUnsavedChanges?.has('info') && (
              <span className="ml-1.5 inline-block w-2 h-2 bg-orange-500 rounded-full align-middle" />
            )}
          </TabsTrigger>
        </TabsList>

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="mt-6">
          <ClassLessonsTab 
            classData={classData}
            onScheduleTabClick={() => handleTabChange('schedule')}
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

      {/* Quick Conduct Lesson Modal (from Dashboard Widget) */}
      <QuickConductLessonModal
        lesson={quickActionModals.conduct.lesson}
        open={quickActionModals.conduct.open}
        onOpenChange={(open) => !open && closeConductModal()}
        onConfirm={handleQuickConduct}
        loading={conductingLesson}
      />
    </div>
  );
};

export default ClassPage;
