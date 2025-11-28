import React, { useMemo } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/common/GlassCard';
import { ClassResponse, ScheduleSlotDto } from '@/types/api/class';
import WeeklyScheduleGrid from '@/domains/classes/components/schedule/WeeklyScheduleGrid';
import { sortSchedulesByDay } from '@/domains/classes/utils/scheduleUtils';

interface ClassScheduleSectionProps {
  classData: ClassResponse;
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
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          Weekly Overview
        </h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/50">
            {activeSchedules.length} {activeSchedules.length === 1 ? 'session' : 'sessions'} per week
          </span>
          {onAddSchedule && (
            <Button
              onClick={onAddSchedule}
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Schedule Slot
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
          <p className="text-white/60 mb-4">No schedule slots configured yet.</p>
          <p className="text-white/40 text-sm">
            Add your first slot to see it on the weekly grid.
          </p>
        </div>
      )}
    </GlassCard>
  );
};

export default ClassScheduleSection;
