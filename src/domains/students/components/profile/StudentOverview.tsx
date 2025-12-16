import React from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Student } from '@/domains/students/studentsSlice';
import { StudentOverviewResponse } from '@/types/api/student';
import AttendanceCard from './cards/AttendanceCard';
import PerformanceCard from './cards/PerformanceCard';
import HomeworkCard from './cards/HomeworkCard';
import BillingCard from './cards/BillingCard';

interface StudentOverviewProps {
  student?: Student;
  overviewData: StudentOverviewResponse | null;
  overviewLoading: boolean;
}

const StudentOverview: React.FC<StudentOverviewProps> = ({
  student,
  overviewData,
  overviewLoading,
}) => {

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!overviewData || !student) {
    return (
      <div className="text-white/60 text-center py-8">
        No overview data available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Row 1: Key Cards - Attendance + Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <AttendanceCard attendance={overviewData.attendance} />
        <PerformanceCard grades={overviewData.grades} />
      </div>

      {/* Row 2: Secondary Cards - Homework + Billing (conditional) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <HomeworkCard homework={overviewData.homework} />
        <BillingCard billing={overviewData.billing} />
      </div>
    </div>
  );
};

export default StudentOverview;

