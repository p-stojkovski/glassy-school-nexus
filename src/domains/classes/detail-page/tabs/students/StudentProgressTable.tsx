import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useStudentProgressData } from '@/domains/classes/_shared/hooks';
import { StudentFilter } from '@/domains/classes/_shared/utils/studentFilters';
import StudentProgressTablePresenter from './StudentProgressTablePresenter';

/**
 * Props for the StudentProgressTable container component.
 */
export interface StudentProgressTableProps {
  /** Class ID to display students for */
  classId: string;
  /** Display mode */
  mode?: 'view' | 'edit';
  /** Whether students are being added */
  isAddingStudents?: boolean;
  /** Callback when Add Students is clicked */
  onAddStudents?: () => void;
  /** Callback when Remove Student is requested */
  onRemoveStudent?: (studentId: string, studentName: string, hasAttendance: boolean) => void;
  /** Callback when Transfer Student is requested */
  onTransferStudent?: (studentId: string, studentName: string) => void;
  /** External search query (controlled) */
  searchQuery?: string;
  /** Callback when search query changes */
  onSearchQueryChange?: (query: string) => void;
  /** Student filter type */
  studentFilter?: StudentFilter;
  /**
   * Bump this when enrollment changes to force a refetch and bypass cache.
   */
  dataVersion?: number;
}

/**
 * StudentProgressTable - Container component for student progress.
 *
 * This component follows the container/presenter pattern:
 * - Container (this file): Handles data fetching, state management, and callbacks
 * - Presenter (StudentProgressTablePresenter): Pure rendering with data via props
 *
 * Benefits:
 * - Presenter is easily testable without mocking API calls
 * - Clear separation of concerns
 * - Data fetching logic is reusable via useStudentProgressData hook
 *
 * @example
 * <StudentProgressTable
 *   classId="class-123"
 *   mode="view"
 *   onAddStudents={handleAdd}
 *   onRemoveStudent={handleRemove}
 * />
 */
const StudentProgressTable: React.FC<StudentProgressTableProps> = ({
  classId,
  mode = 'view',
  isAddingStudents = false,
  onAddStudents,
  onRemoveStudent,
  onTransferStudent,
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
  studentFilter = 'all',
  dataVersion = 0,
}) => {
  // Data fetching via extracted hook
  const {
    summaries,
    loading,
    error,
    lessonDetails,
    loadingDetails,
    financialStatus,
    loadStudentDetails,
    retry,
  } = useStudentProgressData({
    classId,
    dataVersion,
  });

  // UI state - row expansion
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());

  // Internal search query state (used if not controlled externally)
  const [internalSearchQuery, setInternalSearchQuery] = useState<string>('');
  const searchQuery = externalSearchQuery ?? internalSearchQuery;
  const setSearchQuery = onSearchQueryChange ?? setInternalSearchQuery;

  // Toggle row expansion and lazy load details
  const handleToggleRow = useCallback(
    async (studentId: string) => {
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
          try {
            await loadStudentDetails(studentId);
          } catch (err) {
            toast.error('Failed to load lesson details');
          }
        }
      }
    },
    [expandedStudents, lessonDetails, loadStudentDetails]
  );

  // Clear search callback
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, [setSearchQuery]);

  return (
    <StudentProgressTablePresenter
      summaries={summaries}
      loading={loading}
      error={error}
      lessonDetails={lessonDetails}
      loadingDetails={loadingDetails}
      financialStatus={financialStatus}
      expandedStudents={expandedStudents}
      mode={mode}
      isAddingStudents={isAddingStudents}
      searchQuery={searchQuery}
      studentFilter={studentFilter}
      onToggleRow={handleToggleRow}
      onAddStudents={onAddStudents}
      onRemoveStudent={onRemoveStudent}
      onTransferStudent={onTransferStudent}
      onRetry={retry}
      onClearSearch={handleClearSearch}
    />
  );
};

export default React.memo(StudentProgressTable);
