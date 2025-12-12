import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
        // Note: Using inline error UI only - no toast for loading failures to avoid duplicate feedback
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

  // Calculate attention indicators (calmer language focused on support, not alarm)
  const getAtRiskIndicator = useCallback((summary: StudentLessonSummary) => {
    const hasHighAbsences = summary.attendance.absent >= 3;
    const hasHighMissingHomework = summary.homework.missing >= 3;
    
    if (hasHighAbsences && hasHighMissingHomework) {
      return { show: true, color: 'bg-amber-400', label: 'Needs attention', title: `${summary.attendance.absent} absences, ${summary.homework.missing} missing homework` };
    }
    if (hasHighAbsences) {
      return { show: true, color: 'bg-amber-400/80', label: 'Attendance note', title: `${summary.attendance.absent} absences` };
    }
    if (hasHighMissingHomework) {
      return { show: true, color: 'bg-amber-400/80', label: 'Homework note', title: `${summary.homework.missing} missing homework` };
    }
    return { show: false, color: '', label: '', title: '' };
  }, []);

  // Determine if any student has billing data (discount or payment obligation)
  const hasAnyBillingData = useMemo(() => {
    return summaries.some((s) => s.discount?.hasDiscount || s.paymentObligation?.hasPendingObligations);
  }, [summaries]);

  // Determine if any student has comments
  const hasAnyComments = useMemo(() => {
    return summaries.some((s) => s.commentsCount > 0);
  }, [summaries]);

  // Calculate column count for expanded row colspan
  const getColSpan = () => {
    let cols = 3; // Expand, Student, Progress (always shown)
    if (hasAnyBillingData) cols++;
    if (hasAnyComments) cols++;
    if (mode === 'view' && (onRemoveStudent || onTransferStudent)) cols++;
    return cols;
  };

  // Refetch function for retry button
  const handleRetry = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await classApiService.getClassStudentsSummary(classId);
      setSummaries(data);
    } catch (err: any) {
      console.error('Error fetching student summaries:', err);
      setError(err.message || 'Failed to load student summaries');
    } finally {
      setLoading(false);
    }
  }, [classId]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-white/60" />
            <div className="text-white/70 text-sm">Loading student progress data...</div>
          </div>
        </div>
        {/* Skeleton rows */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Error state - softer amber styling for recoverable errors
  if (error) {
    return (
      <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-amber-200">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <Button
            onClick={handleRetry}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 transition-colors"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (summaries.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
        <div className="py-4">
          <User className="w-12 h-12 mx-auto mb-3 text-white/40" />
          <h3 className="text-lg font-semibold text-white mb-2">No Students Enrolled</h3>
          <p className="text-white/60 text-sm mb-4">There are no students enrolled in this class yet.</p>
          {mode === 'view' && onAddStudents && (
            <Button
              onClick={onAddStudents}
              disabled={isAddingStudents}
              variant="outline"
              className="gap-2 border-white/30 bg-white/10 hover:bg-white/20 text-white font-medium"
            >
              Add Students
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/20 hover:bg-transparent">
              <TableHead className="text-white/90 font-semibold w-8"></TableHead>
              <TableHead className="text-white/90 font-semibold min-w-[180px]">Student</TableHead>
              <TableHead className="text-white/90 font-semibold min-w-[220px]">Progress</TableHead>
              {hasAnyBillingData && (
                <TableHead className="hidden md:table-cell text-white/90 font-semibold text-center w-24">Billing</TableHead>
              )}
              {hasAnyComments && (
                <TableHead className="hidden lg:table-cell text-white/90 font-semibold text-center w-20">Notes</TableHead>
              )}
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
                  <TableRow className="border-white/10 hover:bg-white/5 transition-colors bg-white/[0.02]">
                    {/* Expand button */}
                    <TableCell className="py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRow(summary.studentId)}
                        className="h-8 w-8 p-0 hover:bg-white/10 transition-colors"
                        aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-white/70" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-white/70" />
                        )}
                      </Button>
                    </TableCell>

                    {/* Student name with risk indicator */}
                    <TableCell className="font-medium py-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/students/${summary.studentId}`)}
                          className="text-blue-300 hover:text-blue-200 hover:underline cursor-pointer transition-colors text-base font-bold"
                        >
                          {summary.studentName}
                        </button>
                        {riskIndicator.show && (
                          <div
                            className={`w-2 h-2 rounded-full ${riskIndicator.color} transition-transform hover:scale-125`}
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

                    {/* Billing: Combined Discounts + Payments - only shown if any student has data */}
                    {hasAnyBillingData && (
                      <TableCell className="hidden md:table-cell text-center py-2">
                        {summary.discount?.hasDiscount || summary.paymentObligation?.hasPendingObligations ? (
                          <div className="flex items-center justify-center gap-1">
                            {summary.discount && <DiscountIndicator discount={summary.discount} />}
                            {summary.paymentObligation && <PaymentObligationIndicator paymentObligation={summary.paymentObligation} />}
                          </div>
                        ) : (
                          <span className="text-white/40 text-sm">—</span>
                        )}
                      </TableCell>
                    )}

                    {/* Notes: Simplified count badge - only shown if any student has comments */}
                    {hasAnyComments && (
                      <TableCell className="hidden lg:table-cell text-center py-2">
                        {summary.commentsCount > 0 ? (
                          <div className="flex items-center justify-center gap-1 text-white/70 text-xs">
                            <MessageSquare className="w-3 h-3" />
                            <span>{summary.commentsCount}</span>
                          </div>
                        ) : (
                          <span className="text-white/40 text-xs">—</span>
                        )}
                      </TableCell>
                    )}

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
                        colSpan={getColSpan()}
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
    </div>
  );
};

export default React.memo(StudentProgressTable);
