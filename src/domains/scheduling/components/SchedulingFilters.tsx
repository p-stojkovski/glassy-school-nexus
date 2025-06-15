
import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import { setFilters } from '@/domains/scheduling/schedulingSlice';

interface SchedulingFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const SchedulingFilters: React.FC<SchedulingFiltersProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((state: RootState) => state.scheduling);
  const { classes } = useAppSelector((state: RootState) => state.classes);
  const { teachers } = useAppSelector((state: RootState) => state.teachers);
  const { classrooms } = useAppSelector((state: RootState) => state.classrooms);

  return (
    <GlassCard className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />          <Input
            placeholder="Search by class or teacher..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/60"
          />
        </div>
        
        <Select value={filters.classId || 'all'} onValueChange={(value) => dispatch(setFilters({classId: value === 'all' ? undefined : value}))}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((classItem) => (
              <SelectItem key={classItem.id} value={classItem.id}>
                {classItem.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.teacherId || 'all'} onValueChange={(value) => dispatch(setFilters({teacherId: value === 'all' ? undefined : value}))}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Teachers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teachers</SelectItem>
            {teachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.classroomId || 'all'} onValueChange={(value) => dispatch(setFilters({classroomId: value === 'all' ? undefined : value}))}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Classrooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classrooms</SelectItem>
            {classrooms.map((classroom) => (
              <SelectItem key={classroom.id} value={classroom.id}>
                {classroom.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status || 'all'} onValueChange={(value) => dispatch(setFilters({status: value === 'all' ? undefined : value}))}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </GlassCard>
  );
};

export default SchedulingFilters;
