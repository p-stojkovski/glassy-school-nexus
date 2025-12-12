import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, Calendar, User, MapPin, Repeat, Plus } from 'lucide-react';
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
    validationWarning,
    academicYearName,
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
    return `${dayName}, ${dateStr} | ${lesson.startTime} - ${lesson.endTime}`;
  };

  const isReasonValid = reason.trim().length >= 5;

  // Helper: add one hour with end-of-day cap to maintain same-day end > start
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

  const handleMakeupDataChange = (field: keyof MakeupLessonFormData, value: string) => {
    // Update state with guard: forbid end <= start by rejecting invalid end values
    setMakeupData(prev => {
      let next: MakeupLessonFormData = { ...prev, [field]: value } as MakeupLessonFormData;

      if (field === 'endTime') {
        const start = prev.startTime;
        if (start && value <= start) {
          // Reject invalid end; keep previous endTime
          next = { ...prev };
        }
      }

      return next;
    });

    // Manage errors inline
    if (field === 'endTime') {
      const start = makeupData.startTime;
      if (start && value <= start) {
        setMakeupErrors(prev => ({ ...prev, endTime: 'End time must be after start time' }));
      } else {
        if (makeupErrors.endTime) {
          setMakeupErrors(prev => ({ ...prev, endTime: '' }));
        }
      }
    } else if (field === 'startTime') {
      // Auto-fill end time to +1h (with cap) when start is set and end is empty or invalid
      setMakeupData(prev => {
        const end = prev.endTime;
        const needsAuto = !end || end <= value;
        if (needsAuto) {
          return { ...prev, startTime: value, endTime: addOneHourWithCap(value) };
        }
        return { ...prev, startTime: value };
      });
      // Clear any end-time error now that we've auto-adjusted if needed
      if (makeupErrors.endTime) {
        setMakeupErrors(prev => ({ ...prev, endTime: '' }));
      }
      // Clear startTime error if any
      if (makeupErrors.startTime) {
        setMakeupErrors(prev => ({ ...prev, startTime: '' }));
      }
    } else {
      // Clear error when user starts typing for other fields
      if (makeupErrors[field]) {
        setMakeupErrors(prev => ({ ...prev, [field]: '' }));
      }
    }
  };

  // Run conflict check when makeup lesson fields change
  useEffect(() => {
    if (createMakeup && makeupData.scheduledDate && makeupData.startTime && makeupData.endTime && lesson?.classId) {
      // Guard against invalid time range; clear conflicts and skip API call
      if (makeupData.endTime <= makeupData.startTime) {
        clearConflicts();
        return;
      }
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
      <DialogContent className="bg-white/10 backdrop-blur-md border-white/20 text-white max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="flex-shrink-0 px-4 py-4 border-b border-white/10">
          <DialogTitle className="text-white flex items-center gap-2 text-lg font-semibold">
            <XCircle className="w-5 h-5 text-red-400" />
            Cancel Lesson
          </DialogTitle>
          <DialogDescription className="text-white/60 text-sm mt-1">
            Cancel this lesson and add a short reason. You can optionally schedule a <strong>replacement lesson</strong> if you plan to compensate students.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Lesson Details */}
            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-semibold text-white text-base">{lesson.className}</h4>
                <LessonStatusBadge status={lesson.statusName} />
              </div>
              <div className="mt-1 text-white/70 text-sm flex flex-wrap items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-white/50" />
                <span>{formatLessonDateTime(lesson)}</span>
              </div>
              <div className="mt-1 text-white/70 text-sm flex flex-wrap items-center gap-3">
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

            {/* Cancellation reason */}
            <div>
              <Label htmlFor="reason" className="text-white text-sm font-medium">
                Cancellation reason <span className="text-red-400">*</span>
              </Label>
              <div className="mt-1">
                <Textarea
                  id="reason"
                  placeholder="Keep it short (e.g., 'Teacher unavailable')."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 resize-none"
                  rows={3}
                  maxLength={500}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-xs ${isReasonValid ? 'text-green-400' : 'text-red-400'}`}>
                  {isReasonValid ? '✓ Valid' : 'Minimum 5 characters'}
                </span>
                <span className="text-white/40 text-xs">
                  {reason.length}/500
                </span>
              </div>
            </div>

            {/* Makeup Lesson Option */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-makeup"
                  checked={createMakeup}
                  onCheckedChange={setCreateMakeup}
                  className="border-white/20 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500 h-5 w-5"
                />
                <Label 
                  htmlFor="create-makeup" 
                  className="text-white text-sm font-medium flex items-center gap-2 cursor-pointer"
                >
                  <Repeat className="w-4 h-4 text-purple-400" />
                  Schedule replacement lesson now
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
                      <Label className="text-white text-sm font-medium mb-2 block">
                        Quick Suggestions
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={suggestNextAvailableDay}
                          className="text-xs bg-white/10 hover:bg-yellow-500/20 hover:border-yellow-500/30 text-white border border-white/10 h-7 px-2"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Next weekday
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={suggestNextWeekSameTime}
                          className="text-xs bg-white/10 hover:bg-yellow-500/20 hover:border-yellow-500/30 text-white border border-white/10 h-7 px-2"
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
                    placeholder="End time"
                    min={makeupData.startTime}
                    required
                    error={makeupErrors.endTime}
                    disabled={!makeupData.startTime}
                  />
                      </div>
                    </div>

                    {/* Makeup Notes */}
                    <div>
                      <Label className="text-white text-sm font-medium">
                        Makeup Notes (Optional)
                      </Label>
                      <div className="mt-1">
                        <Textarea
                          placeholder="Add notes for the makeup lesson..."
                          value={makeupData.notes || ''}
                          onChange={(e) => handleMakeupDataChange('notes', e.target.value)}
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/50 resize-none"
                          rows={2}
                          maxLength={500}
                        />
                      </div>
                      <p className="text-xs text-white/40 mt-1">
                        {(makeupData.notes?.length || 0)}/500 characters
                      </p>
                    </div>

                    {/* Conflict Panel for Makeup Lesson */}
                    <ConflictPanel
                      conflicts={conflicts}
                      suggestions={suggestions}
                      checking={checkingConflicts}
                      error={conflictError}
                      validationWarning={validationWarning}
                      academicYearName={academicYearName}
                      onSuggestionClick={applySuggestion}
                      showProceedButton={false}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-white/10">
          <div className="flex gap-3">
            <Button
              onClick={handleConfirm}
              disabled={loading || !isReasonValid || (createMakeup && (!makeupData.scheduledDate || !makeupData.startTime || !makeupData.endTime || hasConflicts))}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
                  Resolve Conflicts
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  {createMakeup ? 'Cancel & Create Makeup' : 'Cancel Lesson'}
                </div>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
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

export default QuickCancelLessonModal;




