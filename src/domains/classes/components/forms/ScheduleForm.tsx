import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Clock, AlertCircle } from 'lucide-react';
import { ClassFormData } from './ClassFormContent';
import { NativeTimeInput } from '@/components/common';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

const ScheduleForm: React.FC = () => {
  const form = useFormContext<ClassFormData>();

  const addScheduleSlot = () => {
    const currentSchedule = form.getValues('schedule');
    form.setValue('schedule', [
      ...currentSchedule,
      { dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:30' },
    ]);
  };

  const removeScheduleSlot = (index: number) => {
    const currentSchedule = form.getValues('schedule');
    form.setValue(
      'schedule',
      currentSchedule.filter((_, i) => i !== index)
    );
  };

  return (
    <div>
      <FormLabel className="text-white mb-4 block">Schedule</FormLabel>
      {form.watch('schedule').map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-white/5 rounded-lg"
        >
          <FormField
            control={form.control}
            name={`schedule.${index}.dayOfWeek`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/70">Day</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monday">Monday</SelectItem>
                      <SelectItem value="Tuesday">Tuesday</SelectItem>
                      <SelectItem value="Wednesday">Wednesday</SelectItem>
                      <SelectItem value="Thursday">Thursday</SelectItem>
                      <SelectItem value="Friday">Friday</SelectItem>
                      <SelectItem value="Saturday">Saturday</SelectItem>
                      <SelectItem value="Sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`schedule.${index}.startTime`}
            render={({ field }) => (
              <FormItem>
                <NativeTimeInput
                  label="Start Time"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select start time"
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`schedule.${index}.endTime`}
            render={({ field }) => (
              <FormItem>
                <NativeTimeInput
                  label="End Time"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select end time"
                  min={form.watch(`schedule.${index}.startTime`)}
                />
              </FormItem>
            )}
          />

          <div className="flex items-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => removeScheduleSlot(index)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:text-red-400 disabled:opacity-50 disabled:hover:bg-red-500/10"
              disabled={form.watch('schedule').length === 1}
            >
              Remove
            </Button>
            {form.watch('schedule').length === 1 && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center w-5 h-5 text-gray-400 hover:text-gray-300 cursor-help focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded"
                    aria-label="At least one slot required"
                  >
                    <AlertCircle className="w-5 h-5" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent side="right" className="w-auto">
                  <p className="text-sm text-gray-200">At least one slot required</p>
                </HoverCardContent>
              </HoverCard>
            )}
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="ghost"
        onClick={addScheduleSlot}
        className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
      >
        <Clock className="w-4 h-4 mr-2" />
        Add Schedule Slot
      </Button>
    </div>
  );
};

export default ScheduleForm;

