import React, { useEffect, useState } from 'react';
import { FileText, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LessonResponse } from '@/types/api/lesson';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchHomeworkWithPrevious,
  selectCurrentHomeworkAssignment,
  selectCurrentPreviousHomework,
  selectHomeworkLoadingStates,
  selectHomeworkError,
  clearError,
  setCurrentLessonContext
} from '@/store/slices/homeworkSlice';

import TabButton from './TabButton';
import CompactPreviousHomeworkViewer from './CompactPreviousHomeworkViewer';
import CompactHomeworkAssignmentForm from './CompactHomeworkAssignmentForm';

type HomeworkTab = 'check' | 'assign';

interface HomeworkSidebarProps {
  lesson: LessonResponse;
  activeTab: HomeworkTab;
  onTabChange: (tab: HomeworkTab) => void;
  className?: string;
}

const HomeworkSidebar: React.FC<HomeworkSidebarProps> = ({
  lesson,
  activeTab,
  onTabChange,
  className = ''
}) => {
  const dispatch = useAppDispatch();
  
  // Redux state
  const currentAssignment = useAppSelector(selectCurrentHomeworkAssignment);
  const previousHomework = useAppSelector(selectCurrentPreviousHomework);
  const loadingStates = useAppSelector(selectHomeworkLoadingStates);
  const error = useAppSelector(selectHomeworkError);
  
  // Loading state
  const isLoading = loadingStates.fetchingWithPrevious || loadingStates.fetchingAssignment || loadingStates.fetchingPreviousHomework;
  
  // Fetch homework data when component mounts or lesson changes
  useEffect(() => {
    if (lesson?.id) {
      // Set lesson context in Redux
      dispatch(setCurrentLessonContext(lesson.id));
      
      // Fetch both current assignment and previous homework
      dispatch(fetchHomeworkWithPrevious(lesson.id));
    }
  }, [lesson?.id, dispatch]);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      // Clear error after a delay to not spam the user
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleViewStudentCompletion = () => {
    // TODO: Navigate to student completion view for this homework
    console.log('Navigate to student completion view for lesson:', lesson.id);
    // This could open another modal or navigate to a dedicated view
  };

  const handleAssignmentSuccess = (assignment: any) => {
    console.log('Assignment created/updated successfully:', assignment);
    // Optionally switch to check tab to review what was just created
    // onTabChange('check');
  };

  return (
    <div className={`flex flex-col h-full w-full max-w-full overflow-hidden ${className}`}>
      {/* Header */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-4 w-full max-w-full overflow-hidden">
        <CardHeader className="p-3">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2 truncate">
            <ClipboardList className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Homework Management</span>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Tab Selector */}
      <div className="flex bg-white/5 rounded-lg p-1 mb-4">
        <TabButton
          active={activeTab === 'check'}
          onClick={() => onTabChange('check')}
          icon={FileText}
          label="Check"
          className="relative"
        >
          {/* Indicator for previous homework */}
          {previousHomework?.hasHomework && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full" />
          )}
        </TabButton>
        
        <TabButton
          active={activeTab === 'assign'}
          onClick={() => onTabChange('assign')}
          icon={ClipboardList}
          label="Assign"
          className="relative"
        >
          {/* Indicator for existing assignment */}
          {currentAssignment && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full" />
          )}
        </TabButton>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}
        
        {isLoading && !previousHomework && !currentAssignment ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse space-y-4 w-full">
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
              <div className="h-4 bg-white/10 rounded w-1/2"></div>
              <div className="h-24 bg-white/10 rounded w-full"></div>
            </div>
          </div>
        ) : activeTab === 'check' ? (
          <CompactPreviousHomeworkViewer
            previousHomework={previousHomework}
            lesson={lesson}
            onViewStudentCompletion={handleViewStudentCompletion}
          />
        ) : (
          <CompactHomeworkAssignmentForm
            lesson={lesson}
            currentAssignment={currentAssignment}
            isEditing={!!currentAssignment}
            onSuccess={handleAssignmentSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default HomeworkSidebar;