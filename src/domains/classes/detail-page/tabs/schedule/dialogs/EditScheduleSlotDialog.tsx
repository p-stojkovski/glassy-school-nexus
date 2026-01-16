import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionDialog } from '@/components/common/dialogs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { classApiService } from '@/services/classApiService';
import { UpdateScheduleSlotRequest } from '@/types/api/scheduleSlot';
import { ScheduleSlotDto, ClassBasicInfoResponse } from '@/types/api/class';
import { ExistingScheduleOverlapInfo, ScheduleConflictInfo } from '@/types/api/scheduleValidation';
import { toast } from 'sonner';

import { DayTimeFields, SemesterSection } from './components';
import { useScheduleSlotSemesters } from './hooks';

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

export function EditScheduleSlotDialog({ open, onOpenChange, classId, classData, slot, onSuccess, onDelete }: EditScheduleSlotDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [conflictInfo, setConflictInfo] = useState<ScheduleConflictInfo | null>(null);
  const [existingOverlap, setExistingOverlap] = useState<ExistingScheduleOverlapInfo | null>(null);

  // Use semester hook for fetching and managing semester state
  const {
    semesters,
    selectedSemesterId,
    setSelectedSemesterId,
    loadingSemesters,
  } = useScheduleSlotSemesters({
    academicYearId: classData?.academicYearId,
    isOpen: open,
    initialSemesterId: slot?.semesterId || null,
  });

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
      setConflictInfo(null);
      setExistingOverlap(null);
    }
  }, [slot, form, setSelectedSemesterId]);

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

        // Filter out overlaps that are the current slot being edited
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
        dayOfWeek: data.dayOfWeek as ScheduleSlotDto['dayOfWeek'],
        startTime: data.startTime,
        endTime: data.endTime,
        semesterId: data.semesterId || null,
        updateFutureLessons: data.updateFutureLessons,
      };

      const response = await classApiService.updateScheduleSlot(classId, slot.id, request);

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
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update schedule slot';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!slot) return null;

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      intent="primary"
      size="lg"
      icon={Calendar}
      title="Edit session"
      description="Update the schedule slot details"
      confirmText="Save Changes"
      onConfirm={form.handleSubmit(handleSubmit)}
      isLoading={isSubmitting}
    >
      <Form {...form}>
        <form className="space-y-4">
          {/* Day of Week and Time Range */}
          <DayTimeFields
            control={form.control}
            setValue={form.setValue}
            getValues={form.getValues}
            setError={form.setError}
            clearErrors={form.clearErrors}
            watch={form.watch}
            autoEndTime={false}
          />

          {/* Semester Assignment */}
          <SemesterSection
            academicYearId={classData?.academicYearId}
            selectedSemesterId={selectedSemesterId}
            onSemesterChange={setSelectedSemesterId}
            loadingSemesters={loadingSemesters}
            semesters={semesters}
            label="Change Semester Assignment"
            showBadge={true}
            originalSemesterId={slot?.semesterId || null}
            pastLessonCount={slot?.pastLessonCount}
          />

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

          {/* Delete Button */}
          {onDelete && slot && (
            <div className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  onOpenChange(false);
                  onDelete(slot);
                }}
                disabled={isSubmitting}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Schedule Slot
              </Button>
            </div>
          )}
        </form>
      </Form>
    </ActionDialog>
  );
}
