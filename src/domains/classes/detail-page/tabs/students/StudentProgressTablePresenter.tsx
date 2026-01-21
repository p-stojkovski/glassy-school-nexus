import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StudentLessonSummary, StudentLessonDetail } from '@/types/api/class';
import { ChevronDown, ChevronRight, User, AlertCircle, Search, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StudentLessonDetailsRow from './StudentLessonDetailsRow';
import StudentProgressChips from './StudentProgressChips';
import StudentRowActionsMenu from './StudentRowActionsMenu';
import { DiscountIndicator, PaymentObligationIndicator } from './PrivacyIndicator';
import { StudentFilter, applyStudentFilter } from '@/domains/classes/_shared/utils/studentFilters';
import { LoadingTableSkeleton } from '@/domains/classes/_shared/components';
import { EmptyState } from '@/components/common';

/**
 * Props for the StudentProgressTablePresenter component.
 * This is a pure presentation component - all data comes via props.
 */
export interface StudentProgressTablePresenterProps {
  /** Student summary data */
  summaries: StudentLessonSummary[];
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Map of studentId -> lesson details */
  lessonDetails: Record<string, StudentLessonDetail[]>;
  /** Set of studentIds currently loading details */
  loadingDetails: Set<string>;
  /** Set of currently expanded student rows */
  expandedStudents: Set<string>;
  /** Mode: view or edit */
  mode?: 'view' | 'edit';
  /** Whether students are being added */
  isAddingStudents?: boolean;
  /** Search query for filtering */
  searchQuery?: string;
  /** Student filter type */
  studentFilter?: StudentFilter;

  // Callbacks
  /** Toggle row expansion */
  onToggleRow: (studentId: string) => void;
  /** Add students button click */
  onAddStudents?: () => void;
  /** Remove student request */
  onRemoveStudent?: (studentId: string, studentName: string, hasAttendance: boolean) => void;
  /** Transfer student request */
  onTransferStudent?: (studentId: string, studentName: string) => void;
  /** Retry fetching data */
  onRetry: () => void;
  /** Clear search */
  onClearSearch?: () => void;
}

/**
 * Calculate attention indicator for a student based on their progress.
 */
const getAtRiskIndicator = (summary: StudentLessonSummary) => {
  const hasHighAbsences = summary.attendance.absent >= 3;
  const hasHighMissingHomework = summary.homework.missing >= 3;

  if (hasHighAbsences && hasHighMissingHomework) {
    return {
      show: true,
      color: 'bg-amber-400',
      label: 'Needs attention',
      title: `${summary.attendance.absent} absences, ${summary.homework.missing} missing homework`,
    };
  }
  if (hasHighAbsences) {
    return {
      show: true,
      color: 'bg-amber-400/80',
      label: 'Attendance note',
      title: `${summary.attendance.absent} absences`,
    };
  }
  if (hasHighMissingHomework) {
    return {
      show: true,
      color: 'bg-amber-400/80',
      label: 'Homework note',
      title: `${summary.homework.missing} missing homework`,
    };
  }
  return { show: false, color: '', label: '', title: '' };
};

/**
 * StudentProgressTablePresenter - Pure presentation component for student progress.
 *
 * This component is designed for testability:
 * - All data comes via props (no internal data fetching)
 * - All actions are callbacks (no side effects)
 * - Pure rendering logic only
 *
 * @example
 * <StudentProgressTablePresenter
 *   summaries={summaryData}
 *   loading={false}
 *   error={null}
 *   lessonDetails={{}}
 *   loadingDetails={new Set()}
 *   expandedStudents={new Set()}
 *   onToggleRow={handleToggle}
 *   onRetry={handleRetry}
 * />
 */
const StudentProgressTablePresenter: React.FC<StudentProgressTablePresenterProps> = ({
  summaries,
  loading,
  error,
  lessonDetails,
  loadingDetails,
  expandedStudents,
  mode = 'view',
  isAddingStudents = false,
  searchQuery = '',
  studentFilter = 'all',
  onToggleRow,
  onAddStudents,
  onRemoveStudent,
  onTransferStudent,
  onRetry,
  onClearSearch,
}) => {
  const navigate = useNavigate();

  // Filter summaries based on search query and student filter
  const filteredSummaries = useMemo(() => {
    let filtered = applyStudentFilter(summaries, { filter: studentFilter });

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((s) => s.studentName.toLowerCase().includes(query));
    }

    return filtered;
  }, [summaries, searchQuery, studentFilter]);

  // Check if any student has discount data
  const hasAnyDiscountData = useMemo(() => {
    return filteredSummaries.some((s) => s.discount?.hasDiscount);
  }, [filteredSummaries]);

  // Always show Due column when there are students - so users can see "No dues" status
  const showDueColumn = filteredSummaries.length > 0;

  // Check if any student has comments
  const hasAnyComments = useMemo(() => {
    return filteredSummaries.some((s) => s.commentsCount > 0);
  }, [filteredSummaries]);

  // Calculate column count for expanded row colspan
  const getColSpan = useCallback(() => {
    let cols = 2; // Student (with progress), Enrolled (always shown)
    if (hasAnyDiscountData) cols++; // Discount column
    if (showDueColumn) cols++; // Due column
    if (hasAnyComments) cols++;
    if (mode === 'view' && (onRemoveStudent || onTransferStudent)) cols++;
    return cols;
  }, [hasAnyDiscountData, showDueColumn, hasAnyComments, mode, onRemoveStudent, onTransferStudent]);

  // Format enrollment date for display
  const formatEnrolledDate = useCallback((isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  // Loading state
  if (loading) {
    return <LoadingTableSkeleton rows={5} message="Loading student progress data..." />;
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-amber-200">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <Button
            onClick={onRetry}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 transition-colors"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Empty state - no students at all
  if (summaries.length === 0) {
    return (
      <EmptyState
        icon={User}
        title="No Students Enrolled"
        description="There are no students enrolled in this class yet."
        action={
          mode === 'view' && onAddStudents
            ? {
                label: 'Add Students',
                onClick: onAddStudents,
                disabled: isAddingStudents,
              }
            : undefined
        }
      />
    );
  }

  // No results state - filtered out by search
  if (summaries.length > 0 && filteredSummaries.length === 0) {
    return (
      <div className="p-8 text-center">
        <Search className="w-12 h-12 mx-auto mb-3 text-white/40" />
        <h3 className="text-lg font-semibold text-white mb-2">No students found</h3>
        <p className="text-white/70 text-sm mb-4">
          No students match "{searchQuery}". Try a different search term.
        </p>
        {onClearSearch && (
          <Button
            onClick={onClearSearch}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Clear search
          </Button>
        )}
      </div>
    );
  }

  // Table (rendered directly without extra wrapper - parent provides card container)
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-white/20 hover:bg-transparent">
          <TableHead className="text-white/90 font-semibold w-1/3">Student</TableHead>
          <TableHead className="text-white/90 font-semibold w-28">Enrolled</TableHead>
          {hasAnyDiscountData && (
            <TableHead className="hidden md:table-cell text-white/90 font-semibold text-center w-32">
              Discount
            </TableHead>
          )}
          {showDueColumn && (
            <TableHead className="hidden md:table-cell text-white/90 font-semibold text-center w-28">
              Due
            </TableHead>
          )}
          {hasAnyComments && (
            <TableHead className="hidden lg:table-cell text-white/90 font-semibold text-center w-20">
              Notes
            </TableHead>
          )}
          {mode === 'view' && (onRemoveStudent || onTransferStudent) && (
            <TableHead className="text-white/90 font-semibold text-center w-16">Actions</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredSummaries.map((summary) => {
          const isExpanded = expandedStudents.has(summary.studentId);
          const isLoadingDetails = loadingDetails.has(summary.studentId);
          const details = lessonDetails[summary.studentId] || [];
          const riskIndicator = getAtRiskIndicator(summary);
          const hasAttendance = summary.totalLessons > 0;

          return (
            <React.Fragment key={summary.studentId}>
              {/* Main row - compact layout like Teaching page */}
              <TableRow className="border-white/10 hover:bg-white/5 [&>td]:py-3">
                {/* Student: expand button + name + progress (compact layout) */}
                <TableCell className="font-medium">
                  <div className="flex items-start gap-2">
                    {/* Expand/Collapse Button */}
                    <button
                      type="button"
                      onClick={() => onToggleRow(summary.studentId)}
                      className="mt-0.5 p-0.5 rounded hover:bg-white/10 transition-colors"
                      aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-white/60" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-white/60" />
                      )}
                    </button>

                    {/* Student Info */}
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        {/* Risk Indicator */}
                        {riskIndicator.show && (
                          <span
                            className={`w-2 h-2 rounded-full ${riskIndicator.color} flex-shrink-0`}
                            title={riskIndicator.title}
                          />
                        )}

                        {/* Student Name (clickable link to profile) */}
                        <button
                          onClick={() => navigate(`/students/${summary.studentId}`)}
                          className="text-blue-300 hover:text-blue-200 hover:underline cursor-pointer transition-colors truncate font-bold"
                        >
                          {summary.studentName}
                        </button>
                      </div>

                      {/* Progress Summary - below name */}
                      <StudentProgressChips
                        totalLessons={summary.totalLessons}
                        attendance={summary.attendance}
                        homework={summary.homework}
                      />
                    </div>
                  </div>
                </TableCell>

                {/* Enrolled date */}
                <TableCell>
                  <span className="text-white/60 text-sm">
                    {formatEnrolledDate(summary.enrolledAt)}
                  </span>
                </TableCell>

                {/* Discount column */}
                {hasAnyDiscountData && (
                  <TableCell className="hidden md:table-cell text-center">
                    {summary.discount?.hasDiscount ? (
                      <DiscountIndicator discount={summary.discount} />
                    ) : (
                      <span className="text-white/40 text-sm">—</span>
                    )}
                  </TableCell>
                )}

                {/* Due column */}
                {showDueColumn && (
                  <TableCell className="hidden md:table-cell text-center">
                    {summary.paymentObligation?.hasPendingObligations ? (
                      <PaymentObligationIndicator paymentObligation={summary.paymentObligation} />
                    ) : (
                      <span className="text-white/50 text-sm">No dues</span>
                    )}
                  </TableCell>
                )}

                {/* Notes column */}
                {hasAnyComments && (
                  <TableCell className="hidden lg:table-cell text-center">
                    {summary.commentsCount > 0 ? (
                      <div className="flex items-center justify-center gap-1 text-white/70 text-xs">
                        <MessageSquare className="w-3 h-3" />
                        <span>{summary.commentsCount}</span>
                      </div>
                    ) : (
                      <span className="text-white/60 text-xs">—</span>
                    )}
                  </TableCell>
                )}

                {/* Actions column */}
                {mode === 'view' && (onRemoveStudent || onTransferStudent) && (
                  <TableCell className="text-center">
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
                <TableRow className="border-white/10 transition-opacity duration-200">
                  <TableCell colSpan={getColSpan()} className="p-0 bg-white/[0.02]">
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
  );
};

export default React.memo(StudentProgressTablePresenter);
