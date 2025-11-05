import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Users, 
  BookCheck,
  Calendar,
  ChevronRight,
  BarChart3,
  FileText,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { LessonResponse } from '@/types/api/lesson';
import { formatTimeRange } from './utils/timeUtils';
import { useRecentLessons, RecentLessonSummary } from './hooks/useRecentLessons';
import TeacherLessonDetailModal from './TeacherLessonDetailModal';

interface RecentLessonsCardProps {
  classId: string;
  className: string;
  onViewAllLessons?: () => void;
  onViewLessonDetails?: (lessonId: string) => void;
}


const RecentLessonsCard: React.FC<RecentLessonsCardProps> = ({
  classId,
  className,
  onViewAllLessons,
  onViewLessonDetails
}) => {
  const { 
    recentLessons, 
    loading, 
    error 
  } = useRecentLessons(classId);
  
  // Modal state for lesson detail view
  const [selectedLesson, setSelectedLesson] = useState<LessonResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Handle lesson row click
  const handleLessonClick = (lesson: LessonResponse) => {
    setSelectedLesson(lesson);
    setIsModalOpen(true);
    // Call the optional callback if provided
    onViewLessonDetails?.(lesson.id);
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-slate-500/20 to-gray-500/20 backdrop-blur-lg border-slate-500/30 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Loading Recent Lessons</h3>
          <p className="text-white/70">Fetching your lesson history...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-lg border-red-500/30 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Error Loading Lessons</h3>
          <p className="text-white/70 mb-4">{error}</p>
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!recentLessons || recentLessons.length === 0) {
    return (
      <Card className="bg-gradient-to-r from-slate-500/20 to-gray-500/20 backdrop-blur-lg border-slate-500/30 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Recent Lessons</h3>
          <p className="text-white/70">Complete some lessons to see your teaching history here.</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate overall stats
  const totalLessons = recentLessons.length;
  const avgAttendanceRate = recentLessons.reduce((sum, lesson) => sum + lesson.attendanceRate, 0) / totalLessons;
  const avgHomeworkRate = recentLessons.reduce((sum, lesson) => sum + lesson.homeworkRate, 0) / totalLessons;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-400';
    if (rate >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHomeworkColor = (rate: number) => {
    if (rate >= 85) return 'text-green-400';
    if (rate >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="bg-gradient-to-r from-slate-500/20 to-gray-500/20 backdrop-blur-lg border-slate-500/30 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-400" />
              Recent Lessons
            </CardTitle>
            <CardDescription className="text-white/80">
              Your last {totalLessons} completed lessons for {className}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">Avg Attendance</div>
              <div className={`text-lg font-semibold ${getAttendanceColor(avgAttendanceRate)}`}>
                {avgAttendanceRate.toFixed(1)}%
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <BookCheck className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">Avg Homework</div>
              <div className={`text-lg font-semibold ${getHomeworkColor(avgHomeworkRate)}`}>
                {avgHomeworkRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Recent Lessons List */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-white/80 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Lesson History
          </div>
          
          <div className="space-y-2">
            {recentLessons.map((lessonSummary) => (
              <div
                key={lessonSummary.lesson.id}
                className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group"
                onClick={() => handleLessonClick(lessonSummary.lesson)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Date and Time */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-white/60">
                        {formatDate(lessonSummary.lesson.scheduledDate)}
                      </span>
                      <span className="text-sm text-white/60">•</span>
                      <Clock className="w-3 h-3 text-white/40" />
                      <span className="text-sm text-white/60">
                        {formatTimeRange(lessonSummary.lesson.startTime, lessonSummary.lesson.endTime)}
                      </span>
                    </div>
                    
                    {/* Lesson Notes Preview */}
                    <div className="text-white text-sm font-medium mb-2 truncate">
                      {lessonSummary.lesson.notes || 'Lesson completed successfully'}
                    </div>
                    
                    {/* Stats Row */}
                    <div className="flex items-center gap-4">
                      {/* Attendance */}
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-white/40" />
                        <span className={`text-xs ${getAttendanceColor(lessonSummary.attendanceRate)}`}>
                          {lessonSummary.attendanceCount}/{lessonSummary.totalStudents}
                        </span>
                      </div>
                      
                      {/* Homework */}
                      <div className="flex items-center gap-1">
                        <BookCheck className="w-3 h-3 text-white/40" />
                        <span className={`text-xs ${getHomeworkColor(lessonSummary.homeworkRate)}`}>
                          {lessonSummary.homeworkCompletedCount}/{lessonSummary.homeworkTotalCount}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Arrow Indicator */}
                  <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      
      {/* Lesson Detail Modal */}
      <TeacherLessonDetailModal
        lesson={selectedLesson}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </Card>
  );
};

export default RecentLessonsCard;