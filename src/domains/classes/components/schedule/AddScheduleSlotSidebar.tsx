import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { classApiService } from '@/services/classApiService';
import { CreateScheduleSlotRequest } from '@/types/api/scheduleSlot';
import { ScheduleConflictPanel } from './ScheduleConflictPanel';
import { toast } from 'sonner';

interface AddScheduleSlotSidebarProps {
  isOpen: boolean;
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

const addOneHourWithCap = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':').map(Number);
  if (hours >= 23) {
    return '23:59';
  }
  const newHour = hours + 1;
  return `${newHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export function AddScheduleSlotSidebar({ isOpen, onOpenChange, classId, onSuccess }: AddScheduleSlotSidebarProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [endTimeTouched, setEndTimeTouched] = useState(false);
  const [endTimeAuto, setEndTimeAuto] = useState(false);
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

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setEndTimeTouched(false);
      setEndTimeAuto(false);
      setHasConflicts(false);
    }
    onOpenChange(open);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 bg-white/10 backdrop-blur-md border border-white/20 text-white overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-4 py-4 border-b border-white/10">
            <SheetTitle className="flex items-center gap-2 text-white text-lg font-semibold">
              <Calendar className="w-5 h-5 text-yellow-400" />
              Add session
            </SheetTitle>
          </SheetHeader>

          {/* Form Content */}
          <ScrollArea className="flex-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-4">
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

                {/* Conflict Check Panel */}
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
              </form>
            </Form>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="p-4 border-t border-white/10 space-y-3">
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting || hasConflicts}
                onClick={() => form.handleSubmit(handleSubmit)()}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : hasConflicts ? 'Resolve Conflicts' : 'Create Schedule'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
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
}
