import React, { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Users,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import GlassCard from '@/components/common/GlassCard';
import { TeacherClassWithPayments, PaymentScheduleSlot, StudentPaymentStatus } from '@/types/api/teacher';
import StudentPaymentRow from './StudentPaymentRow';
import ClassMetricsRow from './ClassMetrics';
import { cn } from '@/lib/utils';

/**
 * Wrapper component to manage expanded state for student rows
 */
interface StudentPaymentRowListProps {
  students: StudentPaymentStatus[];
}

const StudentPaymentRowList: React.FC<StudentPaymentRowListProps> = ({ students }) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (studentId: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  return (
    <>
      {students.map((student) => (
        <StudentPaymentRow
          key={student.studentId}
          student={student}
          isExpanded={expandedRows.has(student.studentId)}
          onToggle={() => toggleRow(student.studentId)}
        />
      ))}
    </>
  );
};

interface ClassPaymentCardProps {
  classData: TeacherClassWithPayments;
  students?: StudentPaymentStatus[];
  studentsLoading?: boolean;
  onExpand?: () => void;
}

/**
 * Class card showing payment summary per class.
 * Clicking "View Students" opens a Sheet (sidebar) showing individual student payment statuses.
 */
const ClassPaymentCard = memo<ClassPaymentCardProps>(({
  classData,
  students,
  studentsLoading,
  onExpand,
}) => {
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const formatSchedule = (slots: PaymentScheduleSlot[]): string => {
    if (!slots || slots.length === 0) return 'No schedule';

    // Group slots by time pattern
    const timeGroups = new Map<string, string[]>();

    slots.forEach((slot) => {
      const timeKey = `${slot.startTime}-${slot.endTime}`;
      const dayShort = slot.dayName.substring(0, 3);

      if (!timeGroups.has(timeKey)) {
        timeGroups.set(timeKey, []);
      }
      timeGroups.get(timeKey)!.push(dayShort);
    });

    // Build formatted strings
    const parts: string[] = [];
    timeGroups.forEach((days, time) => {
      parts.push(`${days.join(', ')} ${time}`);
    });

    return parts.join(' | ');
  };

  const handleOpenSheet = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExpand) {
      onExpand();
    }
    setIsSheetOpen(true);
  };

  const handleNavigateToClass = () => {
    navigate(`/classes/${classData.classId}`);
  };

  const hasStudentsWithDues = classData.withDuesCount > 0;

  return (
    <GlassCard className={cn('overflow-hidden', !classData.isActive && 'opacity-70')}>
      {/* Card Header - always visible */}
      <div
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={handleNavigateToClass}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-white truncate">
              {classData.className}
            </h4>
            <p className="text-sm text-white/60">{classData.subjectName}</p>
          </div>
          <Badge
            variant={classData.isActive ? 'default' : 'secondary'}
            className={
              classData.isActive
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
            }
          >
            {classData.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Schedule */}
        <div className="flex items-center text-sm text-white/70 mb-3">
          <Calendar className="w-4 h-4 mr-2 text-white/40" />
          <span className="truncate">{formatSchedule(classData.scheduleSlots)}</span>
        </div>

        {/* Payment Stats Row */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 text-white/70">
            <Users className="w-3.5 h-3.5 text-white/50" />
            <span>{classData.enrolledCount} students</span>
          </div>

          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400/80" />
            <span className="text-green-400">{classData.paidCount} paid</span>
          </div>

          <div className="flex items-center gap-1.5">
            <AlertCircle
              className={cn(
                'w-3.5 h-3.5',
                hasStudentsWithDues ? 'text-amber-400/80' : 'text-white/50'
              )}
            />
            <span className={hasStudentsWithDues ? 'text-amber-400' : 'text-white/50'}>
              {classData.withDuesCount} with dues
            </span>
          </div>
        </div>
      </div>

      {/* Class Metrics Row */}
      <ClassMetricsRow
        attendanceRatePercentage={classData.attendanceRatePercentage}
        conductedLessons={classData.conductedLessons}
        totalLessons={classData.totalLessons}
        enrolledCount={classData.enrolledCount}
        classroomCapacity={classData.classroomCapacity}
        homeworkCompletionPercentage={classData.homeworkCompletionPercentage}
      />

      {/* View Students Button */}
      <button
        type="button"
        onClick={handleOpenSheet}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm text-white/60 hover:text-white hover:bg-white/5 border-t border-white/10 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
        <span>View Students ({classData.enrolledCount})</span>
      </button>

      {/* Students Sheet (Sidebar) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg p-0 bg-white/10 backdrop-blur-md border border-white/20 text-white"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="px-4 py-4 border-b border-white/10">
              <SheetTitle className="flex items-center gap-2 text-white text-lg font-semibold">
                <Users className="w-5 h-5 text-yellow-400" />
                {classData.className} - Students
              </SheetTitle>
              <p className="text-white/60 text-sm mt-1">
                {classData.enrolledCount} enrolled • {classData.paidCount} paid • {classData.withDuesCount} with dues
              </p>
            </SheetHeader>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                {/* Students Header Row */}
                <div className="flex items-center justify-between py-2 px-3 bg-white/[0.02] text-xs text-white/50 font-medium rounded-t-lg border border-white/10">
                  <span>Student</span>
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-center">Payment</span>
                    <span className="w-12 text-center">Attend.</span>
                    <span className="w-12 text-center">HW</span>
                  </div>
                </div>

                {/* Students List */}
                <div className="border-x border-b border-white/10 rounded-b-lg overflow-hidden">
                  {studentsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white/60" />
                    </div>
                  ) : students && students.length > 0 ? (
                    <StudentPaymentRowList students={students} />
                  ) : (
                    <div className="text-center py-12 text-sm text-white/50">
                      No students enrolled in this class
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </GlassCard>
  );
});

ClassPaymentCard.displayName = 'ClassPaymentCard';

export default ClassPaymentCard;
