import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, Settings } from 'lucide-react';
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
import { TimeCombobox } from '@/components/common';
import { classApiService } from '@/services/classApiService';
import { CreateScheduleSlotRequest } from '@/types/api/scheduleSlot';
import { ScheduleConflictPanel } from './ScheduleConflictPanel';
import { toast } from 'sonner';

interface AddScheduleSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  onSuccess: () => void;
}

interface FormData {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  generateLessons: boolean;
  rangeType: 'UntilYearEnd' | 'UntilSemesterEnd' | 'Custom';
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

export function AddScheduleSlotDialog({ open, onOpenChange, classId, onSuccess }: AddScheduleSlotDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  // Track End Time edit/auto state for UX (mirrors CreateLessonSidebar)
  const [endTimeTouched, setEndTimeTouched] = useState(false);
  const [endTimeAuto, setEndTimeAuto] = useState(false);
  // Track conflict state for button disable
  const [hasConflicts, setHasConflicts] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      generateLessons: true,
      rangeType: 'UntilYearEnd',
    },
  });

  const generateLessons = form.watch('generateLessons');

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const request: CreateScheduleSlotRequest = {
        dayOfWeek: data.dayOfWeek as any,
        startTime: data.startTime,
        endTime: data.endTime,
        generateLessons: data.generateLessons,
        generationOptions: data.generateLessons
          ? {
              rangeType: data.rangeType,
              skipConflicts: true,
              skipHolidays: true,
            }
          : undefined,
      };

      const response = await classApiService.createScheduleSlot(classId, request);

      // Show success message with generation summary
      if (response.generationSummary) {
        const { totalGenerated, skippedConflicts, skippedHolidays } = response.generationSummary;
        
        let message = `Schedule created! Generated ${totalGenerated} lesson(s).`;
        if (skippedConflicts > 0) {
          message += ` Skipped ${skippedConflicts} conflict(s).`;
        }
        if (skippedHolidays > 0) {
          message += ` Skipped ${skippedHolidays} holiday(s).`;
        }

        toast.success(message, { duration: 6000 });
      } else {
        toast.success('Schedule slot created successfully');
      }

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create schedule slot');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-yellow-400" />
            Add session
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Create a new schedule slot for this class
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
                      onChange={(newStart) => {
                        field.onChange(newStart);

                        const currentEnd = form.getValues('endTime');
                        const hasEnd = !!currentEnd && currentEnd.trim().length > 0;
                        const computedAutoEnd = addOneHourWithCap(newStart);

                        const shouldAutoSet =
                          !hasEnd ||
                          endTimeAuto ||
                          !endTimeTouched ||
                          (hasEnd && currentEnd <= newStart);

                        if (shouldAutoSet) {
                          form.setValue('endTime', computedAutoEnd, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                          setEndTimeAuto(true);
                          setEndTimeTouched(false);
                        }

                        // Clear any end time validation error when start changes (we may auto-adjust end)
                        form.clearErrors('endTime');
                      }}
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
                      onChange={(newEnd) => {
                        const start = form.getValues('startTime');
                        // Prevent setting end <= start to match CreateLessonSidebar behavior
                        if (start && newEnd <= start) {
                          form.setError('endTime', {
                            type: 'manual',
                            message: 'End time must be after start time',
                          });
                          return;
                        }

                        form.clearErrors('endTime');
                        field.onChange(newEnd);
                        setEndTimeTouched(true);
                        setEndTimeAuto(false);
                      }}
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

            {/* Conflict Check Panel - only when generateLessons is true */}
            <ScheduleConflictPanel
              classId={classId}
              dayOfWeek={form.watch('dayOfWeek')}
              startTime={form.watch('startTime')}
              endTime={form.watch('endTime')}
              generateLessons={form.watch('generateLessons')}
              rangeType={form.watch('rangeType')}
              onConflictsChange={setHasConflicts}
            />

            {/* Lesson Generation */}
            <div className="border-t border-white/20 pt-4 space-y-3">
              <FormField
                control={form.control}
                name="generateLessons"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5 border-white/30 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="font-medium cursor-pointer text-white">
                        Generate lessons for this schedule
                      </FormLabel>
                      <p className="text-sm text-white/60">
                        Automatically create lessons for matching dates
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {generateLessons && (
                <div className="pl-7 space-y-3">
                  <FormField
                    control={form.control}
                    name="rangeType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-white">Generate until</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-sm bg-white/5 border-white/20 text-white">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-900 border-white/20">
                            <SelectItem value="UntilYearEnd" className="text-white hover:bg-white/10 focus:bg-white/10">End of academic year</SelectItem>
                            <SelectItem value="UntilSemesterEnd" className="text-white hover:bg-white/10 focus:bg-white/10">End of current semester</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <p className="text-xs text-white/50">
                    • Conflicts will be automatically skipped
                    <br />• School holidays will be excluded
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-3 pt-4">
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
                disabled={isSubmitting || hasConflicts}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : hasConflicts ? 'Resolve Conflicts' : 'Create Schedule'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
