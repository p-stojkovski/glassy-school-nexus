import React, { useMemo, useState } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LessonResponse, LessonStatusName } from '@/types/api/lesson';

type LessonFilter = 'all' | LessonStatusName;
type TeacherFilter = 'all' | string;

interface LessonFiltersBarProps {
  lessons: LessonResponse[];
  statusFilter: LessonFilter;
  teacherFilter: TeacherFilter;
  onStatusChange: (value: LessonFilter) => void;
  onTeacherChange: (value: TeacherFilter) => void;
  compact?: boolean;
}

const LessonFiltersBar: React.FC<LessonFiltersBarProps> = ({
  lessons,
  statusFilter,
  teacherFilter,
  onStatusChange,
  onTeacherChange,
  compact = false,
}) => {
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Get unique teachers from lessons for filter dropdown
  const uniqueTeachers = useMemo(() => {
    return lessons.reduce((acc, lesson) => {
      if (!acc.find((t) => t.id === lesson.teacherId)) {
        acc.push({ id: lesson.teacherId, name: lesson.teacherName });
      }
      return acc;
    }, [] as { id: string; name: string }[]);
  }, [lessons]);

  // Only show teacher filter if there are multiple teachers
  const hasMultipleTeachers = uniqueTeachers.length > 1;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={(value) => onStatusChange(value as LessonFilter)}>
        <SelectTrigger className={`${compact ? 'w-[140px]' : 'w-[180px]'} bg-white/10 border-white/20 text-white h-9`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-gray-900/95 border-white/20">
          <SelectItem value="all" className="text-white focus:bg-white/10">
            All Lessons
          </SelectItem>
          <SelectItem value="Scheduled" className="text-white focus:bg-white/10">
            Scheduled
          </SelectItem>
          <SelectItem value="Conducted" className="text-white focus:bg-white/10">
            Conducted
          </SelectItem>
          <SelectItem value="Cancelled" className="text-white focus:bg-white/10">
            Cancelled
          </SelectItem>
          <SelectItem value="Make Up" className="text-white focus:bg-white/10">
            Make Up
          </SelectItem>
          <SelectItem value="No Show" className="text-white focus:bg-white/10">
            No Show
          </SelectItem>
        </SelectContent>
      </Select>

      {/* More Filters Toggle (compact mode) */}
      {compact && hasMultipleTeachers && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className={`text-white/60 hover:text-white hover:bg-white/10 h-9 ${
              teacherFilter !== 'all' ? 'text-blue-400' : ''
            }`}
          >
            <Filter className="w-4 h-4 mr-1" />
            {teacherFilter !== 'all' ? '1 filter' : 'More'}
            <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${showMoreFilters ? 'rotate-180' : ''}`} />
          </Button>
          
          {showMoreFilters && (
            <Select value={teacherFilter} onValueChange={onTeacherChange}>
              <SelectTrigger className="w-[160px] bg-white/10 border-white/20 text-white h-9">
                <SelectValue placeholder="Teacher" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900/95 border-white/20">
                <SelectItem value="all" className="text-white focus:bg-white/10">
                  All Teachers
                </SelectItem>
                {uniqueTeachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id} className="text-white focus:bg-white/10">
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </>
      )}

      {/* Teacher Filter (non-compact mode) */}
      {!compact && hasMultipleTeachers && (
        <Select value={teacherFilter} onValueChange={onTeacherChange}>
          <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Teacher Filter" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900/95 border-white/20">
            <SelectItem value="all" className="text-white focus:bg-white/10">
              All Teachers
            </SelectItem>
            {uniqueTeachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id} className="text-white focus:bg-white/10">
                {teacher.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default LessonFiltersBar;
