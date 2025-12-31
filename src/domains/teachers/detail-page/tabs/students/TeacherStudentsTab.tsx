import React from 'react';
import { Users, AlertCircle, Filter, BookOpen } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TeacherStudentsTable from './TeacherStudentsTable';
import { useTeacherStudents } from './useTeacherStudents';

interface TeacherStudentsTabProps {
  teacherId: string;
}

/**
 * Stats bar showing student statistics
 */
const StudentsStatsBar: React.FC<{
  totalStudents: number;
  activeEnrollments: number;
  uniqueStudents: number;
  uniqueClasses: number;
}> = ({ totalStudents, activeEnrollments, uniqueStudents, uniqueClasses }) => (
  <div className="flex flex-wrap gap-4 text-sm text-white/70">
    <div className="flex items-center gap-1.5">
      <Users className="w-4 h-4 text-blue-400" />
      <span>
        <strong className="text-white">{uniqueStudents}</strong> unique students
      </span>
    </div>
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-green-400" />
      <span>
        <strong className="text-white">{activeEnrollments}</strong> active enrollments
      </span>
    </div>
    <div className="flex items-center gap-1.5">
      <BookOpen className="w-4 h-4 text-purple-400" />
      <span>
        <strong className="text-white">{uniqueClasses}</strong> classes
      </span>
    </div>
    <div className="text-white/50">
      ({totalStudents} total enrollments)
    </div>
  </div>
);

/**
 * TeacherStudentsTab - Displays all students taught by a teacher
 */
const TeacherStudentsTab: React.FC<TeacherStudentsTabProps> = ({ teacherId }) => {
  const {
    filteredStudents,
    stats,
    loading,
    error,
    selectedClassId,
    setSelectedClassId,
    activeEnrollmentsOnly,
    setActiveEnrollmentsOnly,
    classes,
    refresh,
  } = useTeacherStudents({ teacherId });

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
          <h3 className="text-lg font-semibold text-white mb-2">
            Failed to Load Students
          </h3>
          <p className="text-white/70 mb-4">{error}</p>
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

  // Empty state - no students at all
  if (!stats || stats.totalStudents === 0) {
    return (
      <GlassCard className="p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="w-16 h-16 text-white/20 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            No Students Yet
          </h3>
          <p className="text-white/70 max-w-md">
            This teacher doesn't have any students enrolled in their classes yet.
            Students will appear here once they are enrolled in classes taught by this teacher.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <StudentsStatsBar
          totalStudents={stats.totalStudents}
          activeEnrollments={stats.activeEnrollments}
          uniqueStudents={stats.uniqueStudents}
          uniqueClasses={stats.uniqueClasses}
        />
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/40" />
            <span className="text-sm text-white/70">Filters:</span>
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-2">
            <Label htmlFor="class-filter" className="text-sm text-white/70">
              Class:
            </Label>
            <Select
              value={selectedClassId || 'all'}
              onValueChange={(value) => setSelectedClassId(value === 'all' ? null : value)}
            >
              <SelectTrigger
                id="class-filter"
                className="w-[200px] bg-white/5 border-white/20 text-white"
              >
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/20">
                <SelectItem value="all" className="text-white hover:bg-white/10">
                  All Classes
                </SelectItem>
                {classes.map((cls) => (
                  <SelectItem
                    key={cls.id}
                    value={cls.id}
                    className="text-white hover:bg-white/10"
                  >
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Enrollments Toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="active-only"
              checked={activeEnrollmentsOnly}
              onCheckedChange={setActiveEnrollmentsOnly}
            />
            <Label htmlFor="active-only" className="text-sm text-white/70 cursor-pointer">
              Active enrollments only
            </Label>
          </div>

          {/* Results count */}
          <div className="ml-auto text-sm text-white/50">
            Showing {filteredStudents.length} of {stats.totalStudents} enrollments
          </div>
        </div>
      </GlassCard>

      {/* Students Table */}
      {filteredStudents.length > 0 ? (
        <TeacherStudentsTable students={filteredStudents} />
      ) : (
        <GlassCard className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="w-12 h-12 text-white/20 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No Matching Students
            </h3>
            <p className="text-white/70">
              No students match the current filters. Try adjusting your filter settings.
            </p>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default TeacherStudentsTab;
