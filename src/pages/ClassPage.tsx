import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Users, BookmarkCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import ClassPageHeader from '@/domains/classes/components/unified/ClassPageHeader';
import ClassQuickStats from '@/domains/classes/components/unified/ClassQuickStats';
import ClassLessonsTab from '@/domains/classes/components/detail/ClassLessonsTab';
import ClassInfoTab from '@/domains/classes/components/tabs/ClassInfoTab';
import ClassScheduleTab from '@/domains/classes/components/tabs/ClassScheduleTab';
import ClassStudentsTab from '@/domains/classes/components/tabs/ClassStudentsTab';
import { useClassPage } from '@/domains/classes/hooks/useClassPage';

const ClassPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  const {
    classData,
    activeTab,
    loading,
    error,
    setActiveTab,
    refetchClassData,
    registerTabUnsavedChanges,
    canSwitchTab,
    hasAnyUnsavedChanges,
  } = useClassPage(id || '');

  // Validate ID
  useEffect(() => {
    if (!id) {
      navigate('/classes');
    }
  }, [id, navigate]);

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
    const tabs = ['info', 'schedule', 'students', 'lessons'] as const;
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
      />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="bg-white/10 border-white/20">
          <TabsTrigger
            value="info"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <Users className="w-4 h-4 mr-2" />
            Students
          </TabsTrigger>
          <TabsTrigger
            value="lessons"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <BookmarkCheck className="w-4 h-4 mr-2" />
            Lessons
          </TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="mt-6">
          <ClassInfoTab
            classData={classData}
            onUpdate={refetchClassData}
            onUnsavedChangesChange={(hasChanges) =>
              registerTabUnsavedChanges('info', hasChanges)
            }
          />
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="mt-6">
          <ClassScheduleTab
            classData={classData}
            onUpdate={refetchClassData}
            onUnsavedChangesChange={(hasChanges) =>
              registerTabUnsavedChanges('schedule', hasChanges)
            }
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

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="mt-6">
          <ClassLessonsTab classData={classData} />
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
    </div>
  );
};

export default ClassPage;
