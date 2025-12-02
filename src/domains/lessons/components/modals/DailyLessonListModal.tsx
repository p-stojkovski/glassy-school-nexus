import React from 'react';
import { motion } from 'framer-motion';
import { Clock, User, MapPin, X, CheckCircle, XCircle, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/common/GlassCard';
import LessonStatusBadge from '@/domains/lessons/components/LessonStatusBadge';
import { LessonResponse } from '@/types/api/lesson';
import { formatTimeWithoutSeconds } from '@/utils/timeFormatUtils';

interface DailyLessonListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  lessons: LessonResponse[];
  onLessonClick: (lesson: LessonResponse) => void;
  onConductLesson?: (lesson: LessonResponse) => void;
  onCancelLesson?: (lesson: LessonResponse) => void;
  onLessonsUpdated?: () => void; // Callback to refresh lessons after actions
}

const DailyLessonListModal: React.FC<DailyLessonListModalProps> = ({
  open,
  onOpenChange,
  date,
  lessons,
  onLessonClick,
  onConductLesson,
  onCancelLesson,
  onLessonsUpdated,
}) => {
  if (!date) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleLessonClick = (lesson: LessonResponse) => {
    onOpenChange(false);
    onLessonClick(lesson);
  };

  const handleConductLesson = async (e: React.MouseEvent, lesson: LessonResponse) => {
    e.stopPropagation(); // Prevent triggering the card click
    if (onConductLesson) {
      await onConductLesson(lesson);
      // Refresh the lessons data
      if (onLessonsUpdated) {
        onLessonsUpdated();
      }
    }
  };

  const handleCancelLesson = async (e: React.MouseEvent, lesson: LessonResponse) => {
    e.stopPropagation(); // Prevent triggering the card click
    if (onCancelLesson) {
      await onCancelLesson(lesson);
      // Refresh the lessons data
      if (onLessonsUpdated) {
        onLessonsUpdated();
      }
    }
  };

  // Helper functions to check if actions are available
  const canConductLesson = (lesson: LessonResponse) => {
    return lesson.statusName === 'Scheduled' || lesson.statusName === 'Make Up';
  };

  const canCancelLesson = (lesson: LessonResponse) => {
    return lesson.statusName === 'Scheduled' || lesson.statusName === 'Make Up';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center justify-between">
            <span>Lessons for {formatDate(date)}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6 pb-6">
          {lessons.length === 0 ? (
            <div className="text-center py-12">
              <GlassCard className="p-8">
                <Clock className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">
                  No Lessons Scheduled
                </h4>
                <p className="text-white/60 text-sm">
                  There are no lessons scheduled for this date.
                </p>
              </GlassCard>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-white/60 text-sm mb-4">
                {lessons.length} lesson{lessons.length > 1 ? 's' : ''} scheduled
              </p>
              
              {lessons
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((lesson, index) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GlassCard 
                      className="p-4 hover:bg-white/5 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-center bg-white/10 rounded-lg p-2 min-w-[60px]">
                            <div className="text-lg font-bold text-white">
                              {formatTimeWithoutSeconds(lesson.startTime)}
                            </div>
                            <div className="text-xs text-white/60">
                              {formatTimeWithoutSeconds(lesson.endTime)}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white font-medium">
                                {lesson.className}
                              </h4>
                              <LessonStatusBadge status={lesson.statusName} size="sm" />
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-white/70">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{lesson.teacherName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{lesson.classroomName}</span>
                              </div>
                            </div>
                            
                            {lesson.subjectName && (
                              <div className="text-sm text-white/60 mt-1">
                                Subject: {lesson.subjectName}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Quick Action Buttons */}
                        <div className="flex items-center gap-1 ml-2">
                          {canConductLesson(lesson) && onConductLesson && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => handleConductLesson(e, lesson)}
                              className="text-green-400 hover:text-green-300 hover:bg-green-500/20 p-2 h-8 w-8"
                              title="Mark as conducted"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {canCancelLesson(lesson) && onCancelLesson && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => handleCancelLesson(e, lesson)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 h-8 w-8"
                              title="Cancel lesson"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleLessonClick(lesson)}
                            className="text-white/70 hover:text-white hover:bg-white/20 p-2 h-8 w-8"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {lesson.notes && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-sm text-white/80">{lesson.notes}</p>
                        </div>
                      )}
                    </GlassCard>
                  </motion.div>
                ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-center pt-4 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DailyLessonListModal;

