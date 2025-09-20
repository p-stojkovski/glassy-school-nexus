import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Clock,
  Calendar,
  Users,
  Settings
} from 'lucide-react';
import { TeacherResponse } from '@/types/api/teacher';
import { ClassResponse } from '@/types/api/class';
import LessonContextCard from './LessonContextCard';
import LessonWithHomeworkSidebar from './LessonWithHomeworkSidebar';
import { useLessonContext } from './hooks/useLessonContext';
import { getCurrentTime, getCurrentDateFormatted } from './utils/timeUtils';
import { toast } from 'sonner';

interface TeacherDashboardMainProps {
  teacher: TeacherResponse;
  classItem: ClassResponse;
  onChangeSelection?: () => void;
}

const TeacherDashboardMain: React.FC<TeacherDashboardMainProps> = ({
  teacher,
  classItem,
  onChangeSelection,
}) => {
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [currentDate, setCurrentDate] = useState(getCurrentDateFormatted());
  
  // Get lesson context and management state
  const lessonContext = useLessonContext(teacher, classItem);
  
  // Update time every minute for real-time display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
      setCurrentDate(getCurrentDateFormatted());
    }, 60000); // Update every 60 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Handle end lesson functionality
  const handleEndLesson = async () => {
    try {
      await lessonContext.endLessonManagement();
      toast.success('Lesson ended successfully!');
    } catch (error: any) {
      console.error('Error ending lesson:', error);
      toast.error(error?.message || 'Failed to end lesson');
    }
  };

  return (
    <div>
      <div className="w-full space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Teacher Dashboard
            </h1>
            <div className="flex items-center gap-4 text-white/70">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Current Time: {currentTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Today: {currentDate}</span>
              </div>
            </div>
          </div>
          <Button
            onClick={onChangeSelection}
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <Settings className="w-4 h-4 mr-2" />
            Change Selection
          </Button>
        </div>

        {/* Current Selection Info */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              {teacher.name} - {classItem.name}
            </CardTitle>
            <CardDescription className="text-white/70">
              {classItem.subjectName} • Room {classItem.classroomName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-white/60">Teacher</div>
                <div className="text-white">{teacher.name}</div>
                <div className="text-sm text-white/60">{teacher.email}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-white/60">Class</div>
                <div className="text-white">{classItem.name}</div>
                <div className="text-sm text-white/60">{classItem.subjectName}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-white/60">Enrollment</div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-white/60" />
                  <span className="text-white">
                    {classItem.enrolledCount}/{classItem.classroomCapacity} students
                  </span>
                </div>
                <Badge 
                  variant={classItem.availableSlots > 0 ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  {classItem.availableSlots} slots available
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lesson Context Section - Epic 2, 3 & 3.5: Lesson Detection and Side-by-Side Layout */}
        {lessonContext.isLessonStarted ? (
          <LessonWithHomeworkSidebar 
            lesson={lessonContext.currentLesson!}
            currentTime={currentTime}
            onEndLesson={handleEndLesson}
            isLoading={lessonContext.isLoading}
          />
        ) : (
          <LessonContextCard 
            classItem={classItem}
            lessonContext={lessonContext}
          />
        )}
      </div>
    </div>
  );
};

export default TeacherDashboardMain;