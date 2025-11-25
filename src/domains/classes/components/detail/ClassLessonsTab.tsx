import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Calendar, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/common/GlassCard';
import { ClassResponse } from '@/types/api/class';
import { LessonResponse, LessonStatusName, CreateLessonRequest, MakeupLessonFormData } from '@/types/api/lesson';
import { useLessonsForClass, useLessons } from '@/domains/lessons/hooks/useLessons';
import { useQuickLessonActions } from '@/domains/lessons/hooks/useQuickLessonActions';
import LessonCalendar from '@/domains/lessons/components/LessonCalendar';
import CreateLessonSidebar from '@/domains/lessons/components/modals/CreateLessonSidebar';
import QuickConductLessonModal from '@/domains/lessons/components/modals/QuickConductLessonModal';
import QuickCancelLessonModal from '@/domains/lessons/components/modals/QuickCancelLessonModal';
import LessonDetailModal from '@/domains/lessons/components/modals/LessonDetailModal';
import AcademicLessonGenerationModal from '@/domains/lessons/components/modals/AcademicLessonGenerationModal';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import LessonFiltersBar from '@/domains/lessons/components/LessonFiltersBar';
import LessonActionButtons from '@/domains/lessons/components/LessonActionButtons';

interface ClassLessonsTabProps {
  classData: ClassResponse;
}

type LessonFilter = 'all' | LessonStatusName;
type TeacherFilter = 'all' | string; // 'all' or teacher ID

const ClassLessonsTab: React.FC<ClassLessonsTabProps> = ({
  classData,
}) => {
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
      await addLesson(lessonData);
      setIsCreateLessonOpen(false);
      // Reload lessons to show the new one
      await loadLessons();
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
  const handleAcademicGenerationSuccess = async (result: any) => {
    // Reload lessons to show the newly generated ones
    await loadLessons();
    setIsAcademicGenerationOpen(false);
    
    const message = `Generated ${result.generatedCount} lessons`;
    const details = result.skippedCount > 0 ? ` (${result.skippedCount} skipped)` : '';
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

  if (loading && lessons.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Class Lessons</h3>
            <p className="text-white/60">
              {lessons.length} lessons | {filteredLessons.length} showing
              {teacherFilter !== 'all' && (
                <span className="ml-2">
                  | filtered by {uniqueTeachers.find(t => t.id === teacherFilter)?.name || 'teacher'}
                </span>
              )}
            </p>
          </div>

        <div className="flex flex-wrap gap-4">
          <LessonFiltersBar
            lessons={lessons}
            statusFilter={statusFilter}
            teacherFilter={teacherFilter}
            onStatusChange={setStatusFilter}
            onTeacherChange={setTeacherFilter}
          />
          <LessonActionButtons
            onCreateLesson={() => setIsCreateLessonOpen(true)}
            onGenerateLessons={() => setIsAcademicGenerationOpen(true)}
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredLessons.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <GlassCard className="p-12">
            <Calendar className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {statusFilter === 'all' && teacherFilter === 'all' ? 'No Lessons Yet' : 'No Lessons Found'}
            </h3>
            <p className="text-white/60 mb-6">
              {statusFilter === 'all' && teacherFilter === 'all'
                ? 'Start by creating your first lesson for this class.'
                : (() => {
                    let message = 'There are no lessons';
                    if (statusFilter !== 'all') message += ` (${statusFilter.toLowerCase()})`;
                    if (teacherFilter !== 'all') {
                      const teacherName = uniqueTeachers.find(t => t.id === teacherFilter)?.name || 'teacher';
                      message += ` for ${teacherName}`;
                    }
                    message += ' for this class.';
                    return message;
                  })()
              }
            </p>
            {statusFilter === 'all' && teacherFilter === 'all' && (
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => setIsAcademicGenerationOpen(true)}
                  className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Smart Generate Lessons
                </Button>
                <Button
                  onClick={() => setIsCreateLessonOpen(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Lesson
                </Button>
              </div>
            )}
          </GlassCard>
        </motion.div>
      ) : (
        /* Calendar View */
        <LessonCalendar 
          lessons={filteredLessons}
          onLessonClick={handleLessonDetails}
          onConductLesson={openConductModal}
          onCancelLesson={openCancelModal}
          onLessonsUpdated={loadLessons}
          emptyMessage={statusFilter === 'all' && teacherFilter === 'all' ? 'No Lessons Scheduled' : 'No Lessons Found'}
          emptyDescription={statusFilter === 'all' && teacherFilter === 'all'
            ? 'Create lessons to see them appear on the calendar.'
            : (() => {
                let message = 'There are no lessons';
                if (statusFilter !== 'all') message += ` (${statusFilter.toLowerCase()})`;
                if (teacherFilter !== 'all') {
                  const teacherName = uniqueTeachers.find(t => t.id === teacherFilter)?.name || 'teacher';
                  message += ` for ${teacherName}`;
                }
                message += ' scheduled for this period.';
                return message;
              })()
          }
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
      
      {/* Lesson Details Modal */}
      <LessonDetailModal
        lesson={selectedLessonForDetails}
        open={isLessonDetailsOpen}
        onOpenChange={setIsLessonDetailsOpen}
        onConduct={openConductModal}
        onCancel={openCancelModal}
      />
    </div>
  );
};

export default ClassLessonsTab;

