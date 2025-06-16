import React from 'react';
import { Calendar, GraduationCap, DollarSign, Users } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import { Class } from '@/domains/classes/classesSlice';
import { Payment } from '@/domains/finance/financeSlice';

interface AttendanceStats {
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: string;
}

interface StudentOverviewProps {
  attendanceStats: AttendanceStats;
  gradeAssessments: any[];
  payments: Payment[];
  outstandingBalance: number;
  studentClass?: Class;
}

const StudentOverview: React.FC<StudentOverviewProps> = ({
  attendanceStats,
  gradeAssessments,
  payments,
  outstandingBalance,
  studentClass,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Attendance Summary */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-8 h-8 text-blue-400" />
          <div>
            <h3 className="font-semibold text-white">Attendance</h3>
            <p className="text-2xl font-bold text-white">
              {attendanceStats.attendanceRate}%
            </p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-white/70">
            <span>Total Sessions:</span>
            <span>{attendanceStats.totalSessions}</span>
          </div>
          <div className="flex justify-between text-green-300">
            <span>Present:</span>
            <span>{attendanceStats.presentCount}</span>
          </div>
          <div className="flex justify-between text-red-300">
            <span>Absent:</span>
            <span>{attendanceStats.absentCount}</span>
          </div>
          <div className="flex justify-between text-yellow-300">
            <span>Late:</span>
            <span>{attendanceStats.lateCount}</span>
          </div>
        </div>
      </GlassCard>

      {/* Grades Summary */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <GraduationCap className="w-8 h-8 text-green-400" />
          <div>
            <h3 className="font-semibold text-white">Grades</h3>
            <p className="text-2xl font-bold text-white">
              {gradeAssessments.length}
            </p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-white/70">
            <span>Assessments:</span>
            <span>{gradeAssessments.length}</span>
          </div>
          <div className="text-white/60">
            {gradeAssessments.length === 0
              ? 'No grades recorded'
              : 'View Grades tab for details'}
          </div>
        </div>
      </GlassCard>

      {/* Payment Summary */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="w-8 h-8 text-amber-400" />
          <div>
            <h3 className="font-semibold text-white">Payments</h3>
            <p className="text-2xl font-bold text-white">
              ${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
            </p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-white/70">
            <span>Total Paid:</span>
            <span>
              ${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-white/70">
            <span>Outstanding:</span>
            <span
              className={
                outstandingBalance > 0 ? 'text-red-300' : 'text-green-300'
              }
            >
              ${outstandingBalance.toFixed(2)}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Class Information */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-8 h-8 text-purple-400" />
          <div>
            <h3 className="font-semibold text-white">Class</h3>
            <p className="text-lg font-bold text-white">
              {studentClass?.name || 'Unassigned'}
            </p>
          </div>
        </div>
        {studentClass && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-white/70">
              <span>Teacher:</span>
              <span>{studentClass.teacher.name}</span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>Subject:</span>
              <span>{studentClass.subject}</span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>Level:</span>
              <span>{studentClass.level}</span>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default StudentOverview;
