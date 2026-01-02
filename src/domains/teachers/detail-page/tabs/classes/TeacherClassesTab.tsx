import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Calendar, ChevronRight, AlertCircle, DollarSign, Edit2 } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTeacherClasses } from './useTeacherClasses';
import { useTeacherPaymentRates } from './useTeacherPaymentRates';
import { SetPaymentRateDialog } from '../../dialogs/SetPaymentRateDialog';
import { TeacherClassDto, TeacherClassScheduleSlot } from '@/types/api/teacher';

interface TeacherClassesTabProps {
  teacherId: string;
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
 * Single class card component
 */
const ClassCard: React.FC<{
  classData: TeacherClassDto;
  teacherId: string;
  onNavigate: (classId: string) => void;
  paymentRate?: { id: string; rate: number };
  onEditRate: (classId: string, className: string) => void;
}> = ({ classData, teacherId, onNavigate, paymentRate, onEditRate }) => {
  const capacityPercentage = classData.classroomCapacity > 0
    ? Math.round((classData.enrolledCount / classData.classroomCapacity) * 100)
    : 0;

  const isNearCapacity = capacityPercentage >= 80;
  const isAtCapacity = capacityPercentage >= 100;

  const handleCardClick = () => {
    onNavigate(classData.classId);
  };

  const handleEditRate = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card navigation
    onEditRate(classData.classId, classData.className);
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

        {/* Payment Rate */}
        <div className="flex items-center text-sm text-white/70 justify-between">
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-white/40" />
            {paymentRate ? (
              <span className="font-medium text-green-400">
                ${paymentRate.rate.toFixed(2)}/lesson
              </span>
            ) : (
              <span className="text-white/40 italic">Not set</span>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10"
            onClick={handleEditRate}
          >
            <Edit2 className="w-3 h-3 mr-1" />
            {paymentRate ? 'Edit' : 'Set'}
          </Button>
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
 * TeacherClassesTab - Displays all classes assigned to a teacher
 */
const TeacherClassesTab: React.FC<TeacherClassesTabProps> = ({ teacherId }) => {
  const navigate = useNavigate();
  const {
    filteredClasses,
    loading,
    error,
    academicYears,
    selectedYearId,
    setSelectedYearId,
    activeFilter,
    setActiveFilter,
    refresh,
  } = useTeacherClasses({ teacherId });

  const {
    rates,
    loading: ratesLoading,
    setRate,
    updateRate,
    getRateForClass,
  } = useTeacherPaymentRates({ teacherId });

  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<{ id: string; name: string } | null>(null);

  const handleNavigateToClass = (classId: string) => {
    navigate(`/classes/${classId}`);
  };

  const handleEditRate = (classId: string, className: string) => {
    setSelectedClass({ id: classId, name: className });
    setRateDialogOpen(true);
  };

  const handleRateSubmit = async (request: any) => {
    if (!selectedClass) return;

    const existingRate = getRateForClass(selectedClass.id);
    if (existingRate) {
      await updateRate(existingRate.id, request);
    } else {
      await setRate(request);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <GlassCard className="p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Failed to load classes</h3>
          <p className="text-white/60 mb-4">{error}</p>
          <Button
            onClick={refresh}
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
      {/* Payment Rate Dialog */}
      {selectedClass && (
        <SetPaymentRateDialog
          open={rateDialogOpen}
          onOpenChange={setRateDialogOpen}
          teacherId={teacherId}
          classId={selectedClass.id}
          className={selectedClass.name}
          existingRate={getRateForClass(selectedClass.id)}
          onSubmit={handleRateSubmit}
        />
      )}

      {/* Filters bar */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Academic Year filter */}
          {academicYears.length > 0 && (
            <div className="flex-1">
              <label className="text-xs text-white/50 mb-2 block">Academic Year</label>
              <div className="flex flex-wrap gap-2">
                {academicYears.map(year => (
                  <Button
                    key={year.id}
                    size="sm"
                    variant={selectedYearId === year.id ? 'default' : 'outline'}
                    className={selectedYearId === year.id
                      ? 'bg-blue-500/80 hover:bg-blue-500 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white/70 border-white/20'
                    }
                    onClick={() => setSelectedYearId(year.id)}
                  >
                    {year.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Status filter */}
          <div>
            <label className="text-xs text-white/50 mb-2 block">Status</label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={activeFilter === null ? 'default' : 'outline'}
                className={activeFilter === null
                  ? 'bg-blue-500/80 hover:bg-blue-500 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white/70 border-white/20'
                }
                onClick={() => setActiveFilter(null)}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={activeFilter === true ? 'default' : 'outline'}
                className={activeFilter === true
                  ? 'bg-green-500/80 hover:bg-green-500 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white/70 border-white/20'
                }
                onClick={() => setActiveFilter(true)}
              >
                Active
              </Button>
              <Button
                size="sm"
                variant={activeFilter === false ? 'default' : 'outline'}
                className={activeFilter === false
                  ? 'bg-gray-500/80 hover:bg-gray-500 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white/70 border-white/20'
                }
                onClick={() => setActiveFilter(false)}
              >
                Inactive
              </Button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Empty state */}
      {filteredClasses.length === 0 ? (
        <GlassCard className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BookOpen className="w-12 h-12 text-white/30 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No classes found</h3>
            <p className="text-white/60">
              {academicYears.length === 0
                ? 'This teacher has no classes assigned yet.'
                : 'No classes match the current filters.'}
            </p>
          </div>
        </GlassCard>
      ) : (
        /* Class cards grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map(classData => {
            const rate = getRateForClass(classData.classId);
            return (
              <ClassCard
                key={classData.classId}
                classData={classData}
                teacherId={teacherId}
                onNavigate={handleNavigateToClass}
                paymentRate={rate ? {
                  id: rate.id,
                  rate: rate.ratePerLesson,
                } : undefined}
                onEditRate={handleEditRate}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeacherClassesTab;
