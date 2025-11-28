import { ScheduleSlotDto } from '@/types/api/class';

const DAY_ORDER: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

/**
 * Sorts schedule slots by day of week (Monday-Sunday)
 * Preserves the original order within the same day
 */
export const sortSchedulesByDay = (schedules: ScheduleSlotDto[]): ScheduleSlotDto[] => {
  return [...schedules].sort((a, b) => {
    const dayA = DAY_ORDER[a.dayOfWeek] ?? 7;
    const dayB = DAY_ORDER[b.dayOfWeek] ?? 7;
    return dayA - dayB;
  });
};
