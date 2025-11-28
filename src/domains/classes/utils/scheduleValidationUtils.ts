import { ClassResponse, ScheduleSlotDto } from '@/types/api/class';

/**
 * Checks if a class has at least one active (non-archived) schedule
 */
export const hasActiveSchedules = (classData?: ClassResponse | null): boolean => {
  if (!classData?.schedule || classData.schedule.length === 0) {
    return false;
  }
  return classData.schedule.some(slot => !slot.isObsolete);
};

/**
 * Gets active schedule slots only (filtering out archived ones)
 */
export const getActiveSchedules = (classData?: ClassResponse | null): ScheduleSlotDto[] => {
  if (!classData?.schedule) return [];
  return classData.schedule.filter(slot => !slot.isObsolete);
};

/**
 * Counts how many schedules are archived
 */
export const getArchivedScheduleCount = (classData?: ClassResponse | null): number => {
  if (!classData?.schedule) return 0;
  return classData.schedule.filter(slot => slot.isObsolete).length;
};

/**
 * Returns a user-friendly warning message explaining why lesson creation is blocked
 * Returns null if schedules are available
 */
export const getScheduleWarningMessage = (classData?: ClassResponse | null): string | null => {
  if (!classData?.schedule) {
    return 'No schedule defined. Please add a schedule in the Schedule tab before creating lessons.';
  }

  if (classData.schedule.length === 0) {
    return 'No schedule defined. Please add a schedule in the Schedule tab before creating lessons.';
  }

  const hasActive = hasActiveSchedules(classData);
  
  if (!hasActive) {
    const archivedCount = getArchivedScheduleCount(classData);
    if (archivedCount > 0) {
      return `All ${archivedCount} schedule${archivedCount !== 1 ? 's are' : ' is'} archived. Please add a new active schedule in the Schedule tab.`;
    }
    return 'No schedule defined. Please add a schedule in the Schedule tab before creating lessons.';
  }

  return null; // Schedules are available
};

/**
 * Gets a summary string for tooltips describing schedule status
 */
export const getScheduleSummary = (classData?: ClassResponse | null): string => {
  if (!classData?.schedule || classData.schedule.length === 0) {
    return 'No schedules created yet';
  }

  const activeCount = getActiveSchedules(classData).length;
  const archivedCount = getArchivedScheduleCount(classData);
  
  const parts: string[] = [];
  if (activeCount > 0) {
    parts.push(`${activeCount} active`);
  }
  if (archivedCount > 0) {
    parts.push(`${archivedCount} archived`);
  }
  
  return parts.join(', ');
};
