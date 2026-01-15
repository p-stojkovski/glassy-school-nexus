import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useTeacherSalary } from './useTeacherSalary';
import SalarySummaryCards from './SalarySummaryCards';
import SalaryBreakdownTable from './SalaryBreakdownTable';
import SalaryEmptyState from './SalaryEmptyState';
import { SalarySetupSheet } from './setup';
import { BaseSalarySection } from './BaseSalarySection';
import { fetchBaseSalary } from '@/domains/teachers/teachersSlice';

interface TeacherSalaryTabProps {
  academicYearId?: string | null;
  yearName?: string;
}

export default function TeacherSalaryTab({ academicYearId, yearName }: TeacherSalaryTabProps) {
  const { teacherId } = useParams<{ teacherId: string }>();
  const dispatch = useAppDispatch();

  // Get teacher from Redux state
  const selectedTeacher = useAppSelector((state) => state.teachers.selectedTeacher);
  const employmentType = selectedTeacher?.employmentType || 'contract';

  // Dialog states
  const [showSetupSheet, setShowSetupSheet] = useState(false);

  // Fetch salary data using academicYearId
  const { data: salaryData, loading, error, noSalaryConfigured, refresh } = useTeacherSalary({
    teacherId: teacherId!,
    academicYearId: academicYearId || undefined,
  });

  // Fetch base salary when teacher is full-time and academic year is selected
  useEffect(() => {
    if (teacherId && academicYearId && employmentType === 'full_time') {
      dispatch(fetchBaseSalary({ teacherId, academicYearId }));
    }
  }, [teacherId, academicYearId, employmentType, dispatch]);

  if (!teacherId) {
    return (
      <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Teacher ID is required</AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-white/60" />
        <span className="ml-3 text-white/60">Loading salary data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Show empty state when no salary is configured
  if (noSalaryConfigured) {
    return (
      <div className="space-y-6">
        {/* Base Salary Section (only for Full Time teachers) - Read Only */}
        {employmentType === 'full_time' && academicYearId && (
          <BaseSalarySection
            teacherId={teacherId!}
            academicYearId={academicYearId}
            onSuccess={refresh}
          />
        )}

        <SalaryEmptyState
          onSetupClick={() => setShowSetupSheet(true)}
          yearName={yearName}
        />
        {academicYearId && (
          <SalarySetupSheet
            open={showSetupSheet}
            onOpenChange={setShowSetupSheet}
            teacherId={teacherId!}
            academicYearId={academicYearId}
            onSuccess={refresh}
          />
        )}
      </div>
    );
  }

  if (!salaryData) {
    return (
      <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No salary data available</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Base Salary Section (only for Full Time teachers) - Read Only */}
      {employmentType === 'full_time' && academicYearId && (
        <BaseSalarySection
          teacherId={teacherId!}
          academicYearId={academicYearId}
          onSuccess={refresh}
        />
      )}

      {/* Summary Cards */}
      <SalarySummaryCards summary={salaryData.summary} />

      {/* Salary Breakdown */}
      <SalaryBreakdownTable
        grossSalary={salaryData.grossSalary}
        contributions={salaryData.contributions}
        incomeTax={salaryData.incomeTax}
        summary={salaryData.summary}
      />
    </div>
  );
}
