import { useState, useEffect, useCallback, useMemo } from 'react';
import { teacherApiService } from '@/services/teacherApiService';
import {
  TeacherClassPaymentSummaryResponse,
  TeacherClassWithPayments,
  PaymentSummary,
  StudentPaymentStatus,
} from '@/types/api/teacher';

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

  // Generate mock student payment data for a class
  // This simulates what the lazy-load endpoint would return
  const loadStudentsForClass = useCallback(
    async (classId: string) => {
      // If already loaded, skip
      if (studentsByClass[classId]) {
        return;
      }

      setStudentsLoadingByClass((prev) => ({ ...prev, [classId]: true }));

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Find the class data
      const classData = paymentData?.classes.find((c) => c.classId === classId);
      if (!classData) {
        setStudentsLoadingByClass((prev) => ({ ...prev, [classId]: false }));
        return;
      }

      // Generate mock students based on the class payment stats
      const mockStudents: StudentPaymentStatus[] = [];
      const totalStudents = classData.enrolledCount;

      for (let i = 0; i < totalStudents; i++) {
        // Use deterministic "random" based on classId and index
        const seed = hashCode(`${classId}-${i}`);
        const rand = Math.abs(seed % 100);

        let paymentStatus: StudentPaymentStatus['paymentStatus'];
        let dueAmount: number | null = null;

        if (rand < 80) {
          paymentStatus = 'paid';
        } else if (rand < 95) {
          paymentStatus = 'due';
          dueAmount = 50 + (seed % 100); // $50-$150
        } else {
          paymentStatus = 'partial';
          dueAmount = 25 + (seed % 50); // $25-$75
        }

        mockStudents.push({
          studentId: `mock-student-${classId}-${i}`,
          studentName: generateMockName(seed),
          enrollmentStatus: 'active',
          paymentStatus,
          dueAmount,
        });
      }

      setStudentsByClass((prev) => ({ ...prev, [classId]: mockStudents }));
      setStudentsLoadingByClass((prev) => ({ ...prev, [classId]: false }));
    },
    [paymentData, studentsByClass]
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

// Simple hash function for deterministic "randomness"
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

// Generate mock names for demo
const FIRST_NAMES = [
  'Ana', 'Marko', 'Elena', 'Stefan', 'Ivana', 'Nikola', 'Maria', 'Petar',
  'Sofia', 'David', 'Nina', 'Luka', 'Milica', 'Boris', 'Tamara', 'Viktor',
];
const LAST_NAMES = [
  'Petrova', 'Nikolov', 'Stojan', 'Ivanov', 'Dimitrov', 'Georgieva', 'Pavlovic',
  'Jovanovic', 'Todorova', 'Kovac', 'Stankovic', 'Markovic', 'Ilic', 'Popov',
];

function generateMockName(seed: number): string {
  const firstName = FIRST_NAMES[Math.abs(seed) % FIRST_NAMES.length];
  const lastName = LAST_NAMES[Math.abs(seed >> 4) % LAST_NAMES.length];
  return `${firstName} ${lastName}`;
}

export default useTeacherClassesWithPayments;
