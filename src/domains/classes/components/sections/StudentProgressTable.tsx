import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '@/components/common/GlassCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StudentLessonSummary, StudentLessonDetail } from '@/types/api/class';
import { classApiService } from '@/services/classApiService';
import { ChevronDown, ChevronRight, User, AlertCircle, Loader2, MessageSquare, Plus } from 'lucide-react';
import StudentLessonDetailsRow from './StudentLessonDetailsRow';
import StudentProgressChips from './StudentProgressChips';
import StudentRowActionsMenu from './StudentRowActionsMenu';
import { DiscountIndicator, PaymentObligationIndicator } from './PrivacyIndicator';
import { toast } from 'sonner';

interface StudentProgressTableProps {
  classId: string;
  mode?: 'view' | 'edit';
  isAddingStudents?: boolean;
  onAddStudents?: () => void;
  onRemoveStudent?: (studentId: string, studentName: string, hasAttendance: boolean) => void;
  onTransferStudent?: (studentId: string, studentName: string) => void;
}

const StudentProgressTable: React.FC<StudentProgressTableProps> = ({
  classId,
  mode = 'view',
  isAddingStudents = false,
  onAddStudents,
  onRemoveStudent,
  onTransferStudent,
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
      <GlassCard className="p-3">
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
      <GlassCard className="p-3">
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
      <GlassCard className="p-6 text-center">
        <div className="py-4">
          <User className="w-12 h-12 mx-auto mb-3 text-white/40" />
          <h3 className="text-lg font-semibold text-white mb-2">No Students Enrolled</h3>
          <p className="text-white/60 text-sm mb-4">There are no students enrolled in this class yet.</p>
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
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-3">
      {/* Compact Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-white/70">
          {summaries.length} {summaries.length === 1 ? 'student' : 'students'} · {totalConductedLessons} {totalConductedLessons === 1 ? 'lesson' : 'lessons'} conducted
        </div>
        <div className="flex items-center gap-2">
          {mode === 'view' && onAddStudents && (
            <Button
              onClick={onAddStudents}
              disabled={isAddingStudents}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              {isAddingStudents ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3" /> 
                  Add Students
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/20 hover:bg-transparent">
              <TableHead className="text-white/90 font-semibold w-8"></TableHead>
              <TableHead className="text-white/90 font-semibold min-w-[180px]">Student</TableHead>
              <TableHead className="text-white/90 font-semibold min-w-[220px]">Progress</TableHead>
              <TableHead className="text-white/90 font-semibold text-center w-24">Billing</TableHead>
              <TableHead className="text-white/90 font-semibold text-center w-20">Comments</TableHead>
              {mode === 'view' && (onRemoveStudent || onTransferStudent) && (
                <TableHead className="text-white/90 font-semibold text-center w-16">Actions</TableHead>
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
                    <TableCell className="font-medium py-2">
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

                    {/* Progress: Combined Lessons + Attendance + Homework */}
                    <TableCell className="py-2">
                      <StudentProgressChips
                        totalLessons={summary.totalLessons}
                        attendance={summary.attendance}
                        homework={summary.homework}
                      />
                    </TableCell>

                    {/* Billing: Combined Discounts + Payments */}
                    <TableCell className="text-center py-2">
                      {summary.discount || summary.paymentObligation ? (
                        <div className="flex items-center justify-center gap-1">
                          {summary.discount && <DiscountIndicator discount={summary.discount} />}
                          {summary.paymentObligation && <PaymentObligationIndicator paymentObligation={summary.paymentObligation} />}
                        </div>
                      ) : (
                        <span className="text-white/30 text-sm">—</span>
                      )}
                    </TableCell>

                    {/* Comments: Simplified count badge */}
                    <TableCell className="text-center py-2">
                      {summary.commentsCount > 0 ? (
                        <div className="flex items-center justify-center gap-1 text-white/70 text-xs">
                          <MessageSquare className="w-3 h-3" />
                          <span>{summary.commentsCount}</span>
                        </div>
                      ) : (
                        <span className="text-white/30 text-xs">—</span>
                      )}
                    </TableCell>

                    {/* Actions: Dropdown Menu */}
                    {mode === 'view' && (onRemoveStudent || onTransferStudent) && (
                      <TableCell className="text-center py-2">
                        <div className="flex items-center justify-center">
                          <StudentRowActionsMenu
                            studentId={summary.studentId}
                            studentName={summary.studentName}
                            hasAttendance={hasAttendance}
                            onTransfer={onTransferStudent}
                            onRemove={onRemoveStudent}
                          />
                        </div>
                      </TableCell>
                    )}
                  </TableRow>

                  {/* Expandable details row */}
                  {isExpanded && (
                    <TableRow className="border-white/10">
                      <TableCell
                        colSpan={mode === 'view' && (onRemoveStudent || onTransferStudent) ? 6 : 5}
                        className="p-0 bg-white/[0.02]"
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
