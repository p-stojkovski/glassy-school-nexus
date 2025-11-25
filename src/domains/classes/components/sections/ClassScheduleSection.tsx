import React from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/common/GlassCard';
import { ClassResponse } from '@/types/api/class';
import { formatSchedule } from '@/utils/scheduleFormatter';

interface ClassScheduleSectionProps {
  classData: ClassResponse;
  mode?: 'view' | 'edit';
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

const ClassScheduleSection: React.FC<ClassScheduleSectionProps> = ({
  classData,
  mode = 'view',
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  const scheduleDisplay = formatSchedule(classData.schedule || []);

  return (
    <GlassCard className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule
          </h3>
        </div>
        {mode === 'view' && onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="text-white border-white/20 hover:bg-white/10"
          >
            Edit
          </Button>
        )}
        {mode === 'edit' && (onSave || onCancel) && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSaving}
              className="text-white border-white/20 hover:bg-white/10 disabled:opacity-50"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      {classData.schedule && classData.schedule.length > 0 && (
        <div className="space-y-3">
          {classData.schedule.map((slot, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
            >
              <span className="font-medium text-white">{slot.dayOfWeek}</span>
              <span className="text-white/70">
                {slot.startTime} - {slot.endTime}
              </span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};

export default ClassScheduleSection;
