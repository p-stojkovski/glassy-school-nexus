import React from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { TeacherOverviewResponse } from '@/types/api/teacher';
import { LessonsCalendar } from './calendar';

interface TeacherScheduleTabProps {
  overviewData: TeacherOverviewResponse | null;
  overviewLoading: boolean;
}

const TeacherScheduleTab: React.FC<TeacherScheduleTabProps> = ({
  overviewData,
  overviewLoading,
}) => {
  const { teacherId } = useParams<{ teacherId: string }>();

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
        No schedule data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Lessons Calendar */}
      {teacherId && (
        <LessonsCalendar teacherId={teacherId} />
      )}
    </div>
  );
};

export default TeacherScheduleTab;
