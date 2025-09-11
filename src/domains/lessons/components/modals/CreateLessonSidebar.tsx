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
import FriendlyDatePicker from '@/components/common/FriendlyDatePicker';
import FriendlyTimePicker from '@/components/common/FriendlyTimePicker';
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
  const [formData, setFormData] = useState<CreateLessonRequest>({
    classId,
    scheduledDate: '',
    startTime: '',
    endTime: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Track time confirmations
  const [startTimeConfirmed, setStartTimeConfirmed] = useState(false);
  const [endTimeConfirmed, setEndTimeConfirmed] = useState(false);
  
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
    // Apply suggestion to form data
    setFormData(prev => ({
      ...prev,
      scheduledDate: suggestion.scheduledDate,
      startTime: suggestion.startTime,
      endTime: suggestion.endTime,
    }));
    // Reset confirmation flags when suggestion is applied
    setStartTimeConfirmed(false);
    setEndTimeConfirmed(false);
  });

  const handleInputChange = (field: keyof CreateLessonRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Reset confirmation flags when times change
    if (field === 'startTime') {
      setStartTimeConfirmed(false);
    }
    if (field === 'endTime') {
      setEndTimeConfirmed(false);
    }
    
    // Clear conflicts when any field changes (will re-check on confirmation)
    clearConflicts();
  };

  // Helper function to add 1 hour to a time string
  const addOneHour = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const newHour = (hours + 1) % 24; // Handle 23:xx -> 00:xx rollover
    return `${newHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Manual conflict check when both times are confirmed
  const checkConflictsIfReady = () => {
    if (formData.scheduledDate && formData.startTime && formData.endTime && startTimeConfirmed && endTimeConfirmed) {
      runCheck({
        classId: formData.classId,
        scheduledDate: formData.scheduledDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
      });
    }
  };

  // Check conflicts when confirmation states change
  useEffect(() => {
    checkConflictsIfReady();
  }, [startTimeConfirmed, endTimeConfirmed, formData.scheduledDate]);

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
      scheduledDate: '',
      startTime: '',
      endTime: '',
      notes: '',
    });
    setErrors({});
    setStartTimeConfirmed(false);
    setEndTimeConfirmed(false);
    clearConflicts();
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto"
      >
        <SheetHeader className="pb-6 border-b border-white/20">
          <SheetTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-yellow-400" />
            Create New Lesson
          </SheetTitle>
          <p className="text-white/60 text-sm mt-2">
            Add a lesson to {className}
          </p>
        </SheetHeader>

        <div className="mt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date Field */}
            <div>
              <FriendlyDatePicker
                value={formData.scheduledDate}
                onChange={(date) => handleInputChange('scheduledDate', date)}
                minDate={new Date()}
                maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 2))}
                label="Date"
                placeholder="Select lesson date"
                required
                error={errors.scheduledDate}
              />
            </div>

            {/* Time Fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* Start Time */}
              <div>
                <FriendlyTimePicker
                  value={formData.startTime}
                  onChange={(time) => handleInputChange('startTime', time)}
                  onConfirm={(time) => {
                    setStartTimeConfirmed(true);
                    // Automatically set end time to 1 hour later if end time is empty
                    if (!formData.endTime) {
                      const endTime = addOneHour(time);
                      setFormData(prev => ({ ...prev, endTime }));
                      // Also mark end time as confirmed since it was auto-generated
                      setEndTimeConfirmed(true);
                    }
                  }}
                  label="Start Time"
                  placeholder="Select start time"
                  required
                  error={errors.startTime}
                />
              </div>

              {/* End Time */}
              <div>
                <FriendlyTimePicker
                  value={formData.endTime}
                  onChange={(time) => handleInputChange('endTime', time)}
                  onConfirm={(time) => {
                    setEndTimeConfirmed(true);
                  }}
                  label="End Time"
                  placeholder="Select end time"
                  required
                  error={errors.endTime}
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

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
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
            </div>
          </form>
          
          {/* Help Text */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-300 mb-1">Lesson Creation</h4>
                <p className="text-xs text-blue-200/80">
                  The lesson will be created with "Scheduled" status and inherit the class's teacher, 
                  subject, and classroom information automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CreateLessonSidebar;
