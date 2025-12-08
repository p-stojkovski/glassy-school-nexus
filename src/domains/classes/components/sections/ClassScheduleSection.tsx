import React, { useMemo } from 'react';
import { Calendar as CalendarIcon, CalendarDays, CalendarRange, Clock3, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClassBasicInfoResponse, ScheduleSlotDto } from '@/types/api/class';
import WeeklyScheduleGrid from '@/domains/classes/components/schedule/WeeklyScheduleGrid';
import { sortSchedulesByDay } from '@/domains/classes/utils/scheduleUtils';

// Extended type that includes schedule data
type ClassDataWithSchedule = ClassBasicInfoResponse & { schedule: ScheduleSlotDto[] };

interface ClassScheduleSectionProps {
  classData: ClassDataWithSchedule;
  onEdit?: (slot: ScheduleSlotDto) => void;
  onDelete?: (slot: ScheduleSlotDto) => void;
  onAddSchedule?: () => void;
}

const ClassScheduleSection: React.FC<ClassScheduleSectionProps> = ({
  classData,
  onEdit,
  onDelete,
  onAddSchedule,
}) => {
  const sortedSchedules = useMemo(
    () => (classData.schedule ? sortSchedulesByDay(classData.schedule) : []),
    [classData.schedule]
  );

  const activeSchedules = useMemo(
    () => sortedSchedules.filter((s) => !s.isObsolete),
    [sortedSchedules]
  );

  const scheduleStats = useMemo(() => {
    const days = new Set<string>();
    let totalHours = 0;

    activeSchedules.forEach((slot) => {
      days.add(slot.dayOfWeek);
      const [startHour, startMinute] = slot.startTime.split(':').map(Number);
      const [endHour, endMinute] = slot.endTime.split(':').map(Number);
      const start = startHour + startMinute / 60;
      const end = endHour + endMinute / 60;
      if (end > start) {
        totalHours += end - start;
      }
    });

    return {
      daysCount: days.size,
      weeklyHours: totalHours,
    };
  }, [activeSchedules]);

  const weeklyHoursLabel =
    scheduleStats.weeklyHours % 1 === 0
      ? scheduleStats.weeklyHours.toString()
      : scheduleStats.weeklyHours.toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 md:gap-6 p-3 bg-white/[0.02] rounded-lg border border-white/10">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-white/60" />
          <span className="text-sm text-white/80">
            <span className="font-semibold text-white">{activeSchedules.length}</span>{' '}
            {activeSchedules.length === 1 ? 'session scheduled' : 'sessions scheduled'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock3 className="w-4 h-4 text-white/60" />
          <span className="text-sm text-white/80">
            <span className="font-semibold text-white">
              {weeklyHoursLabel}
            </span>{' '}
            {scheduleStats.weeklyHours === 1 ? 'hour' : 'hours'} per week
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarRange className="w-4 h-4 text-white/60" />
          <span className="text-sm text-white/80">
            <span className="font-semibold text-white">{scheduleStats.daysCount}</span>{' '}
            {scheduleStats.daysCount === 1 ? 'day' : 'days'} active
          </span>
        </div>
        {onAddSchedule && (
          <div className="ml-auto w-full md:w-auto md:ml-auto">
            <Button
              onClick={onAddSchedule}
              size="default"
              variant="outline"
              className="border-white/30 bg-white/10 hover:bg-white/20 text-white font-medium gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Schedule
            </Button>
          </div>
        )}
      </div>
      
      {activeSchedules.length > 0 ? (
        <WeeklyScheduleGrid schedules={sortedSchedules} onSlotClick={onEdit} />
      ) : (
        <div className="text-center py-12 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-3">
            <CalendarIcon className="w-6 h-6 text-white/40" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Schedule Slots Configured</h3>
          <p className="text-white/60 mb-4 max-w-md mx-auto">
            This class doesn't have any schedule slots yet. Add your first slot to see it on the weekly grid.
          </p>
        </div>
      )}
    </div>
  );
};

export default ClassScheduleSection;
