import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '@/components/common/GlassCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StudentLessonSummary, StudentLessonDetail } from '@/types/api/class';
import { classApiService } from '@/services/classApiService';
import { ChevronDown, ChevronRight, User, AlertCircle, Loader2, MessageSquare, TrendingUp, Trash2, Plus } from 'lucide-react';
import AttendanceSummaryBadges from './AttendanceSummaryBadges';
import HomeworkSummaryBadges from './HomeworkSummaryBadges';
import StudentLessonDetailsRow from './StudentLessonDetailsRow';
import { toast } from 'sonner';

interface StudentProgressTableProps {
  classId: string;
  mode?: 'view' | 'edit';
  isAddingStudents?: boolean;
  onAddStudents?: () => void;
  onRemoveStudent?: (studentId: string, studentName: string, hasAttendance: boolean) => void;
}

const StudentProgressTable: React.FC<StudentProgressTableProps> = ({
  classId,
  mode = 'view',
  isAddingStudents = false,
  onAddStudents,
  onRemoveStudent,
}) => {
  const navigate = useNavigate();
  const [summaries, setSummaries] = useState<StudentLessonSummary[]>([]);
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());
  const [lessonDetails, setLessonDetails] = useState<Record<string, StudentLessonDetail[]>>({});
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch summary data on mount
  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await classApiService.getClassStudentsSummary(classId);
        setSummaries(data);
      } catch (err: any) {
        console.error('Error fetching student summaries:', err);
        setError(err.message || 'Failed to load student summaries');
        toast.error('Failed to load student data');
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, [classId]);

  // Toggle row expansion and lazy load details
  const toggleRow = useCallback(async (studentId: string) => {
    const isCurrentlyExpanded = expandedStudents.has(studentId);
    
    if (isCurrentlyExpanded) {
      // Collapse row
      setExpandedStudents((prev) => {
        const next = new Set(prev);
        next.delete(studentId);
        return next;
      });
    } else {
      // Expand row and fetch details if not cached
      setExpandedStudents((prev) => new Set(prev).add(studentId));

      if (!lessonDetails[studentId]) {
        setLoadingDetails((prev) => new Set(prev).add(studentId));
        try {
          const details = await classApiService.getClassStudentLessons(classId, studentId);
          setLessonDetails((prev) => ({ ...prev, [studentId]: details }));
        } catch (err: any) {
          console.error('Error fetching lesson details:', err);
          toast.error('Failed to load lesson details');
        } finally {
          setLoadingDetails((prev) => {
            const next = new Set(prev);
            next.delete(studentId);
            return next;
          });
        }
      }
    }
  }, [classId, expandedStudents, lessonDetails]);

  // Calculate at-risk indicators
  const getAtRiskIndicator = useCallback((summary: StudentLessonSummary) => {
    const hasHighAbsences = summary.attendance.absent >= 3;
    const hasHighMissingHomework = summary.homework.missing >= 3;
    
    if (hasHighAbsences && hasHighMissingHomework) {
      return { show: true, color: 'bg-red-500', label: 'High Risk', title: `${summary.attendance.absent} absences, ${summary.homework.missing} missing homework` };
    }
    if (hasHighAbsences) {
      return { show: true, color: 'bg-amber-500', label: 'Attendance Risk', title: `${summary.attendance.absent} absences` };
    }
    if (hasHighMissingHomework) {
      return { show: true, color: 'bg-amber-500', label: 'Homework Risk', title: `${summary.homework.missing} missing homework` };
    }
    return { show: false, color: '', label: '', title: '' };
  }, []);

  // Memoized total lessons count for header
  const totalConductedLessons = useMemo(() => {
    if (summaries.length === 0) return 0;
    return Math.max(...summaries.map((s) => s.totalLessons));
  }, [summaries]);

  // Loading state
  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-center space-y-4">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-white/60" />
            <div className="text-white/70 text-sm">Loading student progress data...</div>
          </div>
        </div>
        {/* Skeleton rows */}
        <div className="mt-6 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      </GlassCard>
    );
  }

  // Error state
  if (error) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-between p-4 rounded-xl border border-red-400/30 bg-red-400/10">
          <div className="flex items-center gap-2 text-red-200">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Retry
          </Button>
        </div>
      </GlassCard>
    );
  }

  // Empty state
  if (summaries.length === 0) {
    return (
      <GlassCard className="p-4 text-center">
        <div className="py-4">
          <User className="w-12 h-12 mx-auto mb-3 text-white/40" />
          <h3 className="text-lg font-semibold text-white mb-2">No Students Enrolled</h3>
          <p className="text-white/60 text-sm">There are no students enrolled in this class yet.</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Student Progress Summary</h3>
            <p className="text-white/60 text-sm">
              {summaries.length} {summaries.length === 1 ? 'student' : 'students'} | {totalConductedLessons} {totalConductedLessons === 1 ? 'lesson' : 'lessons'} conducted
            </p>
          </div>
        </div>
        {mode === 'view' && onAddStudents && (
          <Button
            onClick={onAddStudents}
            disabled={isAddingStudents}
            className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium"
          >
            {isAddingStudents ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Students
              </>
            )}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/20 hover:bg-transparent">
              <TableHead className="text-white/90 font-semibold w-8"></TableHead>
              <TableHead className="text-white/90 font-semibold min-w-[180px]">Student</TableHead>
              <TableHead className="text-white/90 font-semibold text-center w-24">Lessons</TableHead>
              <TableHead className="text-white/90 font-semibold min-w-[220px]">Attendance</TableHead>
              <TableHead className="text-white/90 font-semibold min-w-[220px]">Homework</TableHead>
              <TableHead className="text-white/90 font-semibold text-center w-28">Comments</TableHead>
              {mode === 'view' && onRemoveStudent && (
                <TableHead className="text-white/90 font-semibold text-center w-20">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaries.map((summary) => {
              const isExpanded = expandedStudents.has(summary.studentId);
              const isLoadingDetails = loadingDetails.has(summary.studentId);
              const details = lessonDetails[summary.studentId] || [];
              const riskIndicator = getAtRiskIndicator(summary);
              const hasAttendance = summary.totalLessons > 0;
              const canRemove = !hasAttendance && mode === 'view';

              return (
                <React.Fragment key={summary.studentId}>
                  {/* Main row */}
                  <TableRow className="border-white/10 hover:bg-white/5 transition-colors">
                    {/* Expand button */}
                    <TableCell className="py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRow(summary.studentId)}
                        className="h-8 w-8 p-0 hover:bg-white/10"
                        aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-white/70" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-white/70" />
                        )}
                      </Button>
                    </TableCell>

                    {/* Student name with risk indicator */}
                    <TableCell className="font-medium py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/students/${summary.studentId}`)}
                          className="text-blue-300 hover:text-blue-200 hover:underline cursor-pointer transition-colors text-sm font-semibold"
                        >
                          {summary.studentName}
                        </button>
                        {riskIndicator.show && (
                          <div
                            className={`w-2 h-2 rounded-full ${riskIndicator.color} animate-pulse`}
                            title={riskIndicator.title}
                          />
                        )}
                      </div>
                    </TableCell>

                    {/* Total lessons */}
                    <TableCell className="text-center py-3">
                      <span className="text-white font-semibold">{summary.totalLessons}</span>
                    </TableCell>

                    {/* Attendance badges */}
                    <TableCell className="py-3">
                      <AttendanceSummaryBadges attendance={summary.attendance} />
                    </TableCell>

                    {/* Homework badges */}
                    <TableCell className="py-3">
                      <HomeworkSummaryBadges homework={summary.homework} />
                    </TableCell>

                    {/* Comments count */}
                    <TableCell className="text-center py-3">
                      {summary.commentsCount > 0 ? (
                        <div className="flex items-center justify-center gap-1.5 text-blue-300">
                          <MessageSquare className="w-4 h-4" />
                          <span className="font-semibold">{summary.commentsCount}</span>
                        </div>
                      ) : (
                        <span className="text-white/40 text-sm">—</span>
                      )}
                    </TableCell>

                    {/* Remove button */}
                    {mode === 'view' && onRemoveStudent && (
                      <TableCell className="text-center py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onRemoveStudent(
                              summary.studentId,
                              summary.studentName,
                              hasAttendance
                            )
                          }
                          disabled={hasAttendance}
                          className={`h-8 w-8 p-0 ${
                            hasAttendance
                              ? 'opacity-50 cursor-not-allowed hover:bg-transparent'
                              : 'hover:bg-red-500/20 text-red-400 hover:text-red-300'
                          }`}
                          title={
                            hasAttendance
                              ? 'Cannot remove student with lesson attendance'
                              : 'Remove student from class'
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>

                  {/* Expandable details row */}
                  {isExpanded && (
                    <TableRow className="border-white/10">
                      <TableCell
                        colSpan={mode === 'view' && onRemoveStudent ? 7 : 6}
                        className="p-0 bg-white/5"
                      >
                        <StudentLessonDetailsRow
                          lessons={details}
                          loading={isLoadingDetails}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </GlassCard>
  );
};

export default React.memo(StudentProgressTable);
