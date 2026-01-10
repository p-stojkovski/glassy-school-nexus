import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GlassCard from '@/components/common/GlassCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { AppBreadcrumb } from '@/components/navigation';
import { buildTeacherBreadcrumbs } from '@/domains/teachers/_shared/utils/teacherBreadcrumbs';
import { TeacherPageHeader } from './layout';
import { useTeacherProfile } from './useTeacherProfile';
import { useTeacherAcademicYear } from './hooks/useTeacherAcademicYear';
import { EditTeacherSheet } from './dialogs';
import { TeacherScheduleTab } from './tabs/schedule';
import { TeacherClassesTab } from './tabs/classes';
import { SalaryCalculationsTab } from './tabs/salary-calculations';

const TeacherProfilePage: React.FC = () => {
  const {
    teacher,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    overviewData,
    overviewLoading,
    paymentSummary,
    isEditSheetOpen,
    handleOpenEditSheet,
    handleCloseEditSheet,
    handleEditSuccess,
  } = useTeacherProfile();

  // Academic year context for filtering tabs
  const {
    selectedYearId,
    selectedYear,
    setSelectedYearId,
    years,
    isLoading: yearsLoading,
    isBetweenYears,
    betweenYearsMessage,
  } = useTeacherAcademicYear();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AppBreadcrumb
          items={buildTeacherBreadcrumbs({ pageType: 'details' })}
        />
        <div className="flex items-center justify-center min-h-[200px]">
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <AppBreadcrumb
          items={buildTeacherBreadcrumbs({ pageType: 'details' })}
        />
        <GlassCard className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-red-400">{error}</div>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!teacher) {
    return null;
  }

  return (
    <div className="space-y-6">
      <TeacherPageHeader
        teacher={teacher}
        onEdit={handleOpenEditSheet}
        selectedYear={selectedYear}
        years={years}
        onYearChange={setSelectedYearId}
        isBetweenYears={isBetweenYears}
        betweenYearsMessage={betweenYearsMessage}
        yearsLoading={yearsLoading}
        studentsCount={overviewData?.students?.totalStudents}
        studentsLoading={overviewLoading}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-transparent border-b border-white/[0.08] rounded-none p-0 h-auto gap-1">
          <TabsTrigger
            value="schedule"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white/80 data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white/90 rounded-none px-4 py-2 font-medium transition-colors"
          >
            Schedule
          </TabsTrigger>
          <TabsTrigger
            value="classes"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white/80 data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white/90 rounded-none px-4 py-2 font-medium transition-colors"
          >
            Classes
          </TabsTrigger>
          <TabsTrigger
            value="salary"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white/80 data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white/90 rounded-none px-4 py-2 font-medium transition-colors"
          >
            Salary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <TeacherScheduleTab
            overviewData={overviewData}
            overviewLoading={overviewLoading}
          />
        </TabsContent>

        <TabsContent value="classes">
          <TeacherClassesTab
            teacherId={teacher.id}
            academicYearId={selectedYearId}
            yearName={selectedYear?.name}
          />
        </TabsContent>

        <TabsContent value="salary" className="space-y-4">
          <SalaryCalculationsTab
            academicYearId={selectedYearId}
            yearName={selectedYear?.name}
            isActive={activeTab === 'salary'}
          />
        </TabsContent>
      </Tabs>

      <EditTeacherSheet
        isOpen={isEditSheetOpen}
        onClose={handleCloseEditSheet}
        onSuccess={handleEditSuccess}
        teacher={teacher}
      />
    </div>
  );
};

export default TeacherProfilePage;
