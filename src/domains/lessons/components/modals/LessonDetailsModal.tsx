import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  FileText, 
  ExternalLink,
  Plus,
  Repeat,
  Eye,
  Edit,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import FriendlyDatePicker from '@/components/common/FriendlyDatePicker';
import FriendlyTimePicker from '@/components/common/FriendlyTimePicker';
import { LessonResponse, MakeupLessonFormData } from '@/types/api/lesson';
import LessonStatusBadge from '../LessonStatusBadge';
import useConflictPrecheck from '@/domains/lessons/hooks/useConflictPrecheck';
import ConflictPanel from '@/domains/lessons/components/ConflictPanel';

interface LessonDetailsModalProps {
  lesson: LessonResponse | null;
  makeupLesson?: LessonResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewMakeupLesson?: (lessonId: string) => void;
  onCreateMakeupLesson?: (lessonId: string, makeupData: MakeupLessonFormData) => void;
  loading?: boolean;
}

const LessonDetailsModal: React.FC<LessonDetailsModalProps> = ({
  lesson,
  makeupLesson,
  open,
  onOpenChange,
  onViewMakeupLesson,
  onCreateMakeupLesson,
  loading = false,
}) => {
  const [isCreateMakeupOpen, setIsCreateMakeupOpen] = useState(false);
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

  const formatLessonDateTime = (lesson: LessonResponse) => {
    const date = new Date(lesson.scheduledDate);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric' 
    });
    return `${dayName}, ${dateStr}`;
  };

  const handleMakeupDataChange = (field: keyof MakeupLessonFormData, value: string) => {
    setMakeupData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (makeupErrors[field]) {
      setMakeupErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Run conflict check when makeup lesson fields change
  useEffect(() => {
    if (isCreateMakeupOpen && makeupData.scheduledDate && makeupData.startTime && makeupData.endTime && lesson?.classId) {
      runCheck({
        classId: lesson.classId,
        scheduledDate: makeupData.scheduledDate,
        startTime: makeupData.startTime,
        endTime: makeupData.endTime,
        excludeLessonId: lesson?.id, // Exclude the original lesson
      });
    } else {
      clearConflicts();
    }
  }, [isCreateMakeupOpen, makeupData.scheduledDate, makeupData.startTime, makeupData.endTime, lesson?.classId, lesson?.id, runCheck, clearConflicts]);

  const validateMakeupForm = (): boolean => {
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
    // Don't call setMakeupErrors here to avoid infinite re-renders
    return Object.keys(errors).length === 0;
  };

  const handleCreateMakeup = () => {
    if (!lesson || !onCreateMakeupLesson) return;
    
    // Validate form and set errors
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
    
    onCreateMakeupLesson(lesson.id, makeupData);
    setIsCreateMakeupOpen(false);
    setMakeupData({ scheduledDate: '', startTime: '', endTime: '', notes: '' });
    setMakeupErrors({});
    clearConflicts();
  };

  const handleViewMakeup = () => {
    if (!lesson?.makeupLessonId || !onViewMakeupLesson) return;
    onViewMakeupLesson(lesson.makeupLessonId);
  };

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

  if (!lesson) return null;

  const canCreateMakeup = lesson.statusName === 'Cancelled' && !lesson.makeupLessonId;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" />
              Lesson Details
            </DialogTitle>
          </DialogHeader>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header Info */}
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-white">{lesson.className}</h3>
                <LessonStatusBadge status={lesson.statusName} />
              </div>
              
              <div className="flex items-center gap-2 text-white/70 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">{formatLessonDateTime(lesson)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-white/70">
                <Clock className="w-4 h-4" />
                <span>{lesson.startTime} - {lesson.endTime}</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="text-sm text-white/60">Teacher</p>
                    <p className="text-white font-medium">{lesson.teacherName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-400" />
                  <div>
                    <p className="text-sm text-white/60">Classroom</p>
                    <p className="text-white font-medium">{lesson.classroomName}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-white/60">Subject</p>
                  <p className="text-white font-medium">{lesson.subjectName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-white/60">Created</p>
                  <p className="text-white font-medium">
                    {new Date(lesson.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {lesson.notes && (
              <>
                <Separator className="bg-white/10" />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-yellow-400" />
                    <p className="text-sm font-medium text-white/80">Notes</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                    <p className="text-white/90 text-sm leading-relaxed">{lesson.notes}</p>
                  </div>
                </div>
              </>
            )}

            {/* Cancellation Reason */}
            {lesson.cancellationReason && (
              <>
                <Separator className="bg-white/10" />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <X className="w-4 h-4 text-red-400" />
                    <p className="text-sm font-medium text-white/80">Cancellation Reason</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                    <p className="text-red-200 text-sm leading-relaxed">{lesson.cancellationReason}</p>
                  </div>
                </div>
              </>
            )}

            {/* Makeup Lesson Section */}
            {(lesson.makeupLessonId || canCreateMakeup) && (
              <>
                <Separator className="bg-white/10" />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Repeat className="w-4 h-4 text-purple-400" />
                    <p className="text-sm font-medium text-white/80">Makeup Lesson</p>
                  </div>
                  
                  {lesson.makeupLessonId ? (
                    <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-200 text-sm mb-1">
                            Makeup lesson has been scheduled
                          </p>
                          {makeupLesson && (
                            <div className="text-white/70 text-xs">
                              {formatLessonDateTime(makeupLesson)} • {makeupLesson.startTime} - {makeupLesson.endTime}
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={handleViewMakeup}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Makeup
                        </Button>
                      </div>
                    </div>
                  ) : canCreateMakeup && (
                    <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-200 text-sm mb-1">
                            No makeup lesson scheduled
                          </p>
                          <p className="text-white/60 text-xs">
                            Create a makeup lesson for this cancelled lesson
                          </p>
                        </div>
                        <Button
                          onClick={() => setIsCreateMakeupOpen(true)}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Makeup
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Create Makeup Lesson Sheet */}
      <Sheet open={isCreateMakeupOpen} onOpenChange={setIsCreateMakeupOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-gradient-to-br from-gray-900/95 via-purple-900/90 to-blue-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto"
        >
          <SheetHeader className="pb-6 border-b border-white/20">
            <SheetTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Repeat className="w-5 h-5 text-purple-400" />
              Create Makeup Lesson
            </SheetTitle>
            <p className="text-white/60 text-sm mt-2">
              Schedule a makeup lesson for {lesson?.className}
            </p>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Original Lesson Info */}
            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
              <p className="text-sm text-white/60 mb-1">Original Lesson</p>
              <p className="text-white font-medium">
                {lesson && formatLessonDateTime(lesson)} • {lesson?.startTime} - {lesson?.endTime}
              </p>
            </div>

            {/* Quick Suggestions */}
            <div className="space-y-2">
              <Label className="text-white text-sm font-medium">Quick Suggestions</Label>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={suggestNextWeekSameTime}
                className="w-full justify-start bg-white/10 hover:bg-white/20 text-white"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Next week, same day & time
              </Button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateMakeup(); }} className="space-y-4">
              {/* Date Field */}
              <div>
                <FriendlyDatePicker
                  value={makeupData.scheduledDate}
                  onChange={(date) => handleMakeupDataChange('scheduledDate', date)}
                  minDate={new Date()}
                  maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
                  label="Makeup Date"
                  placeholder="Select makeup date"
                  required
                  error={makeupErrors.scheduledDate}
                />
              </div>

              {/* Time Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FriendlyTimePicker
                    value={makeupData.startTime}
                    onChange={(time) => handleMakeupDataChange('startTime', time)}
                    label="Start Time"
                    placeholder="Start time"
                    required
                    error={makeupErrors.startTime}
                  />
                </div>
                <div>
                  <FriendlyTimePicker
                    value={makeupData.endTime}
                    onChange={(time) => handleMakeupDataChange('endTime', time)}
                    label="End Time"
                    placeholder="End time"
                    minTime={makeupData.startTime}
                    required
                    error={makeupErrors.endTime}
                  />
                </div>
              </div>

              {/* Notes Field */}
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">
                  Notes (Optional)
                </Label>
                <Textarea
                  placeholder="Add notes for the makeup lesson..."
                  value={makeupData.notes || ''}
                  onChange={(e) => handleMakeupDataChange('notes', e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 resize-none"
                  rows={3}
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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreateMakeupOpen(false)}
                  disabled={loading}
                  className="flex-1 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !makeupData.scheduledDate || !makeupData.startTime || !makeupData.endTime || hasConflicts}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Creating...
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
                      <Plus className="w-4 h-4" />
                      Create Makeup
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default LessonDetailsModal;
