import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { TeacherOverviewResponse, TeacherScheduleSlotDto } from '@/types/api/teacher';
import ClassesCard from './ClassesCard';
import StudentsCard from './StudentsCard';
import {
  TeacherScheduleGrid,
  useTeacherSchedule,
} from '../classes/schedule';

interface TeacherOverviewProps {
  overviewData: TeacherOverviewResponse | null;
  overviewLoading: boolean;
}

const TeacherOverview: React.FC<TeacherOverviewProps> = ({
  overviewData,
  overviewLoading,
}) => {
  const navigate = useNavigate();
  const { teacherId } = useParams<{ teacherId: string }>();

  const {
    filteredSlots,
    loading: scheduleLoading,
  } = useTeacherSchedule({ teacherId: teacherId || '' });

  const handleSlotClick = (slot: TeacherScheduleSlotDto) => {
    navigate(`/classes/${slot.classId}`);
  };

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
    <div className="space-y-4">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ClassesCard data={overviewData.classes} />
        <StudentsCard
          data={overviewData.students}
          financials={overviewData.financials}
        />
      </div>

      {/* Weekly Schedule Section */}
      {scheduleLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <LoadingSpinner size="md" />
        </div>
      ) : filteredSlots.length > 0 ? (
        <TeacherScheduleGrid
          slots={filteredSlots}
          onSlotClick={handleSlotClick}
        />
      ) : null}
    </div>
  );
};

export default TeacherOverview;
