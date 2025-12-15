import { ScheduleSlotDto } from '@/types/api/class';
import { DAY_ORDER } from '@/constants/schedule';

/**
 * Sorts schedule slots by day of week (Monday-Sunday)
 * Preserves the original order within the same day
 */
export const sortSchedulesByDay = (schedules: ScheduleSlotDto[]): ScheduleSlotDto[] => {
  return [...schedules].sort((a, b) => {
    const dayA = DAY_ORDER[a.dayOfWeek as keyof typeof DAY_ORDER] ?? 7;
    const dayB = DAY_ORDER[b.dayOfWeek as keyof typeof DAY_ORDER] ?? 7;
    return dayA - dayB;
  });
};
