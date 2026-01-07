import { useState, useEffect, useCallback, useMemo } from 'react';
import { teacherApiService } from '@/services/teacherApiService';
import { TeacherScheduleSlotDto, TeacherScheduleStats } from '@/types/api/teacher';

interface UseTeacherScheduleOptions {
  teacherId: string;
}

interface UseTeacherScheduleResult {
  /** All schedule slots loaded from API */
  slots: TeacherScheduleSlotDto[];
  /** Aggregated schedule statistics */
  stats: TeacherScheduleStats | null;
  /** Loading state */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;

  /** Show inactive classes toggle */
  showInactiveClasses: boolean;
  /** Toggle inactive classes visibility */
  setShowInactiveClasses: (value: boolean) => void;

  /** Slots filtered by current filter state */
  filteredSlots: TeacherScheduleSlotDto[];

  /** Unique classes derived from slots */
  classes: { id: string; name: string; isActive: boolean }[];

  /** Refresh data from API */
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching and filtering teacher's weekly schedule.
 * Fetches all schedule slots on mount and provides frontend filtering.
 */
export function useTeacherSchedule({ teacherId }: UseTeacherScheduleOptions): UseTeacherScheduleResult {
  // Data state
  const [slots, setSlots] = useState<TeacherScheduleSlotDto[]>([]);
  const [stats, setStats] = useState<TeacherScheduleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state - default to showing only active classes
  const [showInactiveClasses, setShowInactiveClasses] = useState(false);

  // Load schedule from API
  const loadSchedule = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all schedule slots (including inactive classes for toggle functionality)
      const response = await teacherApiService.getTeacherSchedule(teacherId, {
        activeClassesOnly: false,
      });
      setSlots(response.slots);
      setStats(response.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  // Fetch on mount
  useEffect(() => {
    loadSchedule();
  }, [teacherId]); // Only refetch when teacherId changes

  // Derive unique classes from loaded slots
  const classes = useMemo(() => {
    const classesMap = new Map<string, { id: string; name: string; isActive: boolean }>();
    slots.forEach(slot => {
      if (!classesMap.has(slot.classId)) {
        classesMap.set(slot.classId, {
          id: slot.classId,
          name: slot.className,
          isActive: slot.isClassActive,
        });
      }
    });
    return Array.from(classesMap.values());
  }, [slots]);

  // Apply frontend filters
  const filteredSlots = useMemo(() => {
    return slots.filter(slot => {
      // Filter by active status unless showing inactive
      if (!showInactiveClasses && !slot.isClassActive) {
        return false;
      }
      return true;
    });
  }, [slots, showInactiveClasses]);

  // Recalculate stats based on filtered slots
  const filteredStats = useMemo((): TeacherScheduleStats | null => {
    if (filteredSlots.length === 0) {
      return {
        totalSlots: 0,
        weeklyHours: 0,
        activeDays: 0,
        activeClasses: 0,
      };
    }

    const uniqueDays = new Set(filteredSlots.map(s => s.dayOfWeek)).size;
    const uniqueClasses = new Set(filteredSlots.map(s => s.classId)).size;
    const totalHours = filteredSlots.reduce((sum, slot) => {
      const [startH, startM] = slot.startTime.split(':').map(Number);
      const [endH, endM] = slot.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      return sum + (endMinutes - startMinutes) / 60;
    }, 0);

    return {
      totalSlots: filteredSlots.length,
      weeklyHours: Math.round(totalHours * 10) / 10,
      activeDays: uniqueDays,
      activeClasses: uniqueClasses,
    };
  }, [filteredSlots]);

  return {
    slots,
    stats: filteredStats,
    loading,
    error,
    showInactiveClasses,
    setShowInactiveClasses,
    filteredSlots,
    classes,
    refresh: loadSchedule,
  };
}
