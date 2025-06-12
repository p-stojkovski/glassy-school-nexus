import React from 'react';
import { RootState } from '../../store';
import { useAppSelector } from '@/store/hooks';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import GlassCard from '../common/GlassCard';

interface GradesFiltersProps {
  selectedClassId: string;
  onClassChange: (classId: string) => void;
}

const GradesFilters: React.FC<GradesFiltersProps> = ({
  selectedClassId,
  onClassChange,
}) => {
  const { classes } = useAppSelector((state: RootState) => state.classes);

  return (
    <GlassCard className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-white">Class</Label>
          <Select
            value={selectedClassId || 'all-classes'}
            onValueChange={onClassChange}
          >
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 text-white border-white/20">
              <SelectItem value="all-classes">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </GlassCard>
  );
};

export default GradesFilters;
