import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, BookOpen, Calendar, Users, FileText, ClipboardList, DollarSign } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { AppBreadcrumb } from '@/components/navigation';
import { buildTeacherBreadcrumbs } from '@/domains/teachers/_shared/utils/teacherBreadcrumbs';
import { TeacherPageHeader } from './layout';
import { useTeacherProfile } from './useTeacherProfile';
import { EditTeacherSheet } from './dialogs';
import { TeacherOverview } from './tabs/overview';
import { TeacherDetailsTab } from './tabs/details';
import { TeacherClassesTab } from './tabs/classes';
import { TeacherScheduleTab } from './tabs/schedule';
import { TeacherStudentsTab } from './tabs/students';
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
    isEditSheetOpen,
    handleOpenEditSheet,
    handleCloseEditSheet,
    handleEditSuccess,
    handleTeacherUpdate,
  } = useTeacherProfile();

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
            value="details"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger
            value="classes"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Classes
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger
            value="lessons"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            Lessons
          </TabsTrigger>
          <TabsTrigger
            value="salary"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Salary
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <Users className="w-4 h-4 mr-2" />
            Students
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <TeacherOverview
            overviewData={overviewData}
            overviewLoading={overviewLoading}
            onNavigateToTab={setActiveTab}
          />
        </TabsContent>

        <TabsContent value="details">
          <TeacherDetailsTab
            teacher={teacher}
            onUpdate={handleTeacherUpdate}
          />
        </TabsContent>

        <TabsContent value="classes">
          <TeacherClassesTab teacherId={teacher.id} />
        </TabsContent>

        <TabsContent value="schedule">
          <GlassCard className="p-6">
            <TeacherScheduleTab teacherId={teacher.id} />
          </GlassCard>
        </TabsContent>

        <TabsContent value="lessons">
          <TeacherLessonsTab teacherId={teacher.id} />
        </TabsContent>

        <TabsContent value="salary">
          <GlassCard className="p-0 overflow-hidden">
            <TeacherSalaryTab />
          </GlassCard>
        </TabsContent>

        <TabsContent value="students">
          <GlassCard className="p-6">
            <TeacherStudentsTab teacherId={teacher.id} />
          </GlassCard>
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
