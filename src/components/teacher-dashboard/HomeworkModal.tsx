import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Clock, AlertCircle, BookOpen, FileText, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { toast } from '@/hooks/use-toast';
import { LessonResponse } from '@/types/api/lesson';
import HomeworkAssignmentForm from './HomeworkAssignmentForm';
import PreviousHomeworkViewer from './PreviousHomeworkViewer';

interface HomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: LessonResponse;
  initialMode?: 'check' | 'assign'; // Optional initial tab mode
}

const HomeworkModal: React.FC<HomeworkModalProps> = ({
  isOpen,
  onClose,
  lesson,
  initialMode = 'check'
}) => {
  const dispatch = useAppDispatch();
  
  // Redux state
  const currentAssignment = useAppSelector(selectCurrentHomeworkAssignment);
  const previousHomework = useAppSelector(selectCurrentPreviousHomework);
  const loadingStates = useAppSelector(selectHomeworkLoadingStates);
  const error = useAppSelector(selectHomeworkError);
  
  // Local state for tab management
  const [activeTab, setActiveTab] = useState<'check' | 'assign'>(initialMode);
  
  // Loading state
  const isLoading = loadingStates.fetchingWithPrevious || loadingStates.fetchingAssignment || loadingStates.fetchingPreviousHomework;
  
  // Fetch homework data when modal opens
  useEffect(() => {
    if (isOpen && lesson?.id) {
      // Set lesson context in Redux
      dispatch(setCurrentLessonContext(lesson.id));
      
      // Fetch both current assignment and previous homework
      dispatch(fetchHomeworkWithPrevious(lesson.id));
    }
  }, [isOpen, lesson?.id, dispatch]);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error loading homework data',
        description: error,
        variant: 'destructive',
      });
      
      // Clear error after showing
      dispatch(clearError());
    }
  }, [error, dispatch]);
  
  // Reset to initial mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
    }
  }, [isOpen, initialMode]);
  
  // Handle modal close
  const handleClose = () => {
    dispatch(clearError());
    onClose();
  };
  const formatLessonDateTime = (lesson: LessonResponse) => {
    const date = new Date(lesson.scheduledDate);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric' 
    });
    return `${dayName}, ${dateStr} • ${lesson.startTime} - ${lesson.endTime}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 via-orange-900/90 to-amber-900/95 backdrop-blur-xl border-white/20 text-white max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-orange-400" />
            Homework Management
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Check homework completion and assign new assignments
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col h-full max-h-[80vh]"
        >
          {/* Lesson Details */}
          <div className="bg-white/5 p-4 rounded-lg border border-white/10 mb-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-white">{lesson.className}</h4>
                <Badge className="bg-orange-500 hover:bg-orange-500 text-white">
                  {lesson.statusName}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Clock className="w-4 h-4" />
                <span>{formatLessonDateTime(lesson)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-white/70">
                <BookOpen className="w-4 h-4" />
                <span>{lesson.subjectNameSnapshot || lesson.subjectName}</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white/5 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('check')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all duration-200 ${
                activeTab === 'check'
                  ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="font-medium">Check Homework</span>
              {previousHomework?.hasHomework && (
                <div className="w-2 h-2 bg-green-400 rounded-full" />
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('assign')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all duration-200 ${
                activeTab === 'assign'
                  ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span className="font-medium">Assign Homework</span>
              {currentAssignment && (
                <div className="w-2 h-2 bg-orange-400 rounded-full" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
                <span className="ml-3 text-white/70">Loading homework data...</span>
              </div>
            ) : (
              <div className="min-h-[400px]">
                {activeTab === 'check' ? (
                  <CheckHomeworkTab
                    previousHomework={previousHomework}
                    lesson={lesson}
                  />
                ) : (
                  <AssignHomeworkTab
                    currentAssignment={currentAssignment}
                    lesson={lesson}
                    onClose={handleClose}
                  />
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-white/10 mt-6">
            <Button
              onClick={handleClose}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"
            >
              Close
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

// Temporary placeholder components for tab content
// These will be replaced with actual components in subsequent tasks

interface CheckHomeworkTabProps {
  previousHomework: any;
  lesson: LessonResponse;
}

const CheckHomeworkTab: React.FC<CheckHomeworkTabProps> = ({ previousHomework, lesson }) => {
  const handleViewStudentCompletion = () => {
    // TODO: Navigate to student completion view for this homework
    console.log('Navigate to student completion view for lesson:', lesson.id);
    // This could close the modal and open a different view, or open another modal
  };

  return (
    <PreviousHomeworkViewer
      previousHomework={previousHomework}
      lesson={lesson}
      onViewStudentCompletion={handleViewStudentCompletion}
    />
  );
};

interface AssignHomeworkTabProps {
  currentAssignment: any;
  lesson: LessonResponse;
  onClose: () => void;
}

const AssignHomeworkTab: React.FC<AssignHomeworkTabProps> = ({ currentAssignment, lesson, onClose }) => {
  const handleFormSuccess = (assignment: any) => {
    toast({
      title: currentAssignment ? 'Assignment Updated!' : 'Assignment Created!',
      description: `Homework "${assignment.title}" has been ${currentAssignment ? 'updated' : 'created'} successfully.`,
      variant: 'default'
    });
    
    // Optionally close modal after successful creation/update
    // onClose();
  };
  
  const handleFormCancel = () => {
    // Could add confirmation dialog here if there are unsaved changes
    // For now, just do nothing - user can close modal manually
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-purple-500/10 p-6 rounded-lg border border-purple-500/30">
        <h3 className="text-lg font-semibold text-purple-300 mb-6">
          {currentAssignment ? 'Edit Homework Assignment' : 'Create New Homework Assignment'}
        </h3>
        
        <HomeworkAssignmentForm
          lesson={lesson}
          currentAssignment={currentAssignment}
          isEditing={!!currentAssignment}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          className=""
        />
      </div>
    </div>
  );
};

export default HomeworkModal;
