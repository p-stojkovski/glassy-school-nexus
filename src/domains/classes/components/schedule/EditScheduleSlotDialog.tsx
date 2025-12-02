import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Trash2 } from 'lucide-react';
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
import { UpdateScheduleSlotRequest } from '@/types/api/scheduleSlot';
import { ScheduleSlotDto } from '@/types/api/class';
import { toast } from 'sonner';

interface EditScheduleSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  slot: ScheduleSlotDto | null;
  onSuccess: () => void;
  onDelete?: (slot: ScheduleSlotDto) => void;
}

interface FormData {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  updateFutureLessons: boolean;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function EditScheduleSlotDialog({ open, onOpenChange, classId, slot, onSuccess, onDelete }: EditScheduleSlotDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      updateFutureLessons: true,
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
      });
    }
  }, [slot, form]);

  const timesChanged = slot
    ? form.watch('startTime') !== slot.startTime || form.watch('endTime') !== slot.endTime
    : false;

  const handleSubmit = async (data: FormData) => {
    if (!slot?.id) return;

    setIsSubmitting(true);

    try {
      const request: UpdateScheduleSlotRequest = {
        dayOfWeek: data.dayOfWeek as any,
        startTime: data.startTime,
        endTime: data.endTime,
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
