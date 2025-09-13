import React from 'react';
import { motion } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  BookOpen,
  FileText,
  CheckCircle,
  XCircle,
  RotateCcw,
  History,
  AlertCircle,
  Eye,
  Edit
} from 'lucide-react';
import { LessonResponse } from '@/types/api/lesson';
import LessonStatusBadge from '../LessonStatusBadge';
import GlassCard from '@/components/common/GlassCard';
import { canTransitionToStatus } from '@/types/api/lesson';

interface LessonDetailModalProps {
  lesson: LessonResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConduct?: (lesson: LessonResponse) => void;
  onCancel?: (lesson: LessonResponse) => void;
  onCreateMakeup?: (lesson: LessonResponse) => void;
  onEdit?: (lesson: LessonResponse) => void;
}

const LessonDetailModal: React.FC<LessonDetailModalProps> = ({
  lesson,
  open,
  onOpenChange,
  onConduct,
  onCancel,
  onCreateMakeup,
  onEdit,
}) => {
  if (!lesson) return null;

  const canConduct = canTransitionToStatus(lesson.statusName, 'Conducted');
  const canCancel = canTransitionToStatus(lesson.statusName, 'Cancelled');
  const canCreateMakeup = lesson.statusName === 'Cancelled' && !lesson.makeupLessonId;

  const lessonDate = new Date(lesson.scheduledDate);
  const isToday = lessonDate.toDateString() === new Date().toDateString();
  const isPast = lessonDate < new Date();
  const isFuture = lessonDate > new Date();

  // Format date nicely
  const formattedDate = lessonDate.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-blue-400" />
              <span className="text-xl">Lesson Details</span>
            </div>
            <LessonStatusBadge status={lesson.statusName} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date & Time Information */}
          <GlassCard className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Date & Time
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-sm block mb-1">Date</label>
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium">
                    {formattedDate}
                  </p>
                  {isToday && (
                    <Badge variant="outline" className="text-yellow-400 border-yellow-400/50 bg-yellow-400/10">
                      Today
                    </Badge>
                  )}
                  {isPast && !isToday && (
                    <Badge variant="outline" className="text-gray-400 border-gray-400/50 bg-gray-400/10">
                      Past
                    </Badge>
                  )}
                  {isFuture && (
                    <Badge variant="outline" className="text-green-400 border-green-400/50 bg-green-400/10">
                      Upcoming
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <label className="text-white/60 text-sm block mb-1">Time</label>
                <p className="text-white font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {lesson.startTime} - {lesson.endTime}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Class Information */}
          <GlassCard className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-400" />
              Class Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-white/60 text-sm block mb-1">Class Name</label>
                <p className="text-white font-medium">{lesson.className}</p>
              </div>
              <div>
                <label className="text-white/60 text-sm block mb-1 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Subject
                </label>
                <p className="text-white font-medium">{lesson.subjectName}</p>
              </div>
              <div>
                <label className="text-white/60 text-sm block mb-1 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Teacher
                </label>
                <p className="text-white font-medium">{lesson.teacherName}</p>
              </div>
              <div>
                <label className="text-white/60 text-sm block mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Classroom
                </label>
                <p className="text-white font-medium">{lesson.classroomName}</p>
              </div>
            </div>
          </GlassCard>

          {/* Status Information */}
          <GlassCard className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-purple-400" />
              Status Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-sm block mb-1">Current Status</label>
                  <LessonStatusBadge status={lesson.statusName} size="lg" />
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-1">Generation Source</label>
                  <Badge variant="outline" className="text-white/80 border-white/20 bg-white/5">
                    {lesson.generationSource === 'automatic' ? 'Auto-generated' : 
                     lesson.generationSource === 'makeup' ? 'Makeup Lesson' : 'Manual'}
                  </Badge>
                </div>
              </div>

              {lesson.conductedAt && (
                <div>
                  <label className="text-white/60 text-sm block mb-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Conducted At
                  </label>
                  <p className="text-white">
                    {new Date(lesson.conductedAt).toLocaleString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
              
              {lesson.cancellationReason && (
                <div>
                  <label className="text-white/60 text-sm block mb-1 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Cancellation Reason
                  </label>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-white">{lesson.cancellationReason}</p>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Notes */}
          {lesson.notes && (
            <GlassCard className="p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-yellow-400" />
                Notes
              </h3>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white/90 whitespace-pre-wrap">{lesson.notes}</p>
              </div>
            </GlassCard>
          )}

          {/* Related Lessons */}
          {(lesson.makeupLessonId || lesson.originalLessonId) && (
            <GlassCard className="p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-purple-400" />
                Related Lessons
              </h3>
              <div className="space-y-3">
                {lesson.originalLessonId && (
                  <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <div>
                      <span className="text-white/60 text-sm block">This is a makeup lesson for:</span>
                      <span className="text-white font-medium">Original Lesson</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                      onClick={() => {
                        // TODO: Navigate to original lesson
                        console.log('Navigate to original lesson:', lesson.originalLessonId);
                      }}
                    >
                      View Original
                    </Button>
                  </div>
                )}
                
                {lesson.makeupLessonId && (
                  <div className="flex items-center justify-between bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                    <div>
                      <span className="text-white/60 text-sm block">This lesson has a makeup:</span>
                      <span className="text-white font-medium">Makeup Lesson</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
                      onClick={() => {
                        // TODO: Navigate to makeup lesson
                        console.log('Navigate to makeup lesson:', lesson.makeupLessonId);
                      }}
                    >
                      View Makeup
                    </Button>
                  </div>
                )}
              </div>
            </GlassCard>
          )}

          {/* Metadata */}
          <GlassCard className="p-4">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              Metadata
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-white/60 block mb-1">Lesson ID</label>
                <p className="text-white/80 font-mono bg-white/5 rounded px-2 py-1 break-all">
                  {lesson.id}
                </p>
              </div>
              <div>
                <label className="text-white/60 block mb-1">Class ID</label>
                <p className="text-white/80 font-mono bg-white/5 rounded px-2 py-1 break-all">
                  {lesson.classId}
                </p>
              </div>
              <div>
                <label className="text-white/60 block mb-1">Created At</label>
                <p className="text-white/80">
                  {new Date(lesson.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-white/60 block mb-1">Updated At</label>
                <p className="text-white/80">
                  {new Date(lesson.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-white/70 hover:bg-white/10"
            >
              Close
            </Button>
            
            {onEdit && (
              <Button
                onClick={() => onEdit(lesson)}
                variant="ghost"
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Lesson
              </Button>
            )}
            
            {canCreateMakeup && onCreateMakeup && (
              <Button
                onClick={() => onCreateMakeup(lesson)}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Create Makeup
              </Button>
            )}
            
            {canCancel && onCancel && (
              <Button
                onClick={() => onCancel(lesson)}
                variant="ghost"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Lesson
              </Button>
            )}
            
            {canConduct && onConduct && (
              <Button
                onClick={() => onConduct(lesson)}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Conducted
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LessonDetailModal;

