
import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '../../store';
import { Calendar } from '../ui/calendar';
import { Button } from '../ui/button';
import GlassCard from '../common/GlassCard';
import { setSelectedDate, setViewMode } from '../../store/slices/schedulingSlice';

const SchedulingCalendar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedDate, viewMode } = useAppSelector((state: RootState) => state.scheduling);
  // Parse the string date to a Date object for the Calendar component
  const parsedSelectedDate = selectedDate ? new Date(selectedDate) : new Date();

  return (
    <GlassCard className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Calendar</h2>
          <div className="flex gap-2">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => dispatch(setViewMode(mode))}
                className={
                  viewMode === mode
                    ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </div>
        </div>        <Calendar
          mode="single"
          selected={parsedSelectedDate}
          onSelect={(date) => dispatch(setSelectedDate(date || new Date()))}
          className="rounded-md border border-white/10 bg-white/5"
        />
      </div>
    </GlassCard>
  );
};

export default SchedulingCalendar;
