import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import {
  selectObligationsByStudentId,
  selectPaymentsByStudentId,
  selectStudentOutstandingBalance,
  PaymentObligation,
} from '@/domains/finance/financeSlice';
import { selectAttendanceByClassId } from '@/domains/attendance/attendanceSlice';
import { selectGradesByStudentId } from '@/domains/grades/gradesSlice';
import {
  AttendanceStatus,
  StudentStatus,
  ObligationStatus,
} from '@/types/enums';
import {
  getStudentStatusColor,
  getAttendanceStatusColor,
  getPaymentStatusColor,
} from '@/utils/statusColors';

export const useStudentProfile = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isPaymentSidebarOpen, setIsPaymentSidebarOpen] = useState(false);
  const [selectedObligation, setSelectedObligation] =
    useState<PaymentObligation | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  // Get student data
  const { students } = useAppSelector((state: RootState) => state.students);
  const { classes } = useAppSelector((state: RootState) => state.classes);
  const student = students.find((s) => s.id === studentId);

  // Get related data
  const obligations = useAppSelector((state: RootState) =>
    studentId ? selectObligationsByStudentId(state, studentId) : []
  );
  const payments = useAppSelector((state: RootState) =>
    studentId ? selectPaymentsByStudentId(state, studentId) : []
  );
  const outstandingBalance = useAppSelector((state: RootState) =>
    studentId ? selectStudentOutstandingBalance(state, studentId) : 0
  );

  const attendanceRecords = useAppSelector((state: RootState) =>
    student?.classId ? selectAttendanceByClassId(state, student.classId) : []
  );

  const grades = useAppSelector((state: RootState) =>
    studentId ? selectGradesByStudentId(state, studentId) : []
  );
  const { assessments } = useAppSelector((state: RootState) => state.grades);

  // Get student's class information
  const studentClass = student?.classId
    ? classes.find((c) => c.id === student.classId)
    : undefined;

  // Calculated data
  const attendanceStats = useMemo(() => {
    const studentAttendanceRecords = attendanceRecords.flatMap((record) =>
      record.studentRecords.filter((sr) => sr.studentId === studentId)
    );
    const totalSessions = studentAttendanceRecords.length;
    const presentCount = studentAttendanceRecords.filter(
      (sr) => sr.status === AttendanceStatus.Present
    ).length;
    const absentCount = studentAttendanceRecords.filter(
      (sr) => sr.status === AttendanceStatus.Absent
    ).length;
    const lateCount = studentAttendanceRecords.filter(
      (sr) => sr.status === AttendanceStatus.Late
    ).length;
    const attendanceRate =
      totalSessions > 0
        ? (((presentCount + lateCount) / totalSessions) * 100).toFixed(1)
        : '0';

    // Calculate homework completion stats
    const presentStudentRecords = studentAttendanceRecords.filter(
      (sr) => sr.status !== AttendanceStatus.Absent
    );
    const homeworkCompletedCount = presentStudentRecords.filter(
      (sr) => sr.homeworkCompleted === true
    ).length;
    const homeworkNotCompletedCount = presentStudentRecords.filter(
      (sr) => sr.homeworkCompleted === false
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

  const gradeAssessments = useMemo(() => {
    return grades
      .map((grade) => {
        const assessment = assessments.find((a) => a.id === grade.assessmentId);
        return { ...grade, assessment };
      })
      .filter((item) => item.assessment);
  }, [grades, assessments]);

  // Event handlers
  const handleBack = () => navigate('/students');

  const handleOpenPaymentSidebar = (obligation: PaymentObligation) => {
    setSelectedObligation(obligation);
    setIsPaymentSidebarOpen(true);
  };

  const handleClosePaymentSidebar = () => {
    setIsPaymentSidebarOpen(false);
    setSelectedObligation(null);
  };

  // Edit sheet handlers
  const handleOpenEditSheet = () => setIsEditSheetOpen(true);
  const handleCloseEditSheet = () => setIsEditSheetOpen(false);

  // Utility functions
  const canMakePayment = (status: string) => {
    return [
      ObligationStatus.Pending,
      ObligationStatus.Partial,
      ObligationStatus.Overdue,
    ].includes(status as ObligationStatus);
  };

  useEffect(() => {
    if (!student) {
      navigate('/students');
    }
  }, [student, navigate]);

  return {
    // Data
    student,
    studentClass,
    obligations,
    payments,
    outstandingBalance,
    attendanceRecords,
    grades,
    assessments,
    attendanceStats,
    gradeAssessments,

    // State
    activeTab,
    setActiveTab,
    isPaymentSidebarOpen,
    selectedObligation,
    isEditSheetOpen,

    // Handlers
    handleBack,
    handleOpenPaymentSidebar,
    handleClosePaymentSidebar,
    handleOpenEditSheet,
    handleCloseEditSheet,

    // Utils
    canMakePayment,
    getStatusColor: getStudentStatusColor,
    getAttendanceStatusColor,
    getPaymentStatusColor,
  };
};
