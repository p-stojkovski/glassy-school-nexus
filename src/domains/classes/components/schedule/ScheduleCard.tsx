import React from 'react';
import { Archive, Trash2, Lock, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/common/GlassCard';
import type { ScheduleSlotDto } from '@/types/api/class';

interface ScheduleCardProps {
  slot: ScheduleSlotDto;
  isArchived?: boolean;
  pastLessonCount?: number;
  onEdit?: (slot: ScheduleSlotDto) => void;
  onDelete?: (slot: ScheduleSlotDto) => void;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ slot, isArchived = false, pastLessonCount, onEdit, onDelete }) => {
  return (
    <GlassCard className={`p-3 sm:p-4 ${isArchived ? 'opacity-80 border-yellow-500/20' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white">{slot.dayOfWeek}</span>
          <span className="text-white/70">
            {slot.startTime} - {slot.endTime}
          </span>
          {isArchived && (
            <span className="inline-flex items-center gap-1 text-xs text-yellow-400 border border-yellow-400/50 px-2 py-0.5 rounded-full">
              <Archive className="w-3 h-3" /> Archived
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isArchived ? (
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <Lock className="w-4 h-4" />
              <span>
                Read-only{typeof pastLessonCount === 'number' ? ` • ${pastLessonCount} past lesson${pastLessonCount === 1 ? '' : 's'}` : ''}
              </span>
            </div>
          ) : (
            <>
              {onEdit && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(slot)}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(slot)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default ScheduleCard;