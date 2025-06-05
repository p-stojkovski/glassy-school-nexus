
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, Filter } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import { setFilters } from '../../store/slices/schedulingSlice';

interface SchedulingFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const SchedulingFilters: React.FC<SchedulingFiltersProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state: RootState) => state.scheduling);
  const { classes } = useSelector((state: RootState) => state.classes);
  const { teachers } = useSelector((state: RootState) => state.teachers);
  const { classrooms } = useSelector((state: RootState) => state.classrooms);

  return (
    <GlassCard className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
          <Input
            placeholder="Search by class or teacher..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
          />
        </div>
        
        <Select value={filters.classId || ''} onValueChange={(value) => dispatch(setFilters({classId: value || undefined}))}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Classes</SelectItem>
            {classes.map((classItem) => (
              <SelectItem key={classItem.id} value={classItem.id}>
                {classItem.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.teacherId || ''} onValueChange={(value) => dispatch(setFilters({teacherId: value || undefined}))}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Teachers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Teachers</SelectItem>
            {teachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.classroomId || ''} onValueChange={(value) => dispatch(setFilters({classroomId: value || undefined}))}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Classrooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Classrooms</SelectItem>
            {classrooms.map((classroom) => (
              <SelectItem key={classroom.id} value={classroom.id}>
                {classroom.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status || ''} onValueChange={(value) => dispatch(setFilters({status: value || undefined}))}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
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
