import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, MapPin } from 'lucide-react';
import { LessonResponse } from '@/types/api/lesson';
import { calculateDuration } from '../utils/timeUtils';

interface LessonOverviewSectionProps {
  lesson: LessonResponse;
}

const LessonOverviewSection: React.FC<LessonOverviewSectionProps> = ({ lesson }) => {
  const lessonDate = new Date(lesson.scheduledDate);
  const isToday = lessonDate.toDateString() === new Date().toDateString();
  
  const formattedDate = lessonDate.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const duration = calculateDuration(lesson.startTime, lesson.endTime);

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-blue-400" />
        Lesson Overview
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-white/60 text-sm block mb-1">Date</label>
          <div className="flex items-center gap-2">
            <p className="text-white font-medium">{formattedDate}</p>
            {isToday && (
              <Badge variant="outline" className="text-yellow-400 border-yellow-400/50 bg-yellow-400/10 text-xs">
                Today
              </Badge>
            )}
          </div>
        </div>
        
        <div>
          <label className="text-white/60 text-sm block mb-1">Time & Duration</label>
          <p className="text-white font-medium flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {lesson.startTime} - {lesson.endTime} ({duration})
          </p>
        </div>
        
        <div>
          <label className="text-white/60 text-sm block mb-1">Teacher</label>
          <p className="text-white font-medium flex items-center gap-1">
            <User className="w-4 h-4" />
            {lesson.teacherName}
          </p>
        </div>
        
        <div>
          <label className="text-white/60 text-sm block mb-1">Classroom</label>
          <p className="text-white font-medium flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {lesson.classroomName}
          </p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/10">
        <label className="text-white/60 text-sm block mb-1">Subject & Class</label>
        <p className="text-white font-medium">
          {lesson.subjectName} • {lesson.className}
        </p>
      </div>
    </div>
  );
};

export default LessonOverviewSection;