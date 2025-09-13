import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, Calendar, User, MapPin, AlertTriangle, Repeat, Clock, Plus } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { NativeDateInput, NativeTimeInput } from '@/components/common';
import { LessonResponse, MakeupLessonFormData } from '@/types/api/lesson';
import LessonStatusBadge from '../LessonStatusBadge';
import useConflictPrecheck from '@/domains/lessons/hooks/useConflictPrecheck';
import ConflictPanel from '@/domains/lessons/components/ConflictPanel';

interface QuickCancelLessonModalProps {
  lesson: LessonResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (lessonId: string, reason: string, makeupData?: MakeupLessonFormData) => void;
  loading?: boolean;
}

const QuickCancelLessonModal: React.FC<QuickCancelLessonModalProps> = ({
  lesson,
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}) => {
  const [reason, setReason] = useState('');
  const [createMakeup, setCreateMakeup] = useState(false);
  const [makeupData, setMakeupData] = useState<MakeupLessonFormData>({
    scheduledDate: '',
    startTime: '',
    endTime: '',
    notes: '',
  });
  const [makeupErrors, setMakeupErrors] = useState<Record<string, string>>({});

  // Conflict pre-checking for makeup lesson
  const {
    conflicts,
    checking: checkingConflicts,
    error: conflictError,
    hasConflicts,
    suggestions,
    runCheck,
    clearConflicts,
    applySuggestion,
  } = useConflictPrecheck((suggestion) => {
    // Apply suggestion to makeup data
    setMakeupData(prev => ({
      ...prev,
      scheduledDate: suggestion.scheduledDate,
      startTime: suggestion.startTime,
      endTime: suggestion.endTime,
    }));
  });

  const handleConfirm = () => {
    if (!lesson || !reason.trim()) return;
    
    if (createMakeup) {
      // Validate makeup form and set errors
      const errors: Record<string, string> = {};
      if (!makeupData.scheduledDate) errors.scheduledDate = 'Date is required';
      if (!makeupData.startTime) errors.startTime = 'Start time is required';
      if (!makeupData.endTime) errors.endTime = 'End time is required';
      if (
        makeupData.startTime &&
        makeupData.endTime &&
        makeupData.endTime <= makeupData.startTime
      ) {
        errors.endTime = 'End time must be after start time';
      }
      
      setMakeupErrors(errors);
      
      if (Object.keys(errors).length > 0) return;
    }

    const payload = createMakeup ? makeupData : undefined;
    onConfirm(lesson.id, reason.trim(), payload);
    // Reset form
    setReason('');
    setCreateMakeup(false);
    setMakeupData({ scheduledDate: '', startTime: '', endTime: '', notes: '' });
    setMakeupErrors({});
  };

  const handleCancel = () => {
    setReason('');
    setCreateMakeup(false);
    setMakeupData({ scheduledDate: '', startTime: '', endTime: '', notes: '' });
    setMakeupErrors({});
    clearConflicts();
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

  const isReasonValid = reason.trim().length >= 5;

  const handleMakeupDataChange = (field: keyof MakeupLessonFormData, value: string) => {
    setMakeupData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (makeupErrors[field]) {
      setMakeupErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Run conflict check when makeup lesson fields change
  useEffect(() => {
    if (createMakeup && makeupData.scheduledDate && makeupData.startTime && makeupData.endTime && lesson?.classId) {
      runCheck({
        classId: lesson.classId,
        scheduledDate: makeupData.scheduledDate,
        startTime: makeupData.startTime,
        endTime: makeupData.endTime,
        excludeLessonId: lesson?.id, // Exclude the lesson being cancelled
      });
    } else {
      clearConflicts();
    }
  }, [createMakeup, makeupData.scheduledDate, makeupData.startTime, makeupData.endTime, lesson?.classId, lesson?.id, runCheck, clearConflicts]);

  const suggestNextWeekSameTime = () => {
    if (!lesson) return;
    const originalDate = new Date(lesson.scheduledDate);
    const nextWeek = new Date(originalDate);
    nextWeek.setDate(originalDate.getDate() + 7);
    
    setMakeupData(prev => ({
      ...prev,
      scheduledDate: nextWeek.toISOString().split('T')[0],
      startTime: lesson.startTime,
      endTime: lesson.endTime,
    }));
  };

  const suggestNextAvailableDay = () => {
    if (!lesson) return;
    const originalDate = new Date(lesson.scheduledDate);
    const nextDay = new Date(originalDate);
    nextDay.setDate(originalDate.getDate() + 1);
    
    // Skip to next weekday if weekend
    while (nextDay.getDay() === 0 || nextDay.getDay() === 6) {
      nextDay.setDate(nextDay.getDate() + 1);
    }
    
    setMakeupData(prev => ({
      ...prev,
      scheduledDate: nextDay.toISOString().split('T')[0],
      startTime: lesson.startTime,
      endTime: lesson.endTime,
    }));
  };

  if (!lesson) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-slate-900/95 backdrop-blur-xl border-white/20 text-white max-w-3xl h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="flex-shrink-0 px-6 pt-5 pb-4 border-b border-white/10">
          <DialogTitle className="text-white flex items-center gap-2 text-xl">
            <XCircle className="w-6 h-6 text-red-400" />
            Cancel Lesson
          </DialogTitle>
          <DialogDescription className="text-white/70 text-sm mt-2">
            Provide a reason for cancelling this lesson. You can optionally schedule a makeup lesson.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Lesson Details */}
            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white text-lg">{lesson.className}</h4>
                  <LessonStatusBadge status={lesson.statusName} />
                </div>
                
                <div className="flex items-center gap-3 text-white/80">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="font-medium">{formatLessonDateTime(lesson)}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 text-white/70">
                    <User className="w-4 h-4 text-green-400" />
                    <div>
                      <p className="text-xs text-white/50 uppercase tracking-wide">Teacher</p>
                      <p className="font-medium text-sm">{lesson.teacherName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-white/70">
                    <MapPin className="w-4 h-4 text-yellow-400" />
                    <div>
                      <p className="text-xs text-white/50 uppercase tracking-wide">Classroom</p>
                      <p className="font-medium text-sm">{lesson.classroomName}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cancellation Reason */}
            <div>
              <div>
                <Label htmlFor="reason" className="text-white font-medium mb-2 block">
                  Cancellation Reason <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a reason for cancelling this lesson..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 resize-none min-h-[80px]"
                  rows={3}
                  maxLength={500}
                />
                <div className="flex justify-between mt-2">
                  <span className={`text-xs ${isReasonValid ? 'text-green-400' : 'text-red-400'}`}>
                    {isReasonValid ? '✓ Reason is valid' : 'Minimum 5 characters required'}
                  </span>
                  <span className="text-white/50 text-xs">
                    {reason.length}/500 characters
                  </span>
                </div>
              </div>
            </div>

            {/* Makeup Lesson Option */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="create-makeup"
                  checked={createMakeup}
                  onCheckedChange={setCreateMakeup}
                  className="border-white/20 data-[state=checked]:bg-purple-600 h-5 w-5"
                />
                <Label 
                  htmlFor="create-makeup" 
                  className="text-white font-medium flex items-center gap-2 cursor-pointer"
                >
                  <Repeat className="w-4 h-4 text-purple-400" />
                  Schedule makeup lesson now
                </Label>
              </div>
              
              <AnimatePresence>
                {createMakeup && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg space-y-3"
                  >
                    {/* Quick Suggestions */}
                    <div>
                      <Label className="text-white font-medium mb-2 block">
                        Quick Suggestions
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={suggestNextAvailableDay}
                          className="text-xs bg-white/10 hover:bg-white/20 text-white h-7 px-2"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Next weekday
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={suggestNextWeekSameTime}
                          className="text-xs bg-white/10 hover:bg-white/20 text-white h-7 px-2"
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          Next week
                        </Button>
                      </div>
                    </div>

                    {/* Makeup Date */}
                    <div>
                      <NativeDateInput
                        value={makeupData.scheduledDate}
                        onChange={(date) => handleMakeupDataChange('scheduledDate', date)}
                        min={new Date().toISOString().split('T')[0]}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}
                        label="Makeup Date"
                        placeholder="Select makeup date"
                        required
                        error={makeupErrors.scheduledDate}
                        className="bg-white/5"
                      />
                    </div>

                    {/* Time Fields */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div>
                        <NativeTimeInput
                          value={makeupData.startTime}
                          onChange={(time) => handleMakeupDataChange('startTime', time)}
                          label="Start Time"
                          placeholder="Select start time"
                          required
                          error={makeupErrors.startTime}
                          className="bg-white/5"
                        />
                      </div>
                      <div>
                        <NativeTimeInput
                          value={makeupData.endTime}
                          onChange={(time) => handleMakeupDataChange('endTime', time)}
                          label="End Time"
                          placeholder="Select end time"
                          min={makeupData.startTime}
                          required
                          error={makeupErrors.endTime}
                          className="bg-white/5"
                        />
                      </div>
                    </div>

                    {/* Makeup Notes */}
                    <div>
                      <Label className="text-white text-sm font-medium mb-2 block">
                        Makeup Notes (Optional)
                      </Label>
                      <Textarea
                        placeholder="Add notes for the makeup lesson..."
                        value={makeupData.notes || ''}
                        onChange={(e) => handleMakeupDataChange('notes', e.target.value)}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/50 resize-none"
                        rows={2}
                        maxLength={500}
                      />
                      <p className="text-xs text-white/50 mt-1">
                        {(makeupData.notes?.length || 0)}/500 characters
                      </p>
                    </div>

                    {/* Conflict Panel for Makeup Lesson */}
                    <ConflictPanel
                      conflicts={conflicts}
                      suggestions={suggestions}
                      checking={checkingConflicts}
                      error={conflictError}
                      onSuggestionClick={applySuggestion}
                      showProceedButton={false}
                      className="bg-purple-900/30 border-purple-500/40"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-white/10 bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-slate-900/95">
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 text-white hover:bg-white/10"
            >
              Keep Lesson
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading || !isReasonValid || (createMakeup && (!makeupData.scheduledDate || !makeupData.startTime || !makeupData.endTime || hasConflicts))}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Cancelling...
                </div>
              ) : (createMakeup && hasConflicts) ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-white/60 rounded-full" />
                  </div>
                  Resolve Makeup Conflicts
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  {createMakeup ? 'Cancel & Create Makeup' : 'Cancel Lesson'}
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickCancelLessonModal;

