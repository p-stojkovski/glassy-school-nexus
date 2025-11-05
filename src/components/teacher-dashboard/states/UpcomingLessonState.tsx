import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  BookOpen, 
  MapPin, 
  Calendar,
  Users,
  FileText,
  Bell
} from 'lucide-react';
import { LessonResponse } from '@/types/api/lesson';
import { formatTimeRange, getLessonCountdown, isLessonStartingSoon } from '../utils/timeUtils';

interface UpcomingLessonStateProps {
  lesson: LessonResponse;
  currentTime: string;
  onPrepareLessonPlan?: () => void;
  onViewLessonPlan?: () => void;
}

const UpcomingLessonState: React.FC<UpcomingLessonStateProps> = ({
  lesson,
  currentTime,
  onPrepareLessonPlan,
  onViewLessonPlan
}) => {
  const timeRange = formatTimeRange(lesson.startTime, lesson.endTime);
  const roomName = lesson.classroomNameSnapshot || lesson.classroomName || 'Classroom TBD';
  const countdown = getLessonCountdown(lesson.startTime, currentTime);
  const isStartingSoon = isLessonStartingSoon(lesson.startTime, currentTime);

  // Dynamic styling based on how soon the lesson starts
  const badgeColor = isStartingSoon 
    ? "bg-orange-500 hover:bg-orange-500 text-white" 
    : "bg-blue-500 hover:bg-blue-500 text-white";
  
  const cardBg = isStartingSoon 
    ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-orange-500/30"
    : "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30";

  return (
    <Card className={`${cardBg} backdrop-blur-lg shadow-lg`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={`font-semibold px-3 py-1 ${badgeColor}`}>
                {isStartingSoon ? (
                  <>
                    <Bell className="w-3 h-3 mr-1" />
                    🔔 STARTING SOON
                  </>
                ) : (
                  <>🔵 UPCOMING LESSON</>
                )}
              </Badge>
            </div>
            <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {lesson.className}
            </CardTitle>
            <CardDescription className="text-white/80">
              Next scheduled lesson for today
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Countdown Display */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="text-center space-y-1">
            <div className="text-sm text-white/60">Lesson starts</div>
            <div className="text-lg font-bold text-white">
              {countdown.displayText}
            </div>
            {isStartingSoon && (
              <div className="text-sm text-orange-300">
                Get ready to start soon!
              </div>
            )}
          </div>
        </div>

        {/* Lesson Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="font-medium">Time:</span>
              <span>{timeRange}</span>
            </div>
            
            <div className="flex items-center gap-2 text-white">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span className="font-medium">Room:</span>
              <span>{roomName}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span className="font-medium">Subject:</span>
              <span>{lesson.subjectNameSnapshot || lesson.subjectName}</span>
            </div>
            
            <div className="flex items-center gap-2 text-white">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="font-medium">Teacher:</span>
              <span>{lesson.teacherNameSnapshot || lesson.teacherName}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
          <Button
            onClick={onPrepareLessonPlan}
            className={`flex-1 font-semibold ${
              isStartingSoon 
                ? 'bg-orange-600 hover:bg-orange-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
            size="lg"
          >
            <FileText className="w-4 h-4 mr-2" />
            Prepare Lesson
          </Button>
        </div>

        {/* Preparation Tips */}
        {countdown.totalMinutes > 10 && (
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-sm text-white/70">
              <div className="font-medium mb-1">Preparation time available:</div>
              <div className="text-xs text-white/60">
                • Review lesson materials
                • Prepare classroom setup
                • Check attendance list
              </div>
            </div>
          </div>
        )}

        {/* Countdown Status Indicator */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 text-blue-300 text-sm">
            <div className={`w-2 h-2 rounded-full ${isStartingSoon ? 'bg-orange-500 animate-pulse' : 'bg-blue-500'}`} />
            {isStartingSoon ? 'Starting very soon' : 'Countdown active'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingLessonState;