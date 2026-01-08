import { useState, useEffect, useCallback, useMemo } from 'react';
import { teacherApiService } from '@/services/teacherApiService';
import { classApiService } from '@/services/classApiService';
import {
  TeacherClassPaymentSummaryResponse,
  TeacherClassWithPayments,
  PaymentSummary,
  StudentPaymentStatus,
} from '@/types/api/teacher';
import { StudentLessonSummary } from '@/types/api/class';

interface UseTeacherClassesWithPaymentsOptions {
  teacherId: string;
}

interface UseTeacherClassesWithPaymentsResult {
  /** Payment summary data */
  paymentData: TeacherClassPaymentSummaryResponse | null;
  /** Aggregated payment summary */
  summary: PaymentSummary | null;
  /** Classes with payment info */
  classes: TeacherClassWithPayments[];
  /** Loading state */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Refresh data from API */
  refresh: () => Promise<void>;

  /** Mock student payment data per class (keyed by classId) */
  studentsByClass: Record<string, StudentPaymentStatus[]>;
  /** Loading state for students per class */
  studentsLoadingByClass: Record<string, boolean>;
  /** Load students for a specific class */
  loadStudentsForClass: (classId: string) => Promise<void>;
}

/**
 * Hook for fetching teacher's classes with payment summary data.
 * Uses mock payment data until the Payments domain is implemented.
 */
export function useTeacherClassesWithPayments({
  teacherId,
}: UseTeacherClassesWithPaymentsOptions): UseTeacherClassesWithPaymentsResult {
  // Data state
  const [paymentData, setPaymentData] = useState<TeacherClassPaymentSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock students data per class
  const [studentsByClass, setStudentsByClass] = useState<Record<string, StudentPaymentStatus[]>>({});
  const [studentsLoadingByClass, setStudentsLoadingByClass] = useState<Record<string, boolean>>({});

  // Load payment summary from API
  const loadPaymentSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await teacherApiService.getTeacherClassesPaymentSummary(teacherId);
      setPaymentData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment summary');
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  // Load real student data from the GetClassStudentsSummary endpoint
  const loadStudentsForClass = useCallback(
    async (classId: string) => {
      // If already loaded, skip
      if (studentsByClass[classId]) {
        return;
      }

      setStudentsLoadingByClass((prev) => ({ ...prev, [classId]: true }));

      try {
        // Call the real API endpoint
        const studentSummaries = await classApiService.getClassStudentsSummary(classId);

        // Map StudentLessonSummary to StudentPaymentStatus
        const mappedStudents: StudentPaymentStatus[] = studentSummaries.map(
          (summary: StudentLessonSummary) => {
            // Calculate attendance percentage
            const attendancePercentage =
              summary.totalLessons > 0
                ? Math.round((summary.attendance.present / summary.totalLessons) * 100)
                : null;

            // Calculate homework completion percentage
            const homeworkPercentage =
              summary.totalLessons > 0
                ? Math.round((summary.homework.complete / summary.totalLessons) * 100)
                : null;

            // Derive payment status from paymentObligation
            let paymentStatus: StudentPaymentStatus['paymentStatus'] = 'paid';
            let dueAmount: number | null = null;

            if (summary.paymentObligation?.hasPendingObligations) {
              paymentStatus = summary.paymentObligation.pendingCount > 1 ? 'due' : 'partial';
              dueAmount = summary.paymentObligation.totalPendingAmount;
            }

            return {
              studentId: summary.studentId,
              studentName: summary.studentName,
              enrollmentStatus: summary.enrollmentStatus,
              paymentStatus,
              dueAmount,
              attendancePercentage,
              totalLessons: summary.totalLessons,
              homeworkPercentage,
            };
          }
        );

        setStudentsByClass((prev) => ({ ...prev, [classId]: mappedStudents }));
      } catch (err) {
        console.error('Failed to load students for class:', err);
        // Set empty array on error to avoid infinite retries
        setStudentsByClass((prev) => ({ ...prev, [classId]: [] }));
      } finally {
        setStudentsLoadingByClass((prev) => ({ ...prev, [classId]: false }));
      }
    },
    [studentsByClass]
  );

  // Fetch on mount
  useEffect(() => {
    loadPaymentSummary();
  }, [teacherId]); // Only refetch when teacherId changes

  // Derived data
  const summary = useMemo(() => paymentData?.summary ?? null, [paymentData]);
  const classes = useMemo(() => paymentData?.classes ?? [], [paymentData]);

  return {
    paymentData,
    summary,
    classes,
    loading,
    error,
    refresh: loadPaymentSummary,
    studentsByClass,
    studentsLoadingByClass,
    loadStudentsForClass,
  };
}

export default useTeacherClassesWithPayments;
