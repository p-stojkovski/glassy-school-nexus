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
import { TeacherOverview } from './tabs/overview';
import { TeacherClassesTab } from './tabs/classes';
import { TeacherLessonsTab } from './tabs/lessons';
import { TeacherSalaryTab } from './tabs/salary';

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
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="classes"
            className="data-[state=active]:bg-white/20 text-white"
          >
            Classes
          </TabsTrigger>
          <TabsTrigger
            value="lessons"
            className="data-[state=active]:bg-white/20 text-white"
          >
            Lessons
          </TabsTrigger>
          <TabsTrigger
            value="salary"
            className="data-[state=active]:bg-white/20 text-white"
          >
            Salary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <TeacherOverview
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

        <TabsContent value="lessons">
          <TeacherLessonsTab
            teacherId={teacher.id}
            academicYearId={selectedYearId}
            yearName={selectedYear?.name}
          />
        </TabsContent>

        <TabsContent value="salary" className="space-y-4">
          <TeacherSalaryTab
            academicYearId={selectedYearId}
            yearName={selectedYear?.name}
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
