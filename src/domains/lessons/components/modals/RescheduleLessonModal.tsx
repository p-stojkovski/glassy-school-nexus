import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, MapPin, CalendarClock, ArrowRight } from 'lucide-react';
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
import { NativeDateInput, NativeTimeInput } from '@/components/common';
import { LessonResponse, RescheduleLessonRequest } from '@/types/api/lesson';
import LessonStatusBadge from '../LessonStatusBadge';
import useConflictPrecheck from '@/domains/lessons/hooks/useConflictPrecheck';
import ConflictPanel from '@/domains/lessons/components/ConflictPanel';

interface RescheduleLessonModalProps {
  lesson: LessonResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (lessonId: string, request: RescheduleLessonRequest) => Promise<void>;
  loading?: boolean;
}

const RescheduleLessonModal: React.FC<RescheduleLessonModalProps> = ({
  lesson,
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}) => {
  const [rescheduleData, setRescheduleData] = useState({
    newScheduledDate: '',
    newStartTime: '',
    newEndTime: '',
    rescheduleReason: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Conflict pre-checking
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
    setRescheduleData(prev => ({
      ...prev,
      newScheduledDate: suggestion.scheduledDate,
      newStartTime: suggestion.startTime,
      newEndTime: suggestion.endTime,
    }));
  });

  // Pre-fill with current lesson data when modal opens
  useEffect(() => {
    if (open && lesson) {
      setRescheduleData({
        newScheduledDate: lesson.scheduledDate,
        newStartTime: lesson.startTime,
        newEndTime: lesson.endTime,
        rescheduleReason: '',
      });
      setErrors({});
      clearConflicts();
    }
  }, [open, lesson, clearConflicts]);

  // Run conflict check when reschedule fields change
  useEffect(() => {
    if (rescheduleData.newScheduledDate && rescheduleData.newStartTime && rescheduleData.newEndTime && lesson?.classId) {
      // Guard against invalid time range
      if (rescheduleData.newEndTime <= rescheduleData.newStartTime) {
        clearConflicts();
        return;
      }
      runCheck({
        classId: lesson.classId,
        scheduledDate: rescheduleData.newScheduledDate,
        startTime: rescheduleData.newStartTime,
        endTime: rescheduleData.newEndTime,
        excludeLessonId: lesson?.id,
      });
    } else {
      clearConflicts();
    }
  }, [rescheduleData.newScheduledDate, rescheduleData.newStartTime, rescheduleData.newEndTime, lesson?.classId, lesson?.id, runCheck, clearConflicts]);

  const handleConfirm = async () => {
    if (!lesson) return;

    // Validate form
    const newErrors: Record<string, string> = {};
    if (!rescheduleData.newScheduledDate) newErrors.newScheduledDate = 'Date is required';
    if (!rescheduleData.newStartTime) newErrors.newStartTime = 'Start time is required';
    if (!rescheduleData.newEndTime) newErrors.newEndTime = 'End time is required';
    if (rescheduleData.newStartTime && rescheduleData.newEndTime && rescheduleData.newEndTime <= rescheduleData.newStartTime) {
      newErrors.newEndTime = 'End time must be after start time';
    }

    // Check if date is in the past
    const selectedDate = new Date(rescheduleData.newScheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      newErrors.newScheduledDate = 'Cannot reschedule to a past date';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const request: RescheduleLessonRequest = {
      newScheduledDate: rescheduleData.newScheduledDate,
      newStartTime: rescheduleData.newStartTime,
      newEndTime: rescheduleData.newEndTime,
      rescheduleReason: rescheduleData.rescheduleReason.trim() || undefined,
    };

    await onConfirm(lesson.id, request);
    handleClose();
  };

  const handleClose = () => {
    setRescheduleData({
      newScheduledDate: '',
      newStartTime: '',
      newEndTime: '',
      rescheduleReason: '',
    });
    setErrors({});
    clearConflicts();
    onOpenChange(false);
  };

  // Helper: add one hour with end-of-day cap
  const addOneHourWithCap = (timeString: string): string => {
    if (!timeString) return '';
    const [hoursStr, minutesStr] = timeString.split(':');
    const hours = Number(hoursStr);
    const minutes = Number(minutesStr);
    if (isNaN(hours) || isNaN(minutes)) return timeString;
    if (hours >= 23) return '23:59';
    const newHour = hours + 1;
    return `${newHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleFieldChange = (field: keyof typeof rescheduleData, value: string) => {
    setRescheduleData(prev => {
      let next = { ...prev, [field]: value };

      if (field === 'endTime') {
        const start = prev.newStartTime;
        if (start && value <= start) {
          // Reject invalid end
          next = { ...prev };
        }
      }

      return next;
    });

    // Manage errors
    if (field === 'newEndTime') {
      const start = rescheduleData.newStartTime;
      if (start && value <= start) {
        setErrors(prev => ({ ...prev, newEndTime: 'End time must be after start time' }));
      } else {
        setErrors(prev => ({ ...prev, newEndTime: '' }));
      }
    } else if (field === 'newStartTime') {
      // Auto-fill end time
      setRescheduleData(prev => {
        const end = prev.newEndTime;
        const needsAuto = !end || end <= value;
        if (needsAuto) {
          return { ...prev, newStartTime: value, newEndTime: addOneHourWithCap(value) };
        }
        return { ...prev, newStartTime: value };
      });
      setErrors(prev => ({ ...prev, newEndTime: '', newStartTime: '' }));
    } else {
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    }
  };

  const formatLessonDateTime = (lesson: LessonResponse) => {
    const date = new Date(lesson.scheduledDate);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
    return `${dayName}, ${dateStr} · ${lesson.startTime} - ${lesson.endTime}`;
  };

  // Quick suggestion buttons
  const suggestNextWeekSameTime = () => {
    if (!lesson) return;
    const originalDate = new Date(lesson.scheduledDate);
    const nextWeek = new Date(originalDate);
    nextWeek.setDate(originalDate.getDate() + 7);
    
    setRescheduleData(prev => ({
      ...prev,
      newScheduledDate: nextWeek.toISOString().split('T')[0],
      newStartTime: lesson.startTime,
      newEndTime: lesson.endTime,
    }));
  };

  const suggestTomorrowSameTime = () => {
    if (!lesson) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Skip weekends
    while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }
    
    setRescheduleData(prev => ({
      ...prev,
      newScheduledDate: tomorrow.toISOString().split('T')[0],
      newStartTime: lesson.startTime,
      newEndTime: lesson.endTime,
    }));
  };

  // Check if values have changed from original
  const hasChanges = lesson && (
    rescheduleData.newScheduledDate !== lesson.scheduledDate ||
    rescheduleData.newStartTime !== lesson.startTime ||
    rescheduleData.newEndTime !== lesson.endTime
  );

  const isFormValid = 
    rescheduleData.newScheduledDate && 
    rescheduleData.newStartTime && 
    rescheduleData.newEndTime && 
    hasChanges && 
    !hasConflicts;

  if (!lesson) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white/10 backdrop-blur-md border-white/20 text-white max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="flex-shrink-0 px-4 py-4 border-b border-white/10">
          <DialogTitle className="text-white flex items-center gap-2 text-lg font-semibold">
            <CalendarClock className="w-5 h-5 text-blue-400" />
            Reschedule Lesson
          </DialogTitle>
          <DialogDescription className="text-white/60 text-sm mt-1">
            Move this lesson to a different date and time.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Current Lesson Details */}
            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h4 className="font-semibold text-white text-base">{lesson.className}</h4>
                <LessonStatusBadge status={lesson.statusName} />
              </div>
              <div className="space-y-1.5">
                <div className="text-white/70 text-sm flex flex-wrap items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-white/50" />
                  <span className="font-medium">Current:</span>
                  <span>{formatLessonDateTime(lesson)}</span>
                </div>
                <div className="text-white/70 text-sm flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-white/50" />
                    {lesson.teacherName}
                  </span>
                  {lesson.classroomName && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-white/50" />
                      {lesson.classroomName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Arrow indicator */}
            <div className="flex justify-center">
              <ArrowRight className="w-5 h-5 text-blue-400 rotate-90" />
            </div>

            {/* New Schedule Form */}
            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium text-sm">New Schedule</span>
              </div>

              {/* Quick Suggestions */}
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">
                  Quick Options
                </Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={suggestTomorrowSameTime}
                    className="text-xs bg-white/10 hover:bg-white/20 text-white h-7 px-2"
                  >
                    <Calendar className="w-3 h-3 mr-1" />
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

              {/* New Date */}
              <div>
                <NativeDateInput
                  value={rescheduleData.newScheduledDate}
                  onChange={(date) => handleFieldChange('newScheduledDate', date)}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0]}
                  label="New Date"
                  placeholder="Select new date"
                  required
                  error={errors.newScheduledDate}
                  className="bg-white/5"
                />
              </div>

              {/* Time Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div>
                  <NativeTimeInput
                    value={rescheduleData.newStartTime}
                    onChange={(time) => handleFieldChange('newStartTime', time)}
                    label="Start Time"
                    placeholder="Select start time"
                    required
                    error={errors.newStartTime}
                    className="bg-white/5"
                  />
                </div>
                <div>
                  <NativeTimeInput
                    value={rescheduleData.newEndTime}
                    onChange={(time) => handleFieldChange('newEndTime', time)}
                    label="End Time"
                    placeholder="End time"
                    min={rescheduleData.newStartTime}
                    required
                    error={errors.newEndTime}
                    disabled={!rescheduleData.newStartTime}
                  />
                </div>
              </div>

              {/* Conflict Panel */}
              <ConflictPanel
                conflicts={conflicts}
                suggestions={suggestions}
                checking={checkingConflicts}
                error={conflictError}
                onSuggestionClick={applySuggestion}
                showProceedButton={false}
              />

              {/* No changes indicator */}
              {!hasChanges && rescheduleData.newScheduledDate && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 text-yellow-300 text-sm">
                  Please select a different date or time to reschedule.
                </div>
              )}
            </div>

            {/* Reason (Optional) */}
            <div>
              <Label htmlFor="reason" className="text-white text-sm font-medium">
                Reason (optional)
              </Label>
              <div className="mt-1">
                <Textarea
                  id="reason"
                  placeholder="Why is this lesson being rescheduled? (e.g., 'Student requested', 'Holiday conflict')"
                  value={rescheduleData.rescheduleReason}
                  onChange={(e) => handleFieldChange('rescheduleReason', e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 resize-none"
                  rows={2}
                  maxLength={500}
                />
              </div>
              <p className="text-xs text-white/40 mt-1">
                {rescheduleData.rescheduleReason.length}/500 characters
              </p>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-white/10">
          <div className="flex gap-3">
            <Button
              onClick={handleConfirm}
              disabled={loading || !isFormValid}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Rescheduling...
                </div>
              ) : hasConflicts ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-white/60 rounded-full" />
                  </div>
                  Resolve Conflicts
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-4 h-4" />
                  Reschedule Lesson
                </div>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 text-white/70 hover:text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleLessonModal;
