import React from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, AlertCircle, BookOpen } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LessonResponse } from '@/types/api/lesson';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: LessonResponse;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  lesson
}) => {
  const formatLessonDateTime = (lesson: LessonResponse) => {
    const date = new Date(lesson.scheduledDate);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric' 
    });
    return `${dayName}, ${dateStr} • ${lesson.startTime} - ${lesson.endTime}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 via-green-900/90 to-emerald-900/95 backdrop-blur-xl border-white/20 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" />
            Student Attendance
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Mark student attendance for this lesson
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Lesson Details */}
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-white">{lesson.className}</h4>
                <Badge className="bg-green-500 hover:bg-green-500 text-white">
                  {lesson.statusName}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Clock className="w-4 h-4" />
                <span>{formatLessonDateTime(lesson)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-white/70">
                <BookOpen className="w-4 h-4" />
                <span>{lesson.subjectNameSnapshot || lesson.subjectName}</span>
              </div>
            </div>
          </div>

          {/* Coming Soon Placeholder */}
          <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 p-8 rounded-lg border border-blue-500/30 text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-blue-400" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">
              Attendance Management
            </h3>
            
            <p className="text-white/70 mb-4 max-w-md mx-auto">
              Student attendance tracking will be available in <strong>Epic 4: Student Attendance Management</strong>. 
              This feature will include:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-white/60 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span>Student list with photos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span>Present/Absent/Late/Excused status</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span>Touch-friendly interface</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span>Bulk operations ("Mark All Present")</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 text-blue-300 text-sm bg-blue-500/10 px-4 py-2 rounded-full">
              <Clock className="w-4 h-4" />
              <span>Coming in Epic 4</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Close
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceModal;