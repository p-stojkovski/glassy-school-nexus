import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Calendar, ChevronRight, AlertCircle } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTeacherClasses } from './useTeacherClasses';
import { useTeacherClassesWithPayments } from './useTeacherClassesWithPayments';
import { TeacherClassDto, TeacherClassScheduleSlot } from '@/types/api/teacher';
import ClassPaymentCard from './ClassPaymentCard';

interface TeacherClassesTabProps {
  teacherId: string;
  academicYearId?: string | null;
  yearName?: string;
}

/**
 * Format schedule slots into a readable string.
 * Groups consecutive slots on the same day with different times.
 * Example: "Mon, Wed 9:00-10:30" or "Mon 9:00-10:30, Wed 14:00-15:30"
 */
function formatSchedule(slots: TeacherClassScheduleSlot[]): string {
  if (!slots || slots.length === 0) {
    return 'No schedule';
  }

  // Group slots by time pattern
  const timeGroups = new Map<string, string[]>();

  slots.forEach(slot => {
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
}

/**
 * Single class card component for list view (original design - fallback)
 */
const ClassCard: React.FC<{
  classData: TeacherClassDto;
  onNavigate: (classId: string) => void;
}> = ({ classData, onNavigate }) => {
  const capacityPercentage = classData.classroomCapacity > 0
    ? Math.round((classData.enrolledCount / classData.classroomCapacity) * 100)
    : 0;

  const isNearCapacity = capacityPercentage >= 80;
  const isAtCapacity = capacityPercentage >= 100;

  const handleCardClick = () => {
    onNavigate(classData.classId);
  };

  return (
    <GlassCard
      className="p-4 cursor-pointer transition-all hover:bg-white/5"
      onClick={handleCardClick}
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
          className={classData.isActive
            ? 'bg-green-500/20 text-green-400 border-green-500/30'
            : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
          }
        >
          {classData.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="space-y-2">
        {/* Student count */}
        <div className="flex items-center text-sm text-white/70">
          <Users className="w-4 h-4 mr-2 text-white/40" />
          <span className={isAtCapacity ? 'text-red-400' : isNearCapacity ? 'text-yellow-400' : ''}>
            {classData.enrolledCount} / {classData.classroomCapacity} students
          </span>
          {isAtCapacity && (
            <span className="ml-2 text-xs text-red-400">(Full)</span>
          )}
        </div>

        {/* Schedule */}
        <div className="flex items-center text-sm text-white/70">
          <Calendar className="w-4 h-4 mr-2 text-white/40" />
          <span className="truncate">{formatSchedule(classData.scheduleSlots)}</span>
        </div>

        {/* Academic year */}
        <div className="text-xs text-white/50">
          {classData.academicYearName}
        </div>
      </div>

      <div className="mt-3 flex items-center text-xs text-white/40">
        <span>View class details</span>
        <ChevronRight className="w-3 h-3 ml-1" />
      </div>
    </GlassCard>
  );
};

/**
 * TeacherClassesTab - Classes list with filters and payment visibility per class.
 */
const TeacherClassesTab: React.FC<TeacherClassesTabProps> = ({ teacherId, academicYearId, yearName }) => {
  const navigate = useNavigate();

  // Fetch classes data
  const {
    filteredClasses,
    loading: classesLoading,
    error: classesError,
    refresh: refreshClasses,
  } = useTeacherClasses({ teacherId, academicYearId });

  // Fetch payment data for class cards
  const {
    classes: paymentClasses,
    loading: paymentLoading,
    studentsByClass,
    studentsLoadingByClass,
    loadStudentsForClass,
  } = useTeacherClassesWithPayments({ teacherId });

  const handleNavigateToClass = (classId: string) => {
    navigate(`/classes/${classId}`);
  };

  // Loading state
  if (classesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  // Error state
  if (classesError) {
    return (
      <GlassCard className="p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Failed to load classes</h3>
          <p className="text-white/60 mb-4">{classesError}</p>
          <Button
            onClick={refreshClasses}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Try Again
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Empty state */}
      {filteredClasses.length === 0 ? (
        <GlassCard className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BookOpen className="w-12 h-12 text-white/30 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {yearName ? `No Classes for ${yearName}` : 'No classes found'}
            </h3>
            <p className="text-white/60">
              {yearName
                ? `This teacher has no classes assigned for ${yearName}. Try selecting a different academic year from the header.`
                : 'This teacher has no classes assigned yet.'}
            </p>
          </div>
        </GlassCard>
      ) : (
        /* Class cards grid - Show payment cards if payment data is available */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paymentClasses.length > 0 && !paymentLoading
            ? // Payment-enhanced cards
              paymentClasses
                .filter((pc) => {
                  // Apply the same filters as regular classes
                  const regularClass = filteredClasses.find((fc) => fc.classId === pc.classId);
                  return !!regularClass;
                })
                .map((classData) => (
                  <ClassPaymentCard
                    key={classData.classId}
                    classData={classData}
                    students={studentsByClass[classData.classId]}
                    studentsLoading={studentsLoadingByClass[classData.classId]}
                    onExpand={() => loadStudentsForClass(classData.classId)}
                  />
                ))
            : // Original cards (fallback if payment data fails)
              filteredClasses.map((classData) => (
                <ClassCard
                  key={classData.classId}
                  classData={classData}
                  onNavigate={handleNavigateToClass}
                />
              ))}
        </div>
      )}
    </div>
  );
};

export default TeacherClassesTab;
