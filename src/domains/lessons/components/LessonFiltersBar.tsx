import React, { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LessonResponse, LessonStatusName } from '@/types/api/lesson';

type LessonFilter = 'all' | LessonStatusName;
type TeacherFilter = 'all' | string;

interface LessonFiltersBarProps {
  lessons: LessonResponse[];
  statusFilter: LessonFilter;
  teacherFilter: TeacherFilter;
  onStatusChange: (value: LessonFilter) => void;
  onTeacherChange: (value: TeacherFilter) => void;
}

const LessonFiltersBar: React.FC<LessonFiltersBarProps> = ({
  lessons,
  statusFilter,
  teacherFilter,
  onStatusChange,
  onTeacherChange,
}) => {
  // Get unique teachers from lessons for filter dropdown
  const uniqueTeachers = useMemo(() => {
    return lessons.reduce((acc, lesson) => {
      if (!acc.find((t) => t.id === lesson.teacherId)) {
        acc.push({ id: lesson.teacherId, name: lesson.teacherName });
      }
      return acc;
    }, [] as { id: string; name: string }[]);
  }, [lessons]);

  return (
    <div className="flex flex-wrap gap-3">
      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={(value) => onStatusChange(value as LessonFilter)}>
        <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
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

      {/* Teacher Filter */}
      <Select value={teacherFilter} onValueChange={onTeacherChange}>
        <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
          <SelectValue placeholder="Teacher Filter" />
        </SelectTrigger>
        <SelectContent className="bg-gray-900/95 border-white/20">
          <SelectItem value="all" className="text-white focus:bg-white/10">
            All Teachers
          </SelectItem>
          {uniqueTeachers.length > 0 ? (
            uniqueTeachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id} className="text-white focus:bg-white/10">
                {teacher.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-teachers" disabled className="text-white/40">
              No teachers found
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LessonFiltersBar;
