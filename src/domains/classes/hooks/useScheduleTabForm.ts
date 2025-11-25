import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScheduleSlotDto } from '@/types/api/class';

// Schedule tab contains: schedule array
export interface ScheduleFormData {
  schedule: ScheduleSlotDto[];
}

// Validation schema for Schedule tab fields
const scheduleSchema = z.object({
  schedule: z
    .array(
      z.object({
        dayOfWeek: z.string(),
        startTime: z.string(),
        endTime: z.string(),
      })
    )
    .min(1, 'At least one schedule slot is required')
    .refine(
      (schedules) => {
        if (!schedules || schedules.length === 0) return true;

        // Check for duplicate day/time combinations
        const scheduleKeys = schedules.map(
          (s) => `${s.dayOfWeek}-${s.startTime}-${s.endTime}`
        );
        const uniqueKeys = new Set(scheduleKeys);

        if (scheduleKeys.length !== uniqueKeys.size) {
          return false;
        }

        // Check for overlapping times on the same day
        const dayGroups = schedules.reduce((acc, schedule) => {
          if (!acc[schedule.dayOfWeek]) acc[schedule.dayOfWeek] = [];
          acc[schedule.dayOfWeek].push({
            start: schedule.startTime,
            end: schedule.endTime,
          });
          return acc;
        }, {} as Record<string, { start: string; end: string }[]>);

        for (const day in dayGroups) {
          const daySchedules = dayGroups[day];
          for (let i = 0; i < daySchedules.length; i++) {
            for (let j = i + 1; j < daySchedules.length; j++) {
              const schedule1 = daySchedules[i];
              const schedule2 = daySchedules[j];

              // Check for time overlap
              if (
                schedule1.start < schedule2.end &&
                schedule2.start < schedule1.end
              ) {
                return false;
              }
            }
          }
        }

        return true;
      },
      {
        message:
          'Schedule cannot have duplicate or overlapping time slots on the same day',
      }
    ),
});

export const useScheduleTabForm = (
  initialData: ScheduleFormData
): UseFormReturn<ScheduleFormData> => {
  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      schedule: initialData.schedule || [
        { dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00' },
      ],
    },
  });

  return form;
};
