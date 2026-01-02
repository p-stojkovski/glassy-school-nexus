import React from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { TeacherOverviewResponse } from '@/types/api/teacher';
import ClassesCard from './ClassesCard';
import StudentsCard from './StudentsCard';
import ScheduleCard from './ScheduleCard';
import LessonsCard from './LessonsCard';
import SalaryCard from './SalaryCard';

interface TeacherOverviewProps {
  overviewData: TeacherOverviewResponse | null;
  overviewLoading: boolean;
  onNavigateToTab: (tab: string) => void;
}

const TeacherOverview: React.FC<TeacherOverviewProps> = ({
  overviewData,
  overviewLoading,
  onNavigateToTab,
}) => {
  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!overviewData) {
    return (
      <div className="text-white/60 text-center py-8">
        No overview data available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <ClassesCard
        data={overviewData.classes}
        onClick={() => onNavigateToTab('classes')}
      />
      <StudentsCard
        data={overviewData.students}
        onClick={() => onNavigateToTab('students')}
      />
      <ScheduleCard
        data={overviewData.schedule}
        onClick={() => onNavigateToTab('schedule')}
      />
      <LessonsCard
        data={overviewData.lessons}
        onClick={() => onNavigateToTab('lessons')}
      />
      <SalaryCard
        data={overviewData.salary}
        onClick={() => onNavigateToTab('salary')}
      />
    </div>
  );
};

export default TeacherOverview;
