import React from 'react';
import { Control, UseFormSetValue, UseFormGetValues, UseFormSetError, UseFormClearErrors, UseFormWatch } from 'react-hook-form';
import {
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
import { TimeCombobox } from '@/components/common';

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Add one hour to a time string, capping at 23:59
 */
export const addOneHourWithCap = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':').map(Number);
  if (hours >= 23) {
    return '23:59';
  }
  const newHour = hours + 1;
  return `${newHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

interface DayTimeFieldsFormData {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface DayTimeFieldsProps<T extends DayTimeFieldsFormData> {
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  getValues: UseFormGetValues<T>;
  setError: UseFormSetError<T>;
  clearErrors: UseFormClearErrors<T>;
  watch: UseFormWatch<T>;
  /** Enable auto end-time calculation when start time changes */
  autoEndTime?: boolean;
  /** Callback when end time auto-calculation state changes */
  onEndTimeAutoChange?: (isAuto: boolean) => void;
  /** Current auto end-time state */
  endTimeAuto?: boolean;
  /** Current end time touched state */
  endTimeTouched?: boolean;
  /** Callback when end time touched state changes */
  onEndTimeTouchedChange?: (touched: boolean) => void;
}

/**
 * Shared day of week and time range fields for schedule slot forms.
 * Used by both AddScheduleSlotSheet and EditScheduleSlotDialog.
 */
export function DayTimeFields<T extends DayTimeFieldsFormData>({
  control,
  setValue,
  getValues,
  setError,
  clearErrors,
  watch,
  autoEndTime = false,
  onEndTimeAutoChange,
  endTimeAuto = false,
  endTimeTouched = true,
  onEndTimeTouchedChange,
}: DayTimeFieldsProps<T>) {
  const handleStartTimeChange = (newStart: string, fieldOnChange: (value: string) => void) => {
    fieldOnChange(newStart);

    if (!autoEndTime) return;

    const currentEnd = getValues('endTime' as keyof T) as string;
    const hasEnd = !!currentEnd && currentEnd.trim().length > 0;
    const computedAutoEnd = addOneHourWithCap(newStart);

    const shouldAutoSet =
      !hasEnd ||
      endTimeAuto ||
      !endTimeTouched ||
      (hasEnd && currentEnd <= newStart);

    if (shouldAutoSet) {
      setValue('endTime' as keyof T, computedAutoEnd as T[keyof T], {
        shouldDirty: true,
        shouldValidate: true,
      });
      onEndTimeAutoChange?.(true);
      onEndTimeTouchedChange?.(false);
    }

    clearErrors('endTime' as keyof T);
  };

  const handleEndTimeChange = (newEnd: string, fieldOnChange: (value: string) => void) => {
    const start = getValues('startTime' as keyof T) as string;
    if (start && newEnd <= start) {
      setError('endTime' as keyof T, {
        type: 'manual',
        message: 'End time must be after start time',
      });
      return;
    }

    clearErrors('endTime' as keyof T);
    fieldOnChange(newEnd);
    onEndTimeTouchedChange?.(true);
    onEndTimeAutoChange?.(false);
  };

  return (
    <div className="space-y-4">
      {/* Day of Week */}
      <FormField
        control={control as Control<DayTimeFieldsFormData>}
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
          control={control as Control<DayTimeFieldsFormData>}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <TimeCombobox
                label="Start Time"
                showIcon={autoEndTime ? false : undefined}
                value={field.value}
                onChange={(newStart) => handleStartTimeChange(newStart, field.onChange)}
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
          control={control as Control<DayTimeFieldsFormData>}
          name="endTime"
          render={({ field }) => (
            <FormItem>
              <TimeCombobox
                label="End Time"
                showIcon={autoEndTime ? false : undefined}
                value={field.value}
                onChange={(newEnd) => handleEndTimeChange(newEnd, field.onChange)}
                placeholder="10:00 AM"
                min={watch('startTime' as keyof T) as string}
                startHour={7}
                endHour={21}
                intervalMinutes={30}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
