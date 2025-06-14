import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { ArrowLeft, User, GraduationCap, Calendar, DollarSign, Phone, Mail, Users, AlertCircle, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { RootState } from '@/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import GlassCard from '@/components/common/GlassCard';
import DemoModeNotification from '@/domains/students/components/notifications/DemoModeNotification';
import PaymentSidebar from '@/domains/finance/components/payments/PaymentSidebar';
import { selectObligationsByStudentId, selectPaymentsByStudentId, selectStudentOutstandingBalance, PaymentObligation } from '@/domains/finance/financeSlice';
import { selectAttendanceByClassId } from '@/store/slices/attendanceSlice';
import { selectGradesByStudentId } from '@/store/slices/gradesSlice';

const StudentProfile: React.FC = () => {
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
  
  // Get attendance data for the student's class
  const attendanceRecords = useAppSelector((state: RootState) =>
    student?.classId ? selectAttendanceByClassId(state, student.classId) : []
  );
  
  // Get grade data
  const grades = useAppSelector((state: RootState) =>
    studentId ? selectGradesByStudentId(state, studentId) : []
  );
  const { assessments } = useAppSelector((state: RootState) => state.grades);

  // Get student's class information
  const studentClass = student?.classId ? classes.find(c => c.id === student.classId) : null;

  useEffect(() => {
    if (!student) {
      // If student not found, redirect to student management
      navigate('/students');
    }
  }, [student, navigate]);

  if (!student) {
    return null; // Will redirect
  }

  const handleBack = () => {
    navigate('/students');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'inactive':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'absent':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'late':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'partial':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'overdue':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'pending':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  // Payment sidebar handlers
  const handleOpenPaymentSidebar = (obligation: PaymentObligation) => {
    setSelectedObligation(obligation);
    setIsPaymentSidebarOpen(true);
  };

  const handleClosePaymentSidebar = () => {
    setIsPaymentSidebarOpen(false);
    setSelectedObligation(null);
  };

  // Check if obligation can have payment action
  const canMakePayment = (status: string) => {
    return ['pending', 'partial', 'overdue'].includes(status);
  };

  // Calculate attendance statistics
  const studentAttendanceRecords = attendanceRecords.flatMap(record => 
    record.studentRecords.filter(sr => sr.studentId === studentId)
  );
  const totalSessions = studentAttendanceRecords.length;
  const presentCount = studentAttendanceRecords.filter(sr => sr.status === 'present').length;
  const absentCount = studentAttendanceRecords.filter(sr => sr.status === 'absent').length;
  const lateCount = studentAttendanceRecords.filter(sr => sr.status === 'late').length;
  const attendanceRate = totalSessions > 0 ? ((presentCount + lateCount) / totalSessions * 100).toFixed(1) : '0';

  // Get grade statistics
  const gradeAssessments = grades.map(grade => {
    const assessment = assessments.find(a => a.id === grade.assessmentId);
    return { ...grade, assessment };
  }).filter(item => item.assessment);

  return (
    <div className="space-y-6">
      <DemoModeNotification />
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-white hover:bg-white/5"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Students
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Student Profile</h1>
          <p className="text-white/70">View comprehensive student information</p>
        </div>
      </div>

      {/* Student Basic Information */}
      <GlassCard className="p-6">
        <div className="flex items-start gap-6">
          <img
            src={student.avatar}
            alt={student.name}
            className="w-24 h-24 rounded-full border-2 border-white/20"
          />
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-2xl font-bold text-white">{student.name}</h2>
              <Badge className={`${getStatusColor(student.status)} border`}>
                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-white/70">
                <Mail className="w-4 h-4" />
                <span>{student.email}</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Phone className="w-4 h-4" />
                <span>{student.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <User className="w-4 h-4" />
                <span>{student.parentContact}</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Calendar className="w-4 h-4" />
                <span>Joined: {new Date(student.joinDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Users className="w-4 h-4" />
                <span>Class: {studentClass ? studentClass.name : 'Unassigned'}</span>
              </div>
              {outstandingBalance > 0 && (
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>Balance Due: ${outstandingBalance.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/10 border-white/20">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white/20 text-white">
            <User className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="attendance" className="data-[state=active]:bg-white/20 text-white">
            <Calendar className="w-4 h-4 mr-2" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="grades" className="data-[state=active]:bg-white/20 text-white">
            <GraduationCap className="w-4 h-4 mr-2" />
            Grades
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-white/20 text-white">
            <DollarSign className="w-4 h-4 mr-2" />
            Payments
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Attendance Summary */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-8 h-8 text-blue-400" />
                <div>
                  <h3 className="font-semibold text-white">Attendance</h3>
                  <p className="text-2xl font-bold text-white">{attendanceRate}%</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/70">
                  <span>Total Sessions:</span>
                  <span>{totalSessions}</span>
                </div>
                <div className="flex justify-between text-green-300">
                  <span>Present:</span>
                  <span>{presentCount}</span>
                </div>
                <div className="flex justify-between text-red-300">
                  <span>Absent:</span>
                  <span>{absentCount}</span>
                </div>
                <div className="flex justify-between text-yellow-300">
                  <span>Late:</span>
                  <span>{lateCount}</span>
                </div>
              </div>
            </GlassCard>

            {/* Grades Summary */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <GraduationCap className="w-8 h-8 text-green-400" />
                <div>
                  <h3 className="font-semibold text-white">Grades</h3>
                  <p className="text-2xl font-bold text-white">{gradeAssessments.length}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/70">
                  <span>Assessments:</span>
                  <span>{gradeAssessments.length}</span>
                </div>
                <div className="text-white/60">
                  {gradeAssessments.length === 0 ? 'No grades recorded' : 'View Grades tab for details'}
                </div>
              </div>
            </GlassCard>

            {/* Payment Summary */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-8 h-8 text-amber-400" />
                <div>
                  <h3 className="font-semibold text-white">Payments</h3>
                  <p className="text-2xl font-bold text-white">${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/70">
                  <span>Total Paid:</span>
                  <span>${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Outstanding:</span>
                  <span className={outstandingBalance > 0 ? 'text-red-300' : 'text-green-300'}>
                    ${outstandingBalance.toFixed(2)}
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* Class Information */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-8 h-8 text-purple-400" />
                <div>
                  <h3 className="font-semibold text-white">Class</h3>
                  <p className="text-lg font-bold text-white">{studentClass?.name || 'Unassigned'}</p>
                </div>
              </div>
              {studentClass && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white/70">
                    <span>Teacher:</span>
                    <span>{studentClass.teacher.name}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Subject:</span>
                    <span>{studentClass.subject}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Level:</span>
                    <span>{studentClass.level}</span>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Attendance Records</h3>
            {attendanceRecords.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-white/40" />
                <p>No attendance records found</p>
                <p className="text-sm">Attendance records will appear here once classes begin</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="text-white">
                  <TableHeader>
                    <TableRow className="border-white/20 hover:bg-white/5">
                      <TableHead className="text-white/90">Date</TableHead>
                      <TableHead className="text-white/90">Class</TableHead>
                      <TableHead className="text-white/90">Status</TableHead>
                      <TableHead className="text-white/90">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record) => {
                      const studentRecord = record.studentRecords.find(sr => sr.studentId === studentId);
                      if (!studentRecord) return null;
                      
                      return (
                        <TableRow key={record.id} className="border-white/10 hover:bg-white/5">
                          <TableCell>{new Date(record.sessionDate).toLocaleDateString()}</TableCell>
                          <TableCell>{record.className}</TableCell>
                          <TableCell>
                            <Badge className={`${getAttendanceStatusColor(studentRecord.status)} border`}>
                              {studentRecord.status.charAt(0).toUpperCase() + studentRecord.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{studentRecord.notes || '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </GlassCard>
        </TabsContent>

        {/* Grades Tab */}
        <TabsContent value="grades" className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Grade Records</h3>
            {gradeAssessments.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <GraduationCap className="w-12 h-12 mx-auto mb-4 text-white/40" />
                <p>No grades recorded</p>
                <p className="text-sm">Grades will appear here once assessments are completed</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="text-white">
                  <TableHeader>
                    <TableRow className="border-white/20 hover:bg-white/5">
                      <TableHead className="text-white/90">Assessment</TableHead>
                      <TableHead className="text-white/90">Type</TableHead>
                      <TableHead className="text-white/90">Date</TableHead>
                      <TableHead className="text-white/90">Grade</TableHead>
                      <TableHead className="text-white/90">Comments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gradeAssessments.map((item) => (
                      <TableRow key={item.id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="font-medium">{item.assessment?.title}</TableCell>
                        <TableCell>{item.assessment?.type}</TableCell>
                        <TableCell>{item.assessment ? new Date(item.assessment.date).toLocaleDateString() : '-'}</TableCell>
                        <TableCell className="font-semibold text-green-300">{item.value}</TableCell>
                        <TableCell>{item.comments || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </GlassCard>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          {/* Payment Obligations */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Payment Obligations</h3>
            {obligations.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <DollarSign className="w-12 h-12 mx-auto mb-4 text-white/40" />
                <p>No payment obligations</p>
                <p className="text-sm">Payment obligations will appear here when assigned</p>
              </div>
            ) : (              <div className="overflow-x-auto">
                <Table className="text-white">
                  <TableHeader>
                    <TableRow className="border-white/20 hover:bg-white/5">
                      <TableHead className="text-white/90">Type</TableHead>
                      <TableHead className="text-white/90">Period</TableHead>
                      <TableHead className="text-white/90">Amount</TableHead>
                      <TableHead className="text-white/90">Due Date</TableHead>
                      <TableHead className="text-white/90">Status</TableHead>
                      <TableHead className="text-white/90">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {obligations.map((obligation) => (
                      <TableRow key={obligation.id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="font-medium">{obligation.type}</TableCell>
                        <TableCell>{obligation.period}</TableCell>
                        <TableCell>${obligation.amount.toFixed(2)}</TableCell>
                        <TableCell>{new Date(obligation.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={`${getPaymentStatusColor(obligation.status)} border`}>
                            {obligation.status.charAt(0).toUpperCase() + obligation.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {canMakePayment(obligation.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenPaymentSidebar(obligation)}
                              className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30 hover:text-blue-200"
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              Pay
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </GlassCard>

          {/* Payment History */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Payment History</h3>
            {payments.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-white/40" />
                <p>No payments recorded</p>
                <p className="text-sm">Payment history will appear here when payments are made</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="text-white">
                  <TableHeader>
                    <TableRow className="border-white/20 hover:bg-white/5">
                      <TableHead className="text-white/90">Date</TableHead>
                      <TableHead className="text-white/90">Amount</TableHead>
                      <TableHead className="text-white/90">Method</TableHead>
                      <TableHead className="text-white/90">Reference</TableHead>
                      <TableHead className="text-white/90">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id} className="border-white/10 hover:bg-white/5">
                        <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-semibold text-green-300">${payment.amount.toFixed(2)}</TableCell>
                        <TableCell>{payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}</TableCell>
                        <TableCell>{payment.reference || '-'}</TableCell>
                        <TableCell>{payment.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </GlassCard>
        </TabsContent>      </Tabs>

      {/* Payment Sidebar */}      <PaymentSidebar
        isOpen={isPaymentSidebarOpen}
        onClose={handleClosePaymentSidebar}
        obligation={selectedObligation}
        studentName={student.name}
      />
    </div>
  );
};

export default StudentProfile;
