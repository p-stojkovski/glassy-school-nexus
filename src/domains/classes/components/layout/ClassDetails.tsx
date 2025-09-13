import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Class } from '@/domains/classes/classesSlice';
import { ClassResponse } from '@/types/api/class';
import { LessonResponse } from '@/types/api/lesson';
import ClassOverviewTab from '../detail/ClassOverviewTab';
import ClassLessonsTab from '../detail/ClassLessonsTab';
import { LessonDetailModal } from '@/domains/lessons/components';
import { useQuickLessonActions } from '@/domains/lessons/hooks/useQuickLessonActions';
import { useLessons } from '@/domains/lessons/hooks/useLessons';

interface ClassDetailsProps {
  classItem: Class | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (classItem: Class) => void;
  onDelete: (classItem: Class) => void;
  initialTab?: 'overview' | 'lessons';
}

// UI interface extending the API ClassResponse with computed fields
interface UIClassResponse extends ClassResponse {
  classroomCapacity: number;
  availableSlots: number;
}

// Helper function to convert Class to UI ClassResponse
const convertToClassResponse = (classItem: Class): UIClassResponse => {
  const defaultCapacity = 30;
  return {
    id: classItem.id,
    name: classItem.name,
    subjectId: classItem.teacher.id, // Using teacher ID as subject ID for now
    subjectName: classItem.subject,
    teacherId: classItem.teacher.id,
    teacherName: classItem.teacher.name,
    classroomId: classItem.roomId || 'unknown',
    classroomName: classItem.room,
    enrolledCount: classItem.students,
    classroomCapacity: defaultCapacity,
    availableSlots: Math.max(0, defaultCapacity - classItem.students),
    description: classItem.description || null,
    requirements: classItem.requirements || null,
    objectives: classItem.objectives?.length > 0 ? classItem.objectives : null,
    materials: classItem.materials?.length > 0 ? classItem.materials : null,
    createdAt: classItem.createdAt,
    updatedAt: classItem.updatedAt,
    schedule: classItem.schedule.map(slot => ({
      dayOfWeek: slot.day as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday',
      startTime: slot.startTime,
      endTime: slot.endTime
    })),
    studentIds: classItem.studentIds,
    lessonSummary: {
      totalLessons: 0,
      scheduledLessons: 0,
      conductedLessons: 0,
      cancelledLessons: 0,
      makeupLessons: 0,
      noShowLessons: 0,
    },
  };
};

const ClassDetails: React.FC<ClassDetailsProps> = ({
  classItem,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  initialTab = 'overview',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'lessons'>(initialTab);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [lessonDetailOpen, setLessonDetailOpen] = useState(false);

  const {
    openConductModal,
    openCancelModal,
    canCreateMakeup,
  } = useQuickLessonActions();

  const { lessons } = useLessons();

  // Get the current lesson data from Redux store based on selectedLessonId
  const selectedLesson = useMemo(() => {
    if (!selectedLessonId) return null;
    return lessons.find(lesson => lesson.id === selectedLessonId) || null;
  }, [selectedLessonId, lessons]);

  if (!classItem) return null;

  // Convert to UI ClassResponse for component compatibility
  const classResponse = convertToClassResponse(classItem);

  const handleViewLessonDetail = (lesson: LessonResponse) => {
    setSelectedLessonId(lesson.id);
    setLessonDetailOpen(true);
  };

  const handleConductFromDetail = (lesson: LessonResponse) => {
    // Keep the detail modal open and open the conduct modal
    openConductModal(lesson);
  };

  const handleCancelFromDetail = (lesson: LessonResponse) => {
    // Keep the detail modal open and open the cancel modal
    openCancelModal(lesson);
  };

  const handleCreateMakeup = (lesson: LessonResponse) => {
    // TODO: Implement makeup lesson creation
    console.log('Create makeup for lesson:', lesson.id);
    // Keep the detail modal open
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {classItem.name}
            </DialogTitle>
          </DialogHeader>

          {/* Tab Navigation */}
          <div className="flex border-b border-white/10 -mx-6 px-6">
            <button
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-white border-b-2 border-blue-400'
                  : 'text-white/60 hover:text-white/80'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'lessons'
                  ? 'text-white border-b-2 border-blue-400'
                  : 'text-white/60 hover:text-white/80'
              }`}
              onClick={() => setActiveTab('lessons')}
            >
              Lessons
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            {activeTab === 'overview' ? (
              <div className="py-6">
                <ClassOverviewTab 
                  classData={classResponse} 
                  onViewLessons={() => setActiveTab('lessons')}
                />
                
                {/* Action Buttons for Overview */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-white/10 mt-6">
                  <Button
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    className="text-white hover:bg-white/10"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => onEdit(classItem)}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Edit Class
                  </Button>
                  <Button
                    onClick={() => onDelete(classItem)}
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    Delete Class
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-6">
                <ClassLessonsTab
                  classData={classResponse}
                />
                
                {/* Close Button for Lessons Tab */}
                <div className="flex justify-end pt-6 border-t border-white/10 mt-6">
                  <Button
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    className="text-white hover:bg-white/10"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Lesson Detail Modal */}
      <LessonDetailModal
        lesson={selectedLesson}
        open={lessonDetailOpen}
        onOpenChange={setLessonDetailOpen}
        onConduct={handleConductFromDetail}
        onCancel={handleCancelFromDetail}
        onCreateMakeup={canCreateMakeup(selectedLesson) ? handleCreateMakeup : undefined}
      />
    </>
  );
};

export default ClassDetails;

