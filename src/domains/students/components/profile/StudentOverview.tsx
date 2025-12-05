import React from 'react';
import GlassCard from '@/components/common/GlassCard';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Student } from '@/domains/students/studentsSlice';
import { StudentOverviewResponse } from '@/types/api/student';
import { usePermissions } from '@/hooks/usePermissions';
import { StudentDetailSection } from './StudentDetailsTab';

// Flexible payment type for display
interface PaymentInfo {
  amount: number;
}

interface StudentOverviewProps {
  student?: Student;
  overviewData: StudentOverviewResponse | null;
  overviewLoading: boolean;
  payments: PaymentInfo[];
  outstandingBalance: number;
  onEditSection?: (section: StudentDetailSection) => void;
}

/**
 * Calculate age from date of birth
 */
const calculateAge = (dateOfBirth?: string): string | null => {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return `${age} years`;
};

const StudentOverview: React.FC<StudentOverviewProps> = ({
  student,
  overviewData,
  overviewLoading,
  payments,
  outstandingBalance,
  onEditSection,
}) => {
  const permissions = usePermissions();
  const canEdit = permissions.canManageStudents;

  // Calculate totals from payments prop (for billing card)
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const hasBillingData = payments.length > 0 || outstandingBalance > 0;

  // Extract data from API response
  const attendance = overviewData?.attendance;
  const homework = overviewData?.homework;
  const grades = overviewData?.grades;
  const billing = overviewData?.billing;

  // Show loading state for metrics cards
  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* First row: Key metrics - Attendance, Grades, Homework, Billing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Attendance Summary */}
        <GlassCard className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-white mb-2">Attendance</h3>
            {attendance && attendance.totalSessions > 0 ? (
              <p className="text-2xl font-bold text-white">
                {attendance.attendanceRate.toFixed(1)}%
              </p>
            ) : (
              <p className="text-lg text-white/40">—</p>
            )}
          </div>
          {attendance && attendance.totalSessions > 0 ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-green-300">
                <span>Present</span>
                <span>{attendance.presentCount} / {attendance.totalSessions}</span>
              </div>
              {attendance.absentCount > 0 && (
                <div className="flex justify-between text-red-300">
                  <span>Absent</span>
                  <span>{attendance.absentCount}</span>
                </div>
              )}
              {attendance.lateCount > 0 && (
                <div className="flex justify-between text-yellow-300">
                  <span>Late</span>
                  <span>{attendance.lateCount}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-white/50">
              No sessions yet. Stats will appear after the first lesson.
            </p>
          )}
        </GlassCard>

        {/* Grades Summary */}
        <GlassCard className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-white mb-2">Grades</h3>
            {grades && grades.totalAssessments > 0 ? (
              <p className="text-2xl font-bold text-white">
                {grades.totalAssessments}
              </p>
            ) : (
              <p className="text-lg text-white/40">—</p>
            )}
          </div>
          {grades && grades.totalAssessments > 0 ? (
            <div className="text-sm text-white/60">
              <span>{grades.totalAssessments} assessment{grades.totalAssessments !== 1 ? 's' : ''} recorded</span>
              <span className="block mt-1 text-blue-400 hover:text-blue-300 cursor-pointer">View Grades tab →</span>
            </div>
          ) : (
            <p className="text-sm text-white/50">
              No assessments recorded yet.
            </p>
          )}
        </GlassCard>

        {/* Homework Summary */}
        <GlassCard className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-white mb-2">Homework</h3>
            {homework && homework.totalAssigned > 0 ? (
              <p className="text-2xl font-bold text-white">
                {homework.completionRate.toFixed(1)}%
              </p>
            ) : (
              <p className="text-lg text-white/40">—</p>
            )}
          </div>
          {homework && homework.totalAssigned > 0 ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-green-300">
                <span>Completed</span>
                <span>{homework.completedCount} / {homework.totalAssigned}</span>
              </div>
              {homework.missingCount > 0 && (
                <div className="flex justify-between text-red-300">
                  <span>Not done</span>
                  <span>{homework.missingCount}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-white/50">
              No homework assigned yet.
            </p>
          )}
        </GlassCard>

        {/* Billing Summary */}
        <GlassCard className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-white mb-2">Billing</h3>
            {hasBillingData || billing?.hasDiscount ? (
              <p className="text-2xl font-bold text-white">
                ${totalPaid.toFixed(2)}
              </p>
            ) : (
              <p className="text-lg text-white/40">—</p>
            )}
          </div>
          {hasBillingData || billing?.hasDiscount ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">Outstanding</span>
                <span className={outstandingBalance > 0 ? 'text-red-300' : 'text-green-300'}>
                  ${outstandingBalance.toFixed(2)}
                </span>
              </div>
              {billing?.hasDiscount && (
                <div className="flex justify-between">
                  <span className="text-white/70">Discount</span>
                  <span className="text-green-400">
                    {billing.discountTypeName || 'Applied'}
                    {billing.discountAmount && billing.discountAmount > 0 && ` – ${billing.discountAmount} MKD`}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-white/50">
              No payments recorded yet.
            </p>
          )}
        </GlassCard>
      </div>

      {/* Second row: Profile & Contacts - Merged Student Info + Parent/Guardian */}
      {student && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile & Contacts Card - Combined */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Profile & Contacts</h3>
              {canEdit && onEditSection && (
                <Button
                  onClick={() => onEditSection('student-info')}
                  size="sm"
                  variant="ghost"
                  className="text-white/60 hover:text-white hover:bg-white/10 h-7 px-2 text-xs"
                >
                  Edit
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Info Section */}
              <div className="space-y-3 text-sm">
                <div className="text-white/40 text-xs uppercase tracking-wide font-medium mb-2">Student</div>
                <div className="flex items-center gap-2 text-white">
                  <span className="font-medium">{student.fullName}</span>
                </div>
                {student.dateOfBirth && (
                  <div className="flex items-center gap-2 text-white/70">
                    <span><span className="font-semibold">Age:</span> {calculateAge(student.dateOfBirth)}</span>
                  </div>
                )}
                <div className="text-white/70">
                  <span className="truncate"><span className="font-semibold">Email:</span> {student.email}</span>
                </div>
                {student.phone && (
                  <div className="text-white/70">
                    <span><span className="font-semibold">Phone:</span> {student.phone}</span>
                  </div>
                )}
                {student.enrollmentDate && (
                  <div className="text-white/50 text-xs">
                    Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              {/* Parent/Guardian Section */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="text-white/40 text-xs uppercase tracking-wide font-medium mb-2">Parent/Guardian</div>
                  {canEdit && onEditSection && (
                    <Button
                      onClick={() => onEditSection('guardian-info')}
                      size="sm"
                      variant="ghost"
                      className="text-white/60 hover:text-white hover:bg-white/10 h-6 px-2 text-xs -mt-1"
                    >
                      Edit
                    </Button>
                  )}
                </div>
                {student.parentContact ? (
                  <>
                    <div className="text-white">
                      <span>{student.parentContact}</span>
                    </div>
                    {student.parentEmail && (
                      <div className="text-white/70">
                        <span className="truncate">{student.parentEmail}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-white/50">No guardian info on file</p>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Quick Actions / Notes placeholder - can be used for future features */}
          {/* For now, this balances the grid; could add notes, quick actions, or other info */}
        </div>
      )}
    </div>
  );
};

export default StudentOverview;

