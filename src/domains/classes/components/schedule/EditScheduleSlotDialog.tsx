import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Trash2, AlertTriangle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TimeCombobox } from '@/components/common';
import SemestersDropdown from '@/components/common/SemestersDropdown';
import { classApiService } from '@/services/classApiService';
import { academicCalendarApiService } from '@/services/academicCalendarApiService';
import { UpdateScheduleSlotRequest } from '@/types/api/scheduleSlot';
import { ScheduleSlotDto, ClassBasicInfoResponse } from '@/types/api/class';
import { ExistingScheduleOverlapInfo, ScheduleConflictInfo } from '@/types/api/scheduleValidation';
import { AcademicSemesterResponse } from '@/types/api/academic-calendar';
import { toast } from 'sonner';

interface EditScheduleSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  classData: ClassBasicInfoResponse;
  slot: ScheduleSlotDto | null;
  onSuccess: () => void;
  onDelete?: (slot: ScheduleSlotDto) => void;
}

interface FormData {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  updateFutureLessons: boolean;
  semesterId: string | null;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function EditScheduleSlotDialog({ open, onOpenChange, classId, classData, slot, onSuccess, onDelete }: EditScheduleSlotDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [conflictInfo, setConflictInfo] = useState<ScheduleConflictInfo | null>(null);
  const [existingOverlap, setExistingOverlap] = useState<ExistingScheduleOverlapInfo | null>(null);
  
  // Semester state
  const [semesters, setSemesters] = useState<AcademicSemesterResponse[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  const [loadingSemesters, setLoadingSemesters] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      updateFutureLessons: true,
      semesterId: null,
    },
  });

  // Update form when slot changes
  useEffect(() => {
    if (slot) {
      form.reset({
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        updateFutureLessons: true,
        semesterId: slot.semesterId || null,
      });
      setSelectedSemesterId(slot.semesterId || null);
      // Clear validation state when slot changes
      setConflictInfo(null);
      setExistingOverlap(null);
    }
  }, [slot, form]);

  // Fetch semesters for the class's academic year
  useEffect(() => {
    if (!classData?.academicYearId || !open) return;

    const fetchSemesters = async () => {
      setLoadingSemesters(true);
      try {
        const semestersList = await academicCalendarApiService.getSemestersForYear(
          classData.academicYearId
        );
        // Filter out deleted semesters
        const activeSemesters = semestersList.filter((s) => !s.isDeleted);
        setSemesters(activeSemesters);
      } catch (err) {
        console.error('Failed to load semesters:', err);
      } finally {
        setLoadingSemesters(false);
      }
    };

    fetchSemesters();
  }, [classData?.academicYearId, open]);

  // Sync selectedSemesterId with form
  useEffect(() => {
    form.setValue('semesterId', selectedSemesterId);
  }, [selectedSemesterId, form]);

  const watchedDay = form.watch('dayOfWeek');
  const watchedStart = form.watch('startTime');
  const watchedEnd = form.watch('endTime');

  const timesChanged = slot
    ? watchedStart !== slot.startTime || watchedEnd !== slot.endTime
    : false;

  const dayChanged = slot ? watchedDay !== slot.dayOfWeek : false;
  const scheduleChanged = timesChanged || dayChanged;

  // Validate schedule changes when day/time changes
  useEffect(() => {
    if (!slot || !scheduleChanged || !open) {
      setConflictInfo(null);
      setExistingOverlap(null);
      return;
    }

    const validateChanges = async () => {
      setIsValidating(true);
      try {
        const response = await classApiService.validateScheduleChanges(classId, {
          newSchedule: [{
            dayOfWeek: watchedDay,
            startTime: watchedStart,
            endTime: watchedEnd,
          }],
        });

        // Filter out overlaps that are the current slot being edited (same slotId)
        const filteredOverlaps = response.existingScheduleOverlap?.overlaps.filter(
          overlap => overlap.scheduleSlotId !== slot.id
        ) || [];

        setConflictInfo(response.conflictInfo);
        setExistingOverlap(filteredOverlaps.length > 0 
          ? { hasOverlap: true, overlaps: filteredOverlaps }
          : null
        );
      } catch (error) {
        console.error('Failed to validate schedule changes:', error);
      } finally {
        setIsValidating(false);
      }
    };

    // Debounce the validation
    const timeoutId = setTimeout(validateChanges, 500);
    return () => clearTimeout(timeoutId);
  }, [classId, slot, watchedDay, watchedStart, watchedEnd, scheduleChanged, open]);

  const hasConflicts = conflictInfo?.hasConflicts || false;
  const hasOverlaps = existingOverlap?.hasOverlap || false;

  const handleSubmit = async (data: FormData) => {
    if (!slot?.id) return;

    setIsSubmitting(true);

    try {
      const request: UpdateScheduleSlotRequest = {
        dayOfWeek: data.dayOfWeek as any,
        startTime: data.startTime,
        endTime: data.endTime,
        semesterId: data.semesterId || null,
        updateFutureLessons: data.updateFutureLessons,
      };

      const response = await classApiService.updateScheduleSlot(classId, slot.id, request);

      // Show success message
      if (response.updatedFutureLessonsCount > 0) {
        toast.success(
          `Schedule updated! ${response.updatedFutureLessonsCount} future lesson(s) updated with new times.`,
          { duration: 6000 }
        );
      } else {
        toast.success('Schedule slot updated successfully');
      }

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update schedule slot');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!slot) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-yellow-400" />
            Edit session
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Update the schedule slot details
          </DialogDescription>
        </DialogHeader>



        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Day of Week */}
            <FormField
              control={form.control}
              name="dayOfWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Day of Week</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-900 border-white/20">
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day} value={day} className="text-white hover:bg-white/10 focus:bg-white/10">
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <TimeCombobox
                      label="Start Time"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="9:00 AM"
                      startHour={7}
                      endHour={21}
                      intervalMinutes={30}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <TimeCombobox
                      label="End Time"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="10:00 AM"
                      min={form.watch('startTime')}
                      startHour={7}
                      endHour={21}
                      intervalMinutes={30}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Semester Assignment */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel className="text-white text-sm font-medium">Change Semester Assignment</FormLabel>
                {selectedSemesterId ? (
                  <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/50">
                    {semesters.find(s => s.id === selectedSemesterId)?.name || 'Semester'}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-purple-400 border-purple-400/50">
                    All Semesters
                  </Badge>
                )}
              </div>
              <SemestersDropdown
                academicYearId={classData?.academicYearId}
                value={selectedSemesterId || ''}
                onValueChange={(id) => setSelectedSemesterId(id || null)}
                placeholder="All semesters (Global)"
                disabled={loadingSemesters || !classData?.academicYearId}
                showDateRangeInfo={true}
                onError={(message) => {
                  console.error('Failed to load semesters:', message);
                }}
              />
              {!classData?.academicYearId && (
                <div className="text-xs text-red-300 mt-2">
                  This class has no academic year. Semester selection is disabled.
                </div>
              )}
              {classData?.academicYearId && !loadingSemesters && semesters.length === 0 && (
                <div className="text-xs text-white/60 mt-2">
                  No semesters defined for this academic year. Create semesters in Academic Calendar settings.
                </div>
              )}
              {selectedSemesterId && selectedSemesterId !== (slot?.semesterId || null) && (
                <div className="text-xs text-amber-300 flex items-start gap-2 mt-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>This schedule will no longer apply to other semesters</span>
                </div>
              )}
              {!selectedSemesterId && (slot?.semesterId || null) && (
                <div className="text-xs text-amber-300 flex items-start gap-2 mt-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>This schedule will apply to all semesters</span>
                </div>
              )}
              {!!slot?.pastLessonCount && slot.pastLessonCount > 0 && (
                <div className="text-xs text-white/60 flex items-start gap-2 mt-1">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{slot.pastLessonCount} past lesson{slot.pastLessonCount !== 1 ? 's' : ''} will remain associated with their original semester</span>
                </div>
              )}
            </div>

            {/* Update Future Lessons Option */}
            {timesChanged && (
              <div className="border border-amber-500/30 bg-amber-500/10 p-3 rounded-md">
                <FormField
                  control={form.control}
                  name="updateFutureLessons"
                  render={({ field }) => (
                    <FormItem className="flex items-start gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-1 border-white/30 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                        />
                      </FormControl>
                      <div className="flex-1">
                        <FormLabel className="font-medium cursor-pointer text-white">
                          Update future lessons with new times
                        </FormLabel>
                        <p className="text-sm text-white/60 mt-1">
                          Future lessons will be updated to match the new schedule times. Past lessons remain unchanged.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Conflict Warnings */}
            {scheduleChanged && !isValidating && (hasConflicts || hasOverlaps) && (
              <div className="space-y-3">
                {/* Existing Schedule Overlap Warning */}
                {hasOverlaps && existingOverlap && (
                  <Alert className="bg-amber-500/10 border-amber-500/30">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <AlertDescription className="text-white/80 text-sm">
                      <span className="font-medium text-amber-300">Schedule overlap detected:</span>
                      {existingOverlap.overlaps.map((overlap) => (
                        <div key={overlap.scheduleSlotId} className="mt-1">
                          <span className="text-white/90">
                            {overlap.dayOfWeek} {overlap.startTime} - {overlap.endTime}
                          </span>
                          <span className="text-xs ml-2 text-white/60">
                            ({overlap.futureLessonCount} future lesson{overlap.futureLessonCount !== 1 ? 's' : ''})
                          </span>
                        </div>
                      ))}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Teacher/Classroom/Class Conflicts */}
                {hasConflicts && conflictInfo && (
                  <Alert className="bg-red-500/10 border-red-500/30">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-white/80 text-sm">
                      <span className="font-medium text-red-300">Scheduling conflicts found:</span>
                      {conflictInfo.conflicts.slice(0, 3).map((conflict, index) => (
                        <div key={index} className="mt-1">
                          <span className="text-white/90">
                            {conflict.conflictType === 'teacher_conflict' && 'Teacher busy'}
                            {conflict.conflictType === 'classroom_conflict' && 'Classroom busy'}
                            {conflict.conflictType === 'class_conflict' && 'Class conflict'}
                          </span>
                          <span className="text-xs ml-2 text-white/60">
                            ({conflict.instances.length} instance{conflict.instances.length !== 1 ? 's' : ''})
                          </span>
                        </div>
                      ))}
                      {conflictInfo.conflicts.length > 3 && (
                        <p className="text-xs text-white/50 mt-1">
                          +{conflictInfo.conflicts.length - 3} more conflicts
                        </p>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Validation Loading */}
            {scheduleChanged && isValidating && (
              <div className="text-center py-2">
                <span className="text-sm text-white/50">Checking for conflicts...</span>
              </div>
            )}

            <DialogFooter className="gap-3 pt-4 sm:justify-between">
              <div>
                {onDelete && slot && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      onOpenChange(false);
                      onDelete(slot);
                    }}
                    disabled={isSubmitting}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
