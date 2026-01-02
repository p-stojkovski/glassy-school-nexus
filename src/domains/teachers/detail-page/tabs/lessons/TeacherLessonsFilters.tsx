import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { LessonStatusName, TeacherLessonsStats } from '@/types/api/teacherLesson';

interface TeacherLessonsFiltersProps {
  stats: TeacherLessonsStats | null;
  selectedStatus: LessonStatusName | 'All';
  onStatusChange: (status: LessonStatusName | 'All') => void;
  selectedClassId: string | null;
  onClassIdChange: (classId: string | null) => void;
  fromDate: string;
  onFromDateChange: (date: string) => void;
  toDate: string;
  onToDateChange: (date: string) => void;
  classes: { id: string; name: string }[];
}

export const TeacherLessonsFilters: React.FC<TeacherLessonsFiltersProps> = ({
  stats,
  selectedStatus,
  onStatusChange,
  selectedClassId,
  onClassIdChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  classes,
}) => {
  const statusTabs = [
    { id: 'All' as const, label: 'All', count: stats?.totalLessons ?? 0 },
    { id: 'Conducted' as const, label: 'Conducted', count: stats?.conductedCount ?? 0 },
    { id: 'Cancelled' as const, label: 'Cancelled', count: stats?.cancelledCount ?? 0 },
    { id: 'Make Up' as const, label: 'Make Up', count: stats?.makeupCount ?? 0 },
    { id: 'No Show' as const, label: 'No Show', count: stats?.noShowCount ?? 0 },
  ];

  return (
    <div className="space-y-4">
      {/* Status Tabs */}
      <Tabs value={selectedStatus} onValueChange={(value) => onStatusChange(value as LessonStatusName | 'All')}>
        <TabsList className="grid grid-cols-5 w-full">
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex flex-col gap-1">
              <span>{tab.label}</span>
              <span className="text-xs text-muted-foreground">({tab.count})</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Additional Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Class Filter */}
        <div>
          <Label htmlFor="class-filter">Class</Label>
          <Select
            value={selectedClassId ?? 'all'}
            onValueChange={(value) => onClassIdChange(value === 'all' ? null : value)}
          >
            <SelectTrigger id="class-filter">
              <SelectValue placeholder="All Classes" />
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
        </div>

        {/* From Date */}
        <div>
          <Label htmlFor="from-date">From Date</Label>
          <Input
            id="from-date"
            type="date"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
          />
        </div>

        {/* To Date */}
        <div>
          <Label htmlFor="to-date">To Date</Label>
          <Input
            id="to-date"
            type="date"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
