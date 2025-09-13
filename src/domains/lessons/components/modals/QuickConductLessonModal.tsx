import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Clock, User, MapPin, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LessonResponse } from '@/types/api/lesson';
import LessonStatusBadge from '../LessonStatusBadge';

interface QuickConductLessonModalProps {
  lesson: LessonResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (lessonId: string, notes?: string) => void;
  loading?: boolean;
}

const QuickConductLessonModal: React.FC<QuickConductLessonModalProps> = ({
  lesson,
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}) => {
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    if (!lesson) return;
    onConfirm(lesson.id, notes.trim() || undefined);
    setNotes(''); // Clear notes after confirmation
  };

  const handleCancel = () => {
    setNotes('');
    onOpenChange(false);
  };

  const formatLessonDateTime = (lesson: LessonResponse) => {
    const date = new Date(lesson.scheduledDate);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric' 
    });
    return `${dayName}, ${dateStr} • ${lesson.startTime} - ${lesson.endTime}`;
  };

  if (!lesson) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 via-green-900/90 to-emerald-900/95 backdrop-blur-xl border-white/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Mark Lesson as Conducted
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Confirm that this lesson was successfully conducted.
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
                <LessonStatusBadge status={lesson.statusName} size="sm" />
              </div>
              
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Calendar className="w-4 h-4" />
                <span>{formatLessonDateTime(lesson)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  <span className="truncate">{lesson.teacherName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{lesson.classroomName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-white text-sm font-medium">
              Lesson Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about how the lesson went..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 resize-none"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-white/50">
              {notes.length}/500 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Marking...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Mark as Conducted
                </div>
              )}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickConductLessonModal;

