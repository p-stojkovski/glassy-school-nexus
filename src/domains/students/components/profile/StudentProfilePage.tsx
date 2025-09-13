import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Calendar, GraduationCap, DollarSign } from 'lucide-react';
import PaymentSidebar from '@/domains/finance/components/payments/PaymentSidebar';
import StudentProfileHeader from './StudentProfileHeader';
import StudentBasicInfo from './StudentBasicInfo';
import StudentOverview from './StudentOverview';
import StudentAttendanceTab from './StudentAttendanceTab';
import StudentGradesTab from './StudentGradesTab';
import StudentPaymentsTab from './StudentPaymentsTab';
import { useStudentProfile } from '@/domains/students/hooks/useStudentProfile';

const StudentProfilePage: React.FC = () => {
  const {
    student,
    studentClass,
    obligations,
    payments,
    outstandingBalance,
    attendanceRecords,
    attendanceStats,
    gradeAssessments,
    activeTab,
    setActiveTab,
    isPaymentSidebarOpen,
    selectedObligation,
    handleBack,
    handleOpenPaymentSidebar,
    handleClosePaymentSidebar,
    canMakePayment,
    getStatusColor,
    getAttendanceStatusColor,
    getPaymentStatusColor,
  } = useStudentProfile();

  if (!student) {
    return null; // Will redirect
  }

  return (
    <div className="space-y-6">
      <StudentProfileHeader onBack={handleBack} />

      <StudentBasicInfo
        student={student}
        studentClass={studentClass}
        outstandingBalance={outstandingBalance}
        getStatusColor={getStatusColor}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-white/10 border-white/20">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <User className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Attendance
          </TabsTrigger>
          <TabsTrigger
            value="grades"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            Grades
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <StudentOverview
            attendanceStats={attendanceStats}
            gradeAssessments={gradeAssessments}
            payments={payments}
            outstandingBalance={outstandingBalance}
            studentClass={studentClass}
          />
        </TabsContent>

        <TabsContent value="attendance">
          <StudentAttendanceTab
            attendanceRecords={attendanceRecords}
            studentId={student.id}
            getAttendanceStatusColor={getAttendanceStatusColor}
          />
        </TabsContent>

        <TabsContent value="grades">
          <StudentGradesTab gradeAssessments={gradeAssessments} />
        </TabsContent>

        <TabsContent value="payments">
          <StudentPaymentsTab
            obligations={obligations}
            payments={payments}
            onOpenPaymentSidebar={handleOpenPaymentSidebar}
            canMakePayment={canMakePayment}
            getPaymentStatusColor={getPaymentStatusColor}
          />
        </TabsContent>
      </Tabs>

      <PaymentSidebar
        isOpen={isPaymentSidebarOpen}
        onClose={handleClosePaymentSidebar}
        obligation={selectedObligation}
        studentName={student.fullName}
      />
    </div>
  );
};

export default StudentProfilePage;

