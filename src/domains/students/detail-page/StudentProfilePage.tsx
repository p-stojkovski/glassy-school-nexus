import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Calendar, GraduationCap, DollarSign } from 'lucide-react';
import PaymentSidebar from '@/domains/finance/components/payments/PaymentSidebar';
import StudentProfileHeader from './layout/StudentProfileHeader';
import StudentBasicInfo from './layout/StudentBasicInfo';
import StudentOverview from './tabs/overview/StudentOverview';
import StudentAttendanceTab from './tabs/attendance/StudentAttendanceTab';
import StudentGradesTab from './tabs/grades/StudentGradesTab';
import StudentPaymentsTab from './tabs/payments/StudentPaymentsTab';
import { EditStudentSheet } from './dialogs';
import { useStudentProfile } from './useStudentProfile';
import { useAppDispatch } from '@/store/hooks';
import { updateStudent as updateStudentInStore } from '@/domains/students/studentsSlice';
import { updateStudent } from '@/services/studentApiService';
import type { StudentFormData } from '@/types/api/student';

const StudentProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
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
    isEditSheetOpen,
    handleBack,
    handleOpenPaymentSidebar,
    handleClosePaymentSidebar,
    handleOpenEditSheet,
    handleCloseEditSheet,
    canMakePayment,
    getStatusColor,
    getAttendanceStatusColor,
    getPaymentStatusColor,
  } = useStudentProfile();

  const handleSubmitEdit = async (data: StudentFormData) => {
    if (!student) throw new Error('No student to update');
    const updatedStudent = await updateStudent(student.id, data);
    dispatch(updateStudentInStore(updatedStudent));
    return updatedStudent;
  };

  const handleEditSuccess = () => {
    // The Redux state is already updated by handleSubmitEdit
    // This callback can be used for additional side effects if needed
  };

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
        onEdit={handleOpenEditSheet}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-transparent border-b border-white/[0.08] rounded-none p-0 h-auto gap-1">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white/80 data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white/90 rounded-none px-4 py-2 font-medium transition-colors"
          >
            <User className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white/80 data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white/90 rounded-none px-4 py-2 font-medium transition-colors"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Attendance
          </TabsTrigger>
          <TabsTrigger
            value="grades"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white/80 data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white/90 rounded-none px-4 py-2 font-medium transition-colors"
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            Grades
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white/80 data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white/90 rounded-none px-4 py-2 font-medium transition-colors"
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

      <EditStudentSheet
        student={student}
        open={isEditSheetOpen}
        onOpenChange={(open) => !open && handleCloseEditSheet()}
        onSuccess={handleEditSuccess}
        onSubmit={handleSubmitEdit}
      />
    </div>
  );
};

export default StudentProfilePage;
