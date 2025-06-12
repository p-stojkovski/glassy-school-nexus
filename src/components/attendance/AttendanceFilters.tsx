import React, { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '../../store';
import { Calendar } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '../ui/calendar';
import GlassCard from '../common/GlassCard';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';

interface AttendanceFiltersProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedClassId: string;
  onClassChange: (classId: string) => void;
}

const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({
  selectedDate,
  onDateChange,
  selectedClassId,
  onClassChange,
}) => {
  const { classes } = useAppSelector((state: RootState) => state.classes);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange(format(date, 'yyyy-MM-dd'));
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-white">Class</Label>
          <Select
            value={selectedClassId}
            onValueChange={onClassChange}
          >
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>            <SelectContent className="bg-gray-900 text-white border-white/20">
              <SelectItem value="all-classes">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label className="text-white">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full bg-white/5 border-white/20 text-white justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(new Date(selectedDate), 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-gray-900 text-white border-white/20">
              <CalendarComponent
                mode="single"
                selected={selectedDate ? new Date(selectedDate) : undefined}
                onSelect={handleDateSelect}
                initialFocus
                className="bg-gray-900 text-white"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </GlassCard>
  );
};

export default AttendanceFilters;
