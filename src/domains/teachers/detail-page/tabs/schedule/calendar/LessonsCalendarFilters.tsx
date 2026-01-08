/**
 * Filter controls for the lessons calendar
 * View toggle, status filter, and class filter
 */

import React from 'react';
import { Calendar, LayoutGrid, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { CalendarView } from './calendarTypes';
import type { LessonStatusName } from '@/types/api/teacherLesson';

interface LessonsCalendarFiltersProps {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  selectedStatus: LessonStatusName | 'All';
  onStatusChange: (status: LessonStatusName | 'All') => void;
  selectedClassId: string | null;
  onClassChange: (classId: string | null) => void;
  classes: { id: string; name: string }[];
}

const STATUS_OPTIONS: { value: LessonStatusName | 'All'; label: string }[] = [
  { value: 'All', label: 'All Statuses' },
  { value: 'Scheduled', label: 'Scheduled' },
  { value: 'Conducted', label: 'Conducted' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Make Up', label: 'Make Up' },
  { value: 'No Show', label: 'No Show' },
];

const LessonsCalendarFilters: React.FC<LessonsCalendarFiltersProps> = ({
  view,
  onViewChange,
  selectedStatus,
  onStatusChange,
  selectedClassId,
  onClassChange,
  classes,
}) => {
  const hasFilters = selectedStatus !== 'All' || selectedClassId !== null;

  const handleClearFilters = () => {
    onStatusChange('All');
    onClassChange(null);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* View toggle */}
      <div className="flex rounded-lg overflow-hidden border border-white/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewChange('weekly')}
          className={cn(
            'h-8 px-3 rounded-none border-r border-white/10',
            view === 'weekly'
              ? 'bg-white/10 text-white'
              : 'bg-transparent text-white/60 hover:text-white hover:bg-white/5'
          )}
        >
          <Calendar className="h-4 w-4 mr-1.5" />
          Week
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewChange('monthly')}
          className={cn(
            'h-8 px-3 rounded-none',
            view === 'monthly'
              ? 'bg-white/10 text-white'
              : 'bg-transparent text-white/60 hover:text-white hover:bg-white/5'
          )}
        >
          <LayoutGrid className="h-4 w-4 mr-1.5" />
          Month
        </Button>
      </div>

      {/* Status filter */}
      <Select
        value={selectedStatus}
        onValueChange={(value) => onStatusChange(value as LessonStatusName | 'All')}
      >
        <SelectTrigger className="w-[140px] h-8 text-sm bg-white/5 border-white/10">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Class filter */}
      {classes.length > 0 && (
        <Select
          value={selectedClassId || 'all'}
          onValueChange={(value) => onClassChange(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-[160px] h-8 text-sm bg-white/5 border-white/10">
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Clear filters button */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="h-8 px-2 text-white/60 hover:text-white hover:bg-white/5"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
};

export default LessonsCalendarFilters;
