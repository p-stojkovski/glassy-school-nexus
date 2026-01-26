import React from 'react';
import { AppBreadcrumb } from '@/components/navigation';
import { buildTeacherBreadcrumbs } from '@/domains/teachers/_shared/utils/teacherBreadcrumbs';
import { Teacher } from '@/domains/teachers/teachersSlice';
import { AcademicYear } from '@/domains/settings/types/academicCalendarTypes';
import AcademicYearSelector from '../AcademicYearSelector';
import { TeacherMetadataStrip } from './TeacherMetadataStrip';
import { TeacherActionsMenu } from './TeacherActionsMenu';

interface TeacherPageHeaderProps {
  teacher: Teacher | null;
  onEdit: () => void;
  onUpdate?: () => void;
  onOpenEmploymentSettings?: () => void;
  selectedYear?: AcademicYear | null;
  years?: AcademicYear[];
  onYearChange?: (yearId: string) => void;
  isBetweenYears?: boolean;
  betweenYearsMessage?: string | null;
  yearsLoading?: boolean;
  studentsCount?: number;
  studentsLoading?: boolean;
}

const TeacherPageHeader: React.FC<TeacherPageHeaderProps> = ({
  teacher,
  onEdit,
  onOpenEmploymentSettings,
  selectedYear,
  years = [],
  onYearChange,
  isBetweenYears = false,
  betweenYearsMessage,
  yearsLoading = false,
  studentsCount,
  studentsLoading = false,
}) => {
  if (!teacher) {
    return null;
  }

  // Check if delete is allowed (no assigned classes)
  const hasClasses = teacher.classCount > 0;
  const canDelete = !hasClasses;

  return (
    <div className="space-y-3">
      {/* Breadcrumb Navigation */}
      <AppBreadcrumb
        items={buildTeacherBreadcrumbs({
          teacherData: teacher ? { id: teacher.id, name: teacher.name } : null,
          pageType: 'details',
        })}
      />

      {/* Unified Header Strip - Compact single bar */}
      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Metadata Strip */}
          <TeacherMetadataStrip
            teacher={teacher}
            studentsCount={studentsCount}
            studentsLoading={studentsLoading}
          />

          {/* Right: Academic Year Selector + Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Academic Year Selector */}
            {selectedYear && onYearChange && (
              <AcademicYearSelector
                selectedYear={selectedYear}
                years={years}
                onYearChange={onYearChange}
                isBetweenYears={isBetweenYears}
                betweenYearsMessage={betweenYearsMessage}
                isLoading={yearsLoading}
              />
            )}

            {/* Actions Menu */}
            <TeacherActionsMenu
              teacher={teacher}
              onEdit={onEdit}
              onOpenEmploymentSettings={onOpenEmploymentSettings}
              canDelete={canDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherPageHeader;
