import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, Calendar, BookOpen, Users, MapPin, Loader2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
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

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-500/90';
      case 'Conducted':
        return 'bg-green-500/90';
      case 'Cancelled':
        return 'bg-red-500/90';
      default:
        return 'bg-gray-500/90';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Class
          </Button>
          <div className="h-6 w-px bg-white/20" />
          <div>
            <h1 className="text-2xl font-bold text-white">{classData.name}</h1>
            <p className="text-white/60 text-sm flex items-center gap-2">
              {classData.subjectName} - {modeConfig.headerTitle}
              {isEditingMode && <Edit3 className="w-3 h-3" />}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-white/70">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{currentTime}</span>
          </div>
        </div>
      </div>

      {/* Lesson Context Bar */}
      <Card className={`backdrop-blur-lg border-white/20 ${
        isEditingMode ? 'bg-amber-500/10' : 'bg-white/10'
      }`}>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Calendar className={`w-4 h-4 ${isEditingMode ? 'text-amber-400' : 'text-blue-400'}`} />
                <span className="text-white">{formatDate(lesson.scheduledDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-white">{lesson.startTime} - {lesson.endTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span className="text-white">{lesson.classroomName || lesson.classroomNameSnapshot}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className={`w-4 h-4 ${isEditingMode ? 'text-amber-400' : 'text-blue-400'}`} />
                <span className="text-white">{classData.enrolledCount} students</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(lesson.statusName)}>
                {lesson.statusName}
              </Badge>
              {isEditingMode && lesson.conductedAt && (
                <Badge variant="outline" className="text-white/70 border-white/30 text-xs">
                  Conducted {new Date(lesson.conductedAt).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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

