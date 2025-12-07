import React, { useMemo } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/common/GlassCard';
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

  return (
    <GlassCard className="p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-white">
          Weekly schedule · {activeSchedules.length} {activeSchedules.length === 1 ? 'session' : 'sessions'}
          <span className="text-white/40 font-normal"> · Click to edit</span>
        </h3>
        <div>
          {onAddSchedule && (
            <Button
              onClick={onAddSchedule}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Schedule
            </Button>
          )}
        </div>
      </div>
      
      {activeSchedules.length > 0 ? (
        <WeeklyScheduleGrid
          schedules={sortedSchedules}
          onSlotClick={onEdit}
        />
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-3">
            <Calendar className="w-6 h-6 text-white/40" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Schedule Slots Configured</h3>
          <p className="text-white/60 mb-4 max-w-md mx-auto">
            This class doesn't have any schedule slots yet. Add your first slot to see it on the weekly grid.
          </p>
        </div>
      )}
    </GlassCard>
  );
};

export default ClassScheduleSection;
