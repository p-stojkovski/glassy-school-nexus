import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BookOpen, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { ClassResponse } from '@/types/api/class';
import { LessonContextType } from './hooks/useLessonContext';
import ActiveLessonState from './states/ActiveLessonState';
import UpcomingLessonState from './states/UpcomingLessonState';
import CompletedLessonsState from './states/CompletedLessonsState';
import NoLessonsState from './states/NoLessonsState';

interface LessonContextCardProps {
  classItem: ClassResponse;
  lessonContext: LessonContextType;
}

const LessonContextCard: React.FC<LessonContextCardProps> = ({
  classItem,
  lessonContext
}) => {
  const {
    currentLesson,
    lessonState,
    isLoading,
    error,
    currentTime,
    refreshLessons,
    completedLessons,
    currentDate,
    isWeekend,
    isHoliday,
    holidayName,
    nextLessonInfo,
    startLessonManagement
  } = lessonContext;

  const handleStartLessonManagement = () => {
    startLessonManagement();
  };

  const handlePrepareLessonPlan = () => {
    // Placeholder for lesson preparation
    alert('Lesson preparation features coming soon!');
  };

  const handleViewLessonPlan = () => {
    // Placeholder for lesson plan viewer
    alert('Lesson plan viewer coming soon!');
  };

  const handleViewLessonReviews = () => {
    // Placeholder for lesson reviews
    alert('Lesson reviews coming soon!');
  };

  const handleViewSchedule = () => {
    // Placeholder for schedule viewer
    alert('Schedule viewer coming soon!');
  };

  const handleCreateLesson = () => {
    // Placeholder for lesson creation
    alert('Create lesson coming soon!');
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Lesson Status
          </CardTitle>
          <CardDescription className="text-white/70">
            Loading today's lesson information...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-white/60 animate-spin" />
              </div>
              <div className="text-lg text-white font-medium">
                Loading lessons...
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Lesson Status
          </CardTitle>
          <CardDescription className="text-white/70">
            Error loading lesson information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-red-500/20 border-red-500/30 text-red-200 mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-center">
            <Button
              onClick={refreshLessons}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Active lesson state
  if (lessonState === 'active' && currentLesson) {
    return (
      <ActiveLessonState
        lesson={currentLesson}
        onStartLessonManagement={handleStartLessonManagement}
      />
    );
  }

  // Upcoming lesson state - Story 2.2 Implementation
  if (lessonState === 'upcoming' && currentLesson) {
    return (
      <UpcomingLessonState
        lesson={currentLesson}
        currentTime={currentTime}
        onPrepareLessonPlan={handlePrepareLessonPlan}
        onViewLessonPlan={handleViewLessonPlan}
      />
    );
  }

  // Completed lessons state - Story 2.3 Implementation
  if (lessonState === 'completed') {
    return (
      <CompletedLessonsState
        completedLessons={completedLessons}
        nextLessonInfo={nextLessonInfo}
        onViewLessonReviews={handleViewLessonReviews}
        onViewSchedule={handleViewSchedule}
      />
    );
  }

  // No lessons state - Story 2.4 Implementation
  return (
    <NoLessonsState
      classItem={classItem}
      currentTime={currentTime}
      currentDate={currentDate}
      isWeekend={isWeekend}
      isHoliday={isHoliday}
      holidayName={holidayName}
      nextLessonInfo={nextLessonInfo}
      onViewFullSchedule={handleViewSchedule}
      onCreateLesson={handleCreateLesson}
    />
  );
};

export default LessonContextCard;