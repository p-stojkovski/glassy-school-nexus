import { ClassResponse, ClassBasicInfoResponse, ScheduleSlotDto } from '@/types/api/class';

// Type that may or may not have schedule
type ClassDataWithOptionalSchedule = ClassResponse | ClassBasicInfoResponse | (ClassBasicInfoResponse & { schedule?: ScheduleSlotDto[] }) | null | undefined;

/**
 * Checks if a class has at least one active (non-archived) schedule
 * Works with both full ClassResponse and ClassBasicInfoResponse
 *
 * For ClassBasicInfoResponse, uses the hasActiveSchedule flag from the API
 * For ClassResponse (with full schedule), checks the schedule array
 */
export const hasActiveSchedules = (classData?: ClassDataWithOptionalSchedule): boolean => {
  if (!classData) return false;

  // For ClassBasicInfoResponse, use the hasActiveSchedule flag from the API
  if ('hasActiveSchedule' in classData) {
    return classData.hasActiveSchedule;
  }

  // For ClassResponse with full schedule data, check the schedule array
  const schedule = 'schedule' in classData ? classData.schedule : undefined;
  if (!schedule || schedule.length === 0) {
    return false;
  }
  return schedule.some(slot => !slot.isObsolete);
};

/**
 * Gets active schedule slots only (filtering out archived ones)
 */
export const getActiveSchedules = (classData?: ClassDataWithOptionalSchedule): ScheduleSlotDto[] => {
  if (!classData) return [];
  const schedule = 'schedule' in classData ? classData.schedule : undefined;
  if (!schedule) return [];
  return schedule.filter(slot => !slot.isObsolete);
};

/**
 * Counts how many schedules are archived
 */
export const getArchivedScheduleCount = (classData?: ClassDataWithOptionalSchedule): number => {
  if (!classData) return 0;
  const schedule = 'schedule' in classData ? classData.schedule : undefined;
  if (!schedule) return 0;
  return schedule.filter(slot => slot.isObsolete).length;
};

/**
 * Returns a user-friendly warning message explaining why lesson creation is blocked
 * Returns null if schedules are available
 */
export const getScheduleWarningMessage = (classData?: ClassDataWithOptionalSchedule): string | null => {
  if (!classData) {
    return 'No schedule defined. Please add a schedule in the Schedule tab before creating lessons.';
  }

  // For ClassBasicInfoResponse, use the hasActiveSchedule flag from the API
  if ('hasActiveSchedule' in classData && !('schedule' in classData)) {
    if (!classData.hasActiveSchedule) {
      return 'No active schedule defined. Please add a schedule in the Schedule tab before generating lessons.';
    }
    return null; // Has active schedule
  }

  // For ClassResponse with full schedule data
  const schedule = 'schedule' in classData ? classData.schedule : undefined;

  if (!schedule) {
    // If schedule is not loaded yet (lazy loading), don't show warning
    return null;
  }

  if (schedule.length === 0) {
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
export const getScheduleSummary = (classData?: ClassDataWithOptionalSchedule): string => {
  if (!classData) return 'No schedules created yet';
  
  const schedule = 'schedule' in classData ? classData.schedule : undefined;
  if (!schedule || schedule.length === 0) {
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
