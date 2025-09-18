import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Clock, BookOpen, CheckCircle, AlertTriangle, FileText, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LessonResponse } from '@/types/api/lesson';
import { toast } from 'sonner';

interface EndLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: LessonResponse;
  onConfirmEnd?: () => Promise<void>;
}

const EndLessonModal: React.FC<EndLessonModalProps> = ({
  isOpen,
  onClose,
  lesson,
  onConfirmEnd
}) => {
  const [finalNotes, setFinalNotes] = useState('');
  const [isEnding, setIsEnding] = useState(false);

  const handleConfirmEnd = async () => {
    if (!onConfirmEnd) return;
    
    setIsEnding(true);
    
    try {
      await onConfirmEnd();
      
      // Show success message
      toast.success('Lesson ended successfully!');
      
      // Close modal
      onClose();
      
      // Clear final notes
      setFinalNotes('');
      
    } catch (error: any) {
      console.error('Error ending lesson:', error);
      toast.error(error?.message || 'Failed to end lesson');
    } finally {
      setIsEnding(false);
    }
  };

  const handleCancel = () => {
    if (isEnding) return; // Prevent closing while ending
    setFinalNotes('');
    onClose();
  };

  const formatLessonDateTime = (lesson: LessonResponse) => {
    const date = new Date(lesson.scheduledDate);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric' 
    });
    return `${dayName}, ${dateStr} • ${lesson.startTime} - ${lesson.endTime}`;
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const calculateLessonDuration = () => {
    const startTime = new Date(`2000-01-01T${lesson.startTime}`);
    const currentTime = new Date();
    const currentTimeString = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
    const current = new Date(`2000-01-01T${currentTimeString}`);
    
    const duration = Math.max(0, Math.floor((current.getTime() - startTime.getTime()) / (1000 * 60)));
    
    if (duration < 60) {
      return `${duration} minutes`;
    } else {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 via-red-900/90 to-orange-900/95 backdrop-blur-xl border-white/20 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <LogOut className="w-5 h-5 text-red-400" />
            End Lesson
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Confirm ending this lesson and mark it as conducted
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Warning Notice */}
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h4 className="font-medium text-orange-200">Confirm Lesson Completion</h4>
              <p className="text-sm text-orange-200/70">
                This action will mark the lesson as conducted and cannot be undone. 
                Make sure you've completed all necessary tasks.
              </p>
            </div>
          </div>

          {/* Lesson Summary */}
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h4 className="font-medium text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Lesson Summary
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-white/50 uppercase tracking-wide">Class</div>
                  <div className="text-white font-medium">{lesson.className}</div>
                </div>
                
                <div>
                  <div className="text-xs text-white/50 uppercase tracking-wide">Subject</div>
                  <div className="text-white">{lesson.subjectNameSnapshot || lesson.subjectName}</div>
                </div>
                
                <div>
                  <div className="text-xs text-white/50 uppercase tracking-wide">Date & Time</div>
                  <div className="text-white text-sm">{formatLessonDateTime(lesson)}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-white/50 uppercase tracking-wide">Teacher</div>
                  <div className="text-white">{lesson.teacherNameSnapshot || lesson.teacherName}</div>
                </div>
                
                <div>
                  <div className="text-xs text-white/50 uppercase tracking-wide">Room</div>
                  <div className="text-white">{lesson.classroomNameSnapshot}</div>
                </div>
                
                <div>
                  <div className="text-xs text-white/50 uppercase tracking-wide">Duration</div>
                  <div className="text-white">{calculateLessonDuration()}</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/50 uppercase tracking-wide">Current Status</div>
                  <Badge className="bg-blue-500 hover:bg-blue-500 text-white mt-1">
                    {lesson.statusName}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/50 uppercase tracking-wide">Will become</div>
                  <Badge className="bg-green-500 hover:bg-green-500 text-white mt-1">
                    Conducted
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Completion Checklist */}
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h4 className="font-medium text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Before Ending Lesson
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
                  <Users className="w-3 h-3 text-yellow-400" />
                </div>
                <span className="text-white/80">Student attendance (Available in Epic 4)</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
                  <FileText className="w-3 h-3 text-yellow-400" />
                </div>
                <span className="text-white/80">Homework assignment (Available in Epic 5)</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-white/80">Lesson notes saved</span>
              </div>
            </div>
          </div>

          {/* Final Notes */}
          <div className="space-y-3">
            <label className="text-white font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Final Notes (Optional)
            </label>
            
            <Textarea
              placeholder="Add any final observations or summary of the lesson..."
              value={finalNotes}
              onChange={(e) => setFinalNotes(e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 resize-none"
              rows={3}
              maxLength={500}
              disabled={isEnding}
            />
            
            <div className="text-xs text-white/50 text-right">
              {finalNotes.length}/500 characters
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCancel}
              variant="ghost"
              className="flex-1 text-white hover:bg-white/10"
              disabled={isEnding}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleConfirmEnd}
              className="flex-1 bg-red-600/80 hover:bg-red-700 text-white font-semibold"
              disabled={isEnding}
            >
              {isEnding ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Ending Lesson...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  End Lesson & Mark as Conducted
                </div>
              )}
            </Button>
          </div>

          {/* Current Time Display */}
          <div className="text-center pt-2 border-t border-white/10">
            <div className="inline-flex items-center gap-2 text-white/50 text-sm">
              <Clock className="w-4 h-4" />
              <span>Current time: {getCurrentTime()}</span>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default EndLessonModal;