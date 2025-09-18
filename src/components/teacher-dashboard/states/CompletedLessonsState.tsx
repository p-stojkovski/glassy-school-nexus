import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  BookOpen,
  Eye,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { LessonResponse } from '@/types/api/lesson';
import { formatTimeRange } from '../utils/timeUtils';

interface CompletedLessonsStateProps {
  completedLessons: LessonResponse[];
  currentTime: string;
  nextLessonDate?: string;
  nextLessonInfo?: {
    date: string;
    dayOfWeek: string;
    time: string;
    className: string;
  };
  onViewLessonReviews?: () => void;
  onViewSchedule?: () => void;
}

const CompletedLessonsState: React.FC<CompletedLessonsStateProps> = ({
  completedLessons,
  currentTime,
  nextLessonDate,
  nextLessonInfo,
  onViewLessonReviews,
  onViewSchedule
}) => {
  const totalLessons = completedLessons.length;
  const completedToday = completedLessons.filter(lesson => lesson.statusName === 'Conducted').length;
  
  // Get the most recent completed lesson for display
  const lastLesson = completedLessons.length > 0 
    ? [...completedLessons].sort((a, b) => b.endTime.localeCompare(a.endTime))[0]
    : null;

  return (
    <Card className="bg-gradient-to-r from-slate-500/20 to-gray-500/20 backdrop-blur-lg border-slate-500/30 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Day Complete!
            </CardTitle>
            <CardDescription className="text-white/80">
              All scheduled lessons for today have been completed
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Completion Summary */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="text-white font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-400" />
              Today's Summary
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-white/60">Total Lessons</div>
              <div className="text-lg font-semibold text-white">{totalLessons}</div>
            </div>
            <div>
              <div className="text-sm text-white/60">Successfully Conducted</div>
              <div className="text-lg font-semibold text-green-400">{completedToday}</div>
            </div>
          </div>
        </div>

        {/* Last Lesson Info */}
        {lastLesson && (
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-sm text-white/60 mb-2">Most Recent Lesson</div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-white font-medium">{lastLesson.className}</div>
                <div className="text-sm text-white/70">
                  {formatTimeRange(lastLesson.startTime, lastLesson.endTime)}
                </div>
              </div>
              <Badge 
                variant="outline" 
                className="text-green-400 border-green-400/50 bg-green-400/10"
              >
                Completed
              </Badge>
            </div>
          </div>
        )}

        {/* Next Lesson Information */}
        {nextLessonInfo ? (
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium">Next Lesson</span>
            </div>
            <div className="space-y-1">
              <div className="text-white">
                {nextLessonInfo.className} • {nextLessonInfo.time}
              </div>
              <div className="text-sm text-white/70">
                {nextLessonInfo.dayOfWeek}, {nextLessonInfo.date}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="text-center text-white/60">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <div className="text-sm">No upcoming lessons scheduled</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
          <Button
            onClick={onViewLessonReviews}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 flex-1"
            size="lg"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Lesson Reviews
          </Button>
          
          <Button
            onClick={onViewSchedule}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 sm:flex-shrink-0"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            View Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletedLessonsState;