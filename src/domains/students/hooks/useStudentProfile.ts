import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import { selectObligationsByStudentId, selectPaymentsByStudentId, selectStudentOutstandingBalance, PaymentObligation } from '@/domains/finance/financeSlice';
import { selectAttendanceByClassId } from '@/domains/attendance/attendanceSlice';
import { selectGradesByStudentId } from '@/domains/grades/gradesSlice';
import { AttendanceStatus, StudentStatus, ObligationStatus } from '@/types/enums';

export const useStudentProfile = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isPaymentSidebarOpen, setIsPaymentSidebarOpen] = useState(false);
  const [selectedObligation, setSelectedObligation] = useState<PaymentObligation | null>(null);

  // Get student data
  const { students } = useAppSelector((state: RootState) => state.students);
  const { classes } = useAppSelector((state: RootState) => state.classes);
  const student = students.find(s => s.id === studentId);

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
  const studentClass = student?.classId ? classes.find(c => c.id === student.classId) : undefined;

  // Calculated data
  const attendanceStats = useMemo(() => {
    const studentAttendanceRecords = attendanceRecords.flatMap(record => 
      record.studentRecords.filter(sr => sr.studentId === studentId)
    );
    const totalSessions = studentAttendanceRecords.length;
    const presentCount = studentAttendanceRecords.filter(sr => sr.status === AttendanceStatus.Present).length;
    const absentCount = studentAttendanceRecords.filter(sr => sr.status === AttendanceStatus.Absent).length;
    const lateCount = studentAttendanceRecords.filter(sr => sr.status === AttendanceStatus.Late).length;
    const attendanceRate = totalSessions > 0 ? ((presentCount + lateCount) / totalSessions * 100).toFixed(1) : '0';

    return { totalSessions, presentCount, absentCount, lateCount, attendanceRate };
  }, [attendanceRecords, studentId]);

  const gradeAssessments = useMemo(() => {
    return grades.map(grade => {
      const assessment = assessments.find(a => a.id === grade.assessmentId);
      return { ...grade, assessment };
    }).filter(item => item.assessment);
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
  // Utility functions
  const canMakePayment = (status: string) => {
    return [ObligationStatus.Pending, ObligationStatus.Partial, ObligationStatus.Overdue].includes(status as ObligationStatus);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case StudentStatus.Active:
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case StudentStatus.Inactive:
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case AttendanceStatus.Present:
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case AttendanceStatus.Absent:
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case AttendanceStatus.Late:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case ObligationStatus.Paid:
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case ObligationStatus.Partial:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case ObligationStatus.Overdue:
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case ObligationStatus.Pending:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
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
    
    // Handlers
    handleBack,
    handleOpenPaymentSidebar,
    handleClosePaymentSidebar,
    
    // Utils
    canMakePayment,
    getStatusColor,
    getAttendanceStatusColor,
    getPaymentStatusColor,
  };
};
