import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { AppBreadcrumb } from '@/components/navigation';
import { buildClassBreadcrumbs } from '@/domains/classes/utils/classBreadcrumbs';
import LessonStudentPanel from '@/components/teacher-dashboard/student-management/LessonStudentPanel';
import { lessonApiService } from '@/services/lessonApiService';
import { classApiService } from '@/services/classApiService';
import { LessonResponse } from '@/types/api/lesson';
import { ClassBasicInfoResponse } from '@/types/api/class';
import { getLessonModeConfig, canAccessLessonInterface } from '@/domains/lessons/utils/lessonModeUtils';
import { toast } from 'sonner';
import { getCurrentTime } from '@/components/teacher-dashboard/utils/timeUtils';

/**
 * Teaching Mode Page - Shared lesson execution and editing view
 * Supports both live teaching (Scheduled lessons) and post-lesson editing (Conducted lessons)
 * Accessed from both ClassPage and Teacher Dashboard
 * Route: /classes/:classId/teach/:lessonId
 */
const ClassTeachingModePage: React.FC = () => {
  const { classId, lessonId } = useParams<{ classId: string; lessonId: string }>();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [classData, setClassData] = useState<ClassBasicInfoResponse | null>(null);
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [isLoading, setIsLoading] = useState(true);
  const [isEnding, setIsEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch lesson and class data
  const fetchData = useCallback(async () => {
    if (!classId || !lessonId) {
      setError('Invalid class or lesson ID');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [lessonData, classInfo] = await Promise.all([
        lessonApiService.getLessonById(lessonId),
        classApiService.getClassById(classId)
      ]);

      // Verify the lesson belongs to this class
      if (lessonData.classId !== classId) {
        setError('This lesson does not belong to the selected class');
        setIsLoading(false);
        return;
      }

      // Verify the lesson status allows access to this interface
      if (!canAccessLessonInterface(lessonData.statusName)) {
        setError(`Cannot edit a ${lessonData.statusName.toLowerCase()} lesson. Only scheduled, conducted, and make-up lessons can be managed.`);
        setIsLoading(false);
        return;
      }

      setLesson(lessonData);
      setClassData(classInfo);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load lesson data';
      setError(errorMessage);
      console.error('Error loading teaching mode:', err);
    } finally {
      setIsLoading(false);
    }
  }, [classId, lessonId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Handle ending the lesson
  const handleEndLesson = async () => {
    if (!lesson) return;

    setIsEnding(true);
    try {
      await lessonApiService.conductLesson(lesson.id, {
        notes: 'Lesson completed via teaching mode'
      });
      toast.success('Lesson ended successfully!');
      navigate(`/classes/${classId}`);
    } catch (err: unknown) {
      console.error('Error ending lesson:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to end lesson');
    } finally {
      setIsEnding(false);
    }
  };

  // Navigate back to class page
  const handleBack = () => {
    navigate(`/classes/${classId}`);
  };

  // Get lesson mode configuration (must be before early returns)
  const modeConfig = useMemo(() => {
    if (!lesson) return null;
    return getLessonModeConfig(lesson.statusName, lesson.scheduledDate);
  }, [lesson]);
  
  const isEditingMode = modeConfig?.mode === 'editing';

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error || !lesson || !classData || !modeConfig) {
    return (
      <div className="space-y-6">
        {/* Breadcrumbs - show even in error state for context */}
        <AppBreadcrumb 
          items={buildClassBreadcrumbs({
            classData: classData ? { id: classData.id, name: classData.name } : null,
            pageType: 'teaching',
          })}
        />
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-white/80 hover:text-white hover:bg-white/10"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Class
        </Button>
        <ErrorMessage
          title="Error Loading Lesson"
          message={error || 'Lesson not found'}
          onRetry={fetchData}
          showRetry
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <AppBreadcrumb 
        items={buildClassBreadcrumbs({
          classData: { id: classData.id, name: classData.name },
          lessonData: { id: lesson.id, scheduledDate: lesson.scheduledDate, statusName: lesson.statusName },
          pageType: 'teaching',
        })}
      />

      {/* Main Lesson Management Panel */}
      <LessonStudentPanel
        lesson={lesson}
        currentTime={currentTime}
        onEndLesson={handleEndLesson}
        isLoading={isEnding}
        modeConfig={modeConfig}
      />
    </div>
  );
};

export default ClassTeachingModePage;

