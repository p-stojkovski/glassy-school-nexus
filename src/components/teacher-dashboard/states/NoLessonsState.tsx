import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  BookOpen,
  Coffee,
  MapPin,
  Info
} from 'lucide-react';
import { ClassResponse } from '@/types/api/class';
import { getDayOfWeek } from '../utils/timeUtils';
import RecentLessonsCard from '../RecentLessonsCard';

interface NoLessonsStateProps {
  classItem: ClassResponse;
  currentTime: string;
  currentDate: string;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  nextLessonInfo?: {
    date: string;
    dayOfWeek: string;
    time: string;
    className: string;
  };
  onViewFullSchedule?: () => void;
  onCreateLesson?: () => void;
}

const NoLessonsState: React.FC<NoLessonsStateProps> = ({
  classItem,
  currentTime,
  currentDate,
  isWeekend,
  isHoliday,
  holidayName,
  nextLessonInfo,
  onViewFullSchedule,
  onCreateLesson
}) => {
  const dayOfWeek = getDayOfWeek(currentDate);
  
  // Determine the reason for no lessons
  const getReason = () => {
    if (isHoliday && holidayName) {
      return { type: 'holiday', message: `Today is ${holidayName}`, icon: '🎉' };
    }
    if (isWeekend) {
      return { type: 'weekend', message: 'It\'s the weekend!', icon: '🏖️' };
    }
    return { type: 'none', message: 'No lessons scheduled', icon: '📅' };
  };

  const reason = getReason();

  // Get appropriate styling based on reason
  const getCardStyling = () => {
    switch (reason.type) {
      case 'holiday':
        return 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30';
      case 'weekend':
        return 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border-teal-500/30';
      default:
        return 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 border-gray-500/30';
    }
  };

  const getBadgeColor = () => {
    switch (reason.type) {
      case 'holiday':
        return 'bg-purple-600 hover:bg-purple-600';
      case 'weekend':
        return 'bg-teal-600 hover:bg-teal-600';
      default:
        return 'bg-gray-600 hover:bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
    <Card className={`${getCardStyling()} backdrop-blur-lg shadow-lg`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={`${getBadgeColor()} text-white font-semibold px-3 py-1`}>
                {reason.icon} NO LESSONS TODAY
              </Badge>
            </div>
            <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
              <Coffee className="w-5 h-5 text-gray-400" />
              {reason.message}
            </CardTitle>
            <CardDescription className="text-white/80">
              {dayOfWeek}, {new Date(currentDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Class Information */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <span className="text-white font-medium">Class Information</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-white/60">Class</div>
              <div className="text-white">{classItem.name}</div>
              <div className="text-sm text-white/70">{classItem.subjectName}</div>
            </div>
            <div>
              <div className="text-sm text-white/60">Classroom</div>
              <div className="text-white flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {classItem.classroomName}
              </div>
              <div className="text-sm text-white/70">
                Capacity: {classItem.classroomCapacity} students
              </div>
            </div>
          </div>
        </div>


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
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-medium">Schedule Status</span>
            </div>
            <div className="text-white/80 text-sm">
              No upcoming lessons found. Check your schedule or create new lessons.
            </div>
          </div>
        )}

        {/* Reason-specific content */}
        {reason.type === 'weekend' && (
          <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20">
            <div className="text-center text-teal-300 text-sm">
              <Coffee className="w-6 h-6 mx-auto mb-1" />
              <div>Enjoy your weekend! Classes resume on Monday.</div>
            </div>
          </div>
        )}

        {reason.type === 'holiday' && (
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <div className="text-center text-purple-300 text-sm">
              <div className="text-2xl mb-1">🎉</div>
              <div>Enjoy the {holidayName}!</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
          <Button
            onClick={onViewFullSchedule}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 flex-1"
            size="lg"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            View Full Schedule
          </Button>
          
          <Button
            onClick={onCreateLesson}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 sm:flex-shrink-0"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Create Lesson
          </Button>
        </div>

        {/* Rest Day Message */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 text-gray-300 text-sm">
            <div className="w-2 h-2 bg-gray-500 rounded-full" />
            Take some time to rest and prepare
          </div>
        </div>
      </CardContent>
    </Card>
    
    <RecentLessonsCard
      classId={classItem.id}
      className={classItem.name}
    />
    </div>
  );
};

export default NoLessonsState;