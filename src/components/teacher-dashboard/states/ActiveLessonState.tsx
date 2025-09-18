import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  BookOpen, 
  MapPin, 
  Play,
  Users
} from 'lucide-react';
import { LessonResponse } from '@/types/api/lesson';
import { formatTimeRange } from '../utils/timeUtils';

interface ActiveLessonStateProps {
  lesson: LessonResponse;
  currentTime: string;
  onStartLessonManagement?: () => void;
}

const ActiveLessonState: React.FC<ActiveLessonStateProps> = ({
  lesson,
  currentTime,
  onStartLessonManagement
}) => {
  const timeRange = formatTimeRange(lesson.startTime, lesson.endTime);
  const roomName = lesson.classroomNameSnapshot || lesson.classroomName || 'Classroom TBD';

  return (
    <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg border-green-500/30 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500 hover:bg-green-500 text-white font-semibold px-3 py-1">
                🟢 ACTIVE LESSON
              </Badge>
            </div>
            <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {lesson.className}
            </CardTitle>
            <CardDescription className="text-white/80">
              Lesson is scheduled NOW - Ready to teach!
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Lesson Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <Clock className="w-4 h-4 text-green-400" />
              <span className="font-medium">Time:</span>
              <span>{timeRange}</span>
            </div>
            
            <div className="flex items-center gap-2 text-white">
              <MapPin className="w-4 h-4 text-green-400" />
              <span className="font-medium">Room:</span>
              <span>{roomName}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <BookOpen className="w-4 h-4 text-green-400" />
              <span className="font-medium">Subject:</span>
              <span>{lesson.subjectNameSnapshot || lesson.subjectName}</span>
            </div>
            
            <div className="flex items-center gap-2 text-white">
              <Users className="w-4 h-4 text-green-400" />
              <span className="font-medium">Teacher:</span>
              <span>{lesson.teacherNameSnapshot || lesson.teacherName}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
          <Button
            onClick={onStartLessonManagement}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold flex-1"
            size="lg"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Lesson Management
          </Button>
          
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 sm:flex-shrink-0"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            View Lesson Plan
          </Button>
        </div>

        {/* Status Indicator */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 text-green-300 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Lesson in progress
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveLessonState;