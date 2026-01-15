import React, { useState, useEffect } from 'react';
import { FileText, Plus } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DatePicker, TimeCombobox } from '@/components/common';
import { CreateLessonRequest } from '@/types/api/lesson';
import useConflictPrecheck from '@/domains/lessons/hooks/useConflictPrecheck';
import ConflictPanel from '@/domains/lessons/components/ConflictPanel';

interface CreateLessonSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (lessonData: CreateLessonRequest) => void;
  classId: string;
  className: string;
  loading?: boolean;
}

const CreateLessonSidebar: React.FC<CreateLessonSidebarProps> = ({
  open,
  onOpenChange,
  onSubmit,
  classId,
  className,
  loading = false,
}) => {
  // Get today's date as ISO string (YYYY-MM-DD)
  const getTodayISOString = () => new Date().toISOString().split('T')[0];

  // Default start time (09:00) and end time (10:00)
  const DEFAULT_START_TIME = '09:00';
  const DEFAULT_END_TIME = '10:00';

  const [formData, setFormData] = useState<CreateLessonRequest>({
    classId,
    scheduledDate: getTodayISOString(),
    startTime: DEFAULT_START_TIME,
    endTime: DEFAULT_END_TIME,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Track End Time edit/auto state for UX
  const [endTimeTouched, setEndTimeTouched] = useState(false);
  const [endTimeAuto, setEndTimeAuto] = useState(false);
  
  // Conflict pre-checking
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
    // Apply suggestion to form data
    setFormData(prev => ({
      ...prev,
      scheduledDate: suggestion.scheduledDate,
      startTime: suggestion.startTime,
      endTime: suggestion.endTime,
    }));
  });

  const handleInputChange = (field: keyof CreateLessonRequest, value: string) => {
    setFormData(prev => {
      const next: CreateLessonRequest = { ...prev, [field]: value } as CreateLessonRequest;

      if (field === 'startTime') {
        const newStart = value;
        const hasEnd = !!prev.endTime && prev.endTime.trim().length > 0;
        const computedAutoEnd = addOneHourWithCap(newStart);

        // Decide whether to auto-set or adjust end time
        const shouldAutoSet = !hasEnd || endTimeAuto || !endTimeTouched || (hasEnd && prev.endTime <= newStart);
        if (shouldAutoSet) {
          next.endTime = computedAutoEnd;
          // Update flags below after setFormData returns
        }
      }

      if (field === 'endTime') {
        // Strictly forbid end <= start by not updating state when invalid
        const start = prev.startTime;
        if (start && value <= start) {
          // Keep previous valid endTime; error will be set below outside setState
          next.endTime = prev.endTime;
        }
      }

      return next;
    });

    // Update flags based on field
    if (field === 'startTime') {
      const newStart = value;
      const shouldMarkAuto = !formData.endTime || endTimeAuto || !endTimeTouched || (formData.endTime <= newStart);
      if (shouldMarkAuto) {
        setEndTimeAuto(true);
        setEndTimeTouched(false);
      }
      // Clear any existing end time error after start change (we auto-adjust end)
      if (errors.endTime) {
        setErrors(prev => ({ ...prev, endTime: '' }));
      }
    }
    if (field === 'endTime') {
      const start = formData.startTime;
      if (start && value <= start) {
        // Set error and do not flip flags to auto=false/touched=true if we didn't accept the value
        setErrors(prev => ({ ...prev, endTime: 'End time must be after start time' }));
      } else {
        setEndTimeTouched(true);
        setEndTimeAuto(false);
        // Clear error if previously set
        if (errors.endTime) {
          setErrors(prev => ({ ...prev, endTime: '' }));
        }
      }
    }

    // Clear field error when user starts typing (except for the special endTime case handled above)
    if (field !== 'endTime' && errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Do NOT clear conflicts here; the effect below manages clearing/checking to avoid flicker
  };

  // Helper function to add 1 hour to a time string with end-of-day cap
  const addOneHourWithCap = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':').map(Number);
    // If adding one hour would cross midnight, cap at 23:59 to maintain end > start on same day
    if (hours >= 23) {
      return '23:59';
    }
    const newHour = hours + 1;
    return `${newHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Auto-check conflicts whenever date/start/end change and are valid
  useEffect(() => {
    // Don't precheck conflicts when the sidebar is closed
    if (!open) {
      clearConflicts();
      return;
    }

    const { classId: cid, scheduledDate, startTime, endTime } = formData;
    // Incomplete inputs: clear conflicts and skip
    if (!cid || !scheduledDate || !startTime || !endTime) {
      clearConflicts();
      return;
    }
    // Invalid time ordering: clear conflicts and skip
    if (endTime <= startTime) {
      clearConflicts();
      return;
    }
    // Trigger debounced conflict check
    runCheck({
      classId: cid,
      scheduledDate,
      startTime,
      endTime,
    });
  }, [open, formData.classId, formData.scheduledDate, formData.startTime, formData.endTime, runCheck, clearConflicts]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Date is required';
    } else {
      // Check if date is in the past
      const selectedDate = new Date(formData.scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.scheduledDate = 'Cannot schedule lessons in the past';
      }
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    } else if (formData.startTime && formData.endTime <= formData.startTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const lessonData: CreateLessonRequest = {
      classId: formData.classId,
      scheduledDate: formData.scheduledDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      notes: formData.notes?.trim() || undefined,
    };

    onSubmit(lessonData);
  };

  const resetForm = () => {
    setFormData({
      classId,
      scheduledDate: getTodayISOString(),
      startTime: DEFAULT_START_TIME,
      endTime: DEFAULT_END_TIME,
      notes: '',
    });
    setErrors({});
    clearConflicts();
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  // Get maximum date (2 years from now)
  const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 bg-white/10 backdrop-blur-md border border-white/20 text-white"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-4 py-4 border-b border-white/10">
            <SheetTitle className="flex items-center gap-2 text-white text-lg font-semibold">
              <Plus className="w-5 h-5 text-yellow-400" />
              Create New Lesson
            </SheetTitle>
            <p className="text-white/60 text-sm mt-1">
              Add a lesson to {className}
            </p>
          </SheetHeader>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              <form id="create-lesson-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Date Field */}
            <div>
              <DatePicker
                value={formData.scheduledDate}
                onChange={(date) => handleInputChange('scheduledDate', date)}
                max={maxDate}
                label="Date"
                placeholder="Select lesson date"
                required
                error={errors.scheduledDate}
                disablePastDates
              />
            </div>

            {/* Time Fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* Start Time */}
              <div>
                <TimeCombobox
                  value={formData.startTime}
                  onChange={(time) => handleInputChange('startTime', time)}
                  label="Start Time *"
                  placeholder="9:00 AM"
                  error={errors.startTime}
                  startHour={7}
                  endHour={21}
                  intervalMinutes={30}
                />
              </div>

              {/* End Time */}
              <div>
                <TimeCombobox
                  value={formData.endTime}
                  onChange={(time) => handleInputChange('endTime', time)}
                  label="End Time *"
                  placeholder="10:00 AM"
                  error={errors.endTime}
                  disabled={!formData.startTime}
                  min={formData.startTime || undefined}
                  startHour={7}
                  endHour={21}
                  intervalMinutes={30}
                />
              </div>
            </div>

            {/* Conflict Panel */}
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

            {/* Notes Field */}
            <div>
              <Label htmlFor="notes" className="text-white text-sm font-medium">
                Notes
              </Label>
              <div className="mt-1 relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText className="h-4 w-4 text-white/50" />
                </div>
                <Textarea
                  id="notes"
                  placeholder="Add any notes for this lesson..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 pl-10 resize-none"
                  rows={4}
                  maxLength={1000}
                />
              </div>
              <p className="text-xs text-white/40 mt-1">
                {formData.notes?.length || 0}/1000 characters
              </p>
            </div>

              </form>
            </div>
          </ScrollArea>

          {/* Footer Actions - Pinned at bottom */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-3">
              <Button
                type="submit"
                form="create-lesson-form"
                disabled={loading || hasConflicts}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : hasConflicts ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/20 rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-black/60 rounded-full" />
                    </div>
                    Resolve Conflicts
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Lesson
                  </div>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CreateLessonSidebar;

