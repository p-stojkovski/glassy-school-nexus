/**
 * Hook for the unified Student Details page
 * Handles student data loading, status management, deletion, and permission checks
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { RootState } from '@/store';
import { studentApiService } from '@/services/studentApiService';
import {
  Student,
  updateStudent as updateStudentInStore,
  deleteStudent as deleteStudentFromStore,
  addStudent as addStudentToStore,
} from '@/domains/students/studentsSlice';
import { useStudentData } from './hooks/useStudentData';
import {
  makeSelectObligationsByStudentId,
  makeSelectPaymentsByStudentId,
  selectStudentOutstandingBalance,
  PaymentObligation,
} from '@/domains/finance/financeSlice';
import { makeSelectAttendanceByClassId } from '@/domains/attendance/attendanceSlice';
import { makeSelectGradesByStudentId } from '@/domains/grades/gradesSlice';
import { AttendanceStatus, ObligationStatus } from '@/types/enums';
import { StudentFormData, CreateStudentRequest, UpdateStudentRequest, StudentResponse, StudentOverviewResponse } from '@/types/api/student';
import { validateAndPrepareStudentData } from '@/utils/validation/studentValidators';
import { StudentErrorHandlers, showSuccessMessage } from '@/utils/apiErrorHandler';
import {
  getStudentStatusColor,
  getAttendanceStatusColor,
  getPaymentStatusColor,
} from '@/utils/statusColors';
import { usePermissions } from '@/hooks/usePermissions';

// Stable empty array references to prevent unnecessary rerenders
const EMPTY_OBLIGATIONS: PaymentObligation[] = [];
const EMPTY_PAYMENTS: { id: string; amount: number; date: string; method: string; reference?: string; notes?: string; studentId: string; obligationId: string }[] = [];
const EMPTY_ATTENDANCE_RECORDS: { studentRecords: { studentId: string; status: string; homeworkCompleted?: boolean }[] }[] = [];
const EMPTY_GRADES: { assessmentId: string; studentId: string }[] = [];

export interface UseStudentPageResult {
  // Mode
  isCreateMode: boolean;

  // Data
  student: Student | null;
  studentClass: { id: string; name: string; teacher?: { name: string } } | undefined;
  obligations: PaymentObligation[];
  payments: { id: string; amount: number; date: string; method: string; reference?: string; notes?: string }[];
  outstandingBalance: number;
  attendanceRecords: { studentRecords: { studentId: string; status: string; homeworkCompleted?: boolean }[] }[];
  attendanceStats: AttendanceStats;
  gradeAssessments: { assessmentId: string; studentId: string; assessment?: { id: string; title: string } }[];
  overviewData: StudentOverviewResponse | null;
  overviewLoading: boolean;

  // State
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isPaymentSidebarOpen: boolean;
  selectedObligation: PaymentObligation | null;
  isEditSheetOpen: boolean;
  loading: boolean;
  error: string | null;
  isDeleting: boolean;

  // Actions
  handleOpenPaymentSidebar: (obligation: PaymentObligation) => void;
  handleClosePaymentSidebar: () => void;
  openEditSheet: () => void;
  closeEditSheet: () => void;
  handleUpdate: (data: StudentFormData) => Promise<Student>;
  handleCreate: (data: StudentFormData) => Promise<{ id: string }>;
  handleToggleStatus: () => Promise<void>;
  handleDelete: () => Promise<void>;
  refreshStudent: () => Promise<void>;

  // Permissions
  canViewFinance: boolean;
  canManagePayments: boolean;
  canDelete: boolean;
  deleteDisabledReason: string | null;

  // Utils
  canMakePayment: (status: string) => boolean;
  getStatusColor: typeof getStudentStatusColor;
  getAttendanceStatusColor: typeof getAttendanceStatusColor;
  getPaymentStatusColor: typeof getPaymentStatusColor;
}

interface AttendanceStats {
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: string;
  homeworkCompletedCount: number;
  homeworkNotCompletedCount: number;
  homeworkCompletionRate: string;
  homeworkTotalSessions: number;
}

interface StudentAttendanceRecord {
  studentId: string;
  status: string;
  homeworkCompleted?: boolean;
}

export const useStudentPage = (): UseStudentPageResult => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const permissions = usePermissions();

  // Determine mode
  const isCreateMode = !studentId || studentId === 'new';

  // Detect if this is the legacy edit route (/students/edit/:studentId)
  const isLegacyEditRoute = location.pathname.includes('/students/edit/');

  // Use extracted hook for student data loading
  const {
    student,
    loading,
    error: fetchError,
    refreshStudent,
  } = useStudentData({ studentId, isCreateMode });

  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [isPaymentSidebarOpen, setIsPaymentSidebarOpen] = useState(false);
  const [selectedObligation, setSelectedObligation] = useState<PaymentObligation | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(isLegacyEditRoute);
  const [crudError, setCrudError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasOpenedEditSheet, setHasOpenedEditSheet] = useState(false);
  const [overviewData, setOverviewData] = useState<StudentOverviewResponse | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  // Combined error state for return interface compatibility
  const error = fetchError || crudError;

  // Get student's current class ID (API returns currentClassId)
  const currentClassId = (student as StudentResponse)?.currentClassId;

  // Create memoized selectors for student-specific data
  const selectObligations = useMemo(makeSelectObligationsByStudentId, []);
  const selectPayments = useMemo(makeSelectPaymentsByStudentId, []);
  const selectAttendance = useMemo(makeSelectAttendanceByClassId, []);
  const selectGrades = useMemo(makeSelectGradesByStudentId, []);

  const obligations = useAppSelector((state: RootState) =>
    studentId && studentId !== 'new' ? selectObligations(state, studentId) : EMPTY_OBLIGATIONS
  );

  const payments = useAppSelector((state: RootState) =>
    studentId && studentId !== 'new' ? selectPayments(state, studentId) : EMPTY_PAYMENTS
  );

  const outstandingBalance = useAppSelector((state: RootState) =>
    studentId && studentId !== 'new' ? selectStudentOutstandingBalance(state, studentId) : 0
  );

  const attendanceRecords = useAppSelector((state: RootState) =>
    currentClassId ? selectAttendance(state, currentClassId) : EMPTY_ATTENDANCE_RECORDS
  );

  const grades = useAppSelector((state: RootState) =>
    studentId && studentId !== 'new' ? selectGrades(state, studentId) : EMPTY_GRADES
  );
  const { assessments } = useAppSelector((state: RootState) => state.grades);

  // Get student's class information - use data from student response directly
  // The API provides currentClassName and currentTeacherName, so we don't rely on Redux
  const studentClass = currentClassId && student
    ? {
        id: currentClassId,
        name: (student as StudentResponse).currentClassName || 'Unknown Class',
        teacher: (student as StudentResponse).currentTeacherName
          ? { name: (student as StudentResponse).currentTeacherName }
          : undefined,
      }
    : undefined;

  // Fetch overview data when on overview tab
  const fetchOverviewData = useCallback(async () => {
    if (isCreateMode || !studentId || studentId === 'new') return;

    setOverviewLoading(true);
    try {
      const data = await studentApiService.getStudentOverview(studentId);
      setOverviewData(data);
    } catch (err) {
      console.error('Failed to fetch student overview:', err);
      // Don't set error - overview is supplementary, student page should still work
    } finally {
      setOverviewLoading(false);
    }
  }, [studentId, isCreateMode]);

  // Fetch overview data when tab is overview and student exists
  useEffect(() => {
    if (activeTab === 'overview' && student && !overviewData && !overviewLoading) {
      fetchOverviewData();
    }
  }, [activeTab, student, overviewData, overviewLoading, fetchOverviewData]);

  // Auto-open edit sheet for legacy edit route once student is loaded
  useEffect(() => {
    if (isLegacyEditRoute && !loading && student && !hasOpenedEditSheet) {
      setIsEditSheetOpen(true);
      setHasOpenedEditSheet(true);
      // Update URL to remove /edit/ for cleaner UX
      navigate(`/students/${studentId}`, { replace: true });
    }
  }, [isLegacyEditRoute, loading, student, studentId, navigate, hasOpenedEditSheet]);

  // Redirect if student not found after loading
  useEffect(() => {
    if (!isCreateMode && !loading && !student && !error) {
      navigate('/students', { replace: true });
    }
  }, [isCreateMode, loading, student, error, navigate]);

  // Calculate attendance stats
  const attendanceStats = useMemo((): AttendanceStats => {
    if (!studentId || studentId === 'new') {
      return {
        totalSessions: 0,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        attendanceRate: '0',
        homeworkCompletedCount: 0,
        homeworkNotCompletedCount: 0,
        homeworkCompletionRate: '0',
        homeworkTotalSessions: 0,
      };
    }

    const studentAttendanceRecords = attendanceRecords.flatMap((record) =>
      record.studentRecords.filter((sr: StudentAttendanceRecord) => sr.studentId === studentId)
    );
    const totalSessions = studentAttendanceRecords.length;
    const presentCount = studentAttendanceRecords.filter(
      (sr: StudentAttendanceRecord) => sr.status === AttendanceStatus.Present
    ).length;
    const absentCount = studentAttendanceRecords.filter(
      (sr: StudentAttendanceRecord) => sr.status === AttendanceStatus.Absent
    ).length;
    const lateCount = studentAttendanceRecords.filter(
      (sr: StudentAttendanceRecord) => sr.status === AttendanceStatus.Late
    ).length;
    const attendanceRate =
      totalSessions > 0
        ? (((presentCount + lateCount) / totalSessions) * 100).toFixed(1)
        : '0';

    const presentStudentRecords = studentAttendanceRecords.filter(
      (sr: StudentAttendanceRecord) => sr.status !== AttendanceStatus.Absent
    );
    const homeworkCompletedCount = presentStudentRecords.filter(
      (sr: StudentAttendanceRecord) => sr.homeworkCompleted === true
    ).length;
    const homeworkNotCompletedCount = presentStudentRecords.filter(
      (sr: StudentAttendanceRecord) => sr.homeworkCompleted === false
    ).length;
    const homeworkCompletionRate =
      presentStudentRecords.length > 0
        ? ((homeworkCompletedCount / presentStudentRecords.length) * 100).toFixed(1)
        : '0';

    return {
      totalSessions,
      presentCount,
      absentCount,
      lateCount,
      attendanceRate,
      homeworkCompletedCount,
      homeworkNotCompletedCount,
      homeworkCompletionRate,
      homeworkTotalSessions: presentStudentRecords.length,
    };
  }, [attendanceRecords, studentId]);

  // Map grades with assessments
  const gradeAssessments = useMemo(() => {
    return grades
      .map((grade) => {
        const assessment = assessments.find((a) => a.id === grade.assessmentId);
        return { ...grade, assessment };
      })
      .filter((item) => item.assessment);
  }, [grades, assessments]);

  // Check if student can be deleted (no enrollments or payments)
  const canDelete = useMemo(() => {
    // Allow delete if there are no payments and no class enrollment
    return payments.length === 0 && !currentClassId;
  }, [payments.length, currentClassId]);

  const deleteDisabledReason = useMemo(() => {
    if (canDelete) return null;
    const reasons: string[] = [];
    if (payments.length > 0) {
      reasons.push(`${payments.length} payment${payments.length > 1 ? 's' : ''}`);
    }
    if (currentClassId) {
      reasons.push('enrolled in a class');
    }
    return `Cannot delete: student has ${reasons.join(' and ')}`;
  }, [canDelete, payments.length, currentClassId]);

  // Handlers
  const handleOpenPaymentSidebar = useCallback((obligation: PaymentObligation) => {
    setSelectedObligation(obligation);
    setIsPaymentSidebarOpen(true);
  }, []);

  const handleClosePaymentSidebar = useCallback(() => {
    setIsPaymentSidebarOpen(false);
    setSelectedObligation(null);
  }, []);

  const openEditSheet = useCallback(() => {
    setIsEditSheetOpen(true);
  }, []);

  const closeEditSheet = useCallback(() => {
    setIsEditSheetOpen(false);
  }, []);

  const handleUpdate = useCallback(async (data: StudentFormData): Promise<Student> => {
    if (!student) {
      throw new Error('No student to update');
    }

    const validation = validateAndPrepareStudentData(data, true);
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors)[0] || 'Validation failed');
    }

    const request = validation.data as UpdateStudentRequest;
    const updatedStudent = await studentApiService.updateStudent(student.id, request);

    // Update store - the hook will pick up the change via storeStudent selector
    dispatch(updateStudentInStore(updatedStudent));

    showSuccessMessage('Student Updated', `${data.firstName} ${data.lastName} has been successfully updated.`);

    return updatedStudent;
  }, [student, dispatch]);

  const handleCreate = useCallback(async (data: StudentFormData): Promise<{ id: string }> => {
    const validation = validateAndPrepareStudentData(data, false);
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors)[0] || 'Validation failed');
    }

    const request = validation.data as CreateStudentRequest;
    const createdResponse = await studentApiService.createStudent(request);

    // Fetch full student data
    const createdStudent = await studentApiService.getStudentById(createdResponse.id);
    dispatch(addStudentToStore(createdStudent));

    showSuccessMessage('Student Created', `${data.firstName} ${data.lastName} has been successfully added.`);

    return createdResponse;
  }, [dispatch]);

  const handleToggleStatus = useCallback(async () => {
    if (!student) return;

    const newStatus = !student.isActive;

    const updateData: StudentFormData = {
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone || '',
      dateOfBirth: student.dateOfBirth || '',
      enrollmentDate: student.enrollmentDate,
      isActive: newStatus,
      parentContact: student.parentContact || '',
      parentEmail: student.parentEmail || '',
      placeOfBirth: student.placeOfBirth || '',
      hasDiscount: student.hasDiscount,
      discountTypeId: student.discountTypeId || '',
      discountAmount: student.discountAmount || 0,
      notes: student.notes || '',
    };

    await handleUpdate(updateData);
    showSuccessMessage(
      newStatus ? 'Student Activated' : 'Student Deactivated',
      `${student.fullName} has been ${newStatus ? 'activated' : 'deactivated'}.`
    );
  }, [student, handleUpdate]);

  const handleDelete = useCallback(async () => {
    if (!student) return;

    setIsDeleting(true);
    try {
      await studentApiService.deleteStudent(student.id);
      dispatch(deleteStudentFromStore(student.id));
      showSuccessMessage('Student Deleted', `${student.fullName} has been successfully removed.`);
      navigate('/students');
    } catch (err) {
      const msg = StudentErrorHandlers.delete(err);
      setCrudError(msg);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [student, dispatch, navigate]);

  const canMakePayment = useCallback((status: string) => {
    return [
      ObligationStatus.Pending,
      ObligationStatus.Partial,
      ObligationStatus.Overdue,
    ].includes(status as ObligationStatus);
  }, []);

  return {
    // Mode
    isCreateMode,

    // Data
    student,
    studentClass,
    obligations,
    payments,
    outstandingBalance,
    attendanceRecords,
    attendanceStats,
    gradeAssessments,
    overviewData,
    overviewLoading,

    // State
    activeTab,
    setActiveTab,
    isPaymentSidebarOpen,
    selectedObligation,
    isEditSheetOpen,
    loading,
    error,
    isDeleting,

    // Actions
    handleOpenPaymentSidebar,
    handleClosePaymentSidebar,
    openEditSheet,
    closeEditSheet,
    handleUpdate,
    handleCreate,
    handleToggleStatus,
    handleDelete,
    refreshStudent,

    // Permissions
    canViewFinance: permissions.canViewFinance,
    canManagePayments: permissions.canManagePayments,
    canDelete,
    deleteDisabledReason,

    // Utils
    canMakePayment,
    getStatusColor: getStudentStatusColor,
    getAttendanceStatusColor,
    getPaymentStatusColor,
  };
};
