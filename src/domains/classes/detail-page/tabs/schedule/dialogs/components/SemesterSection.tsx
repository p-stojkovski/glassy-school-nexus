import React from 'react';
import { Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FormLabel } from '@/components/ui/form';
import SemestersDropdown from '@/components/common/SemestersDropdown';
import { AcademicSemesterResponse } from '@/types/api/academic-calendar';

interface SemesterSectionProps {
  academicYearId: string | undefined;
  selectedSemesterId: string | null;
  onSemesterChange: (id: string | null) => void;
  loadingSemesters: boolean;
  semesters: AcademicSemesterResponse[];
  /** Label for the section */
  label?: string;
  /** Show badge with current semester name (for edit dialogs) */
  showBadge?: boolean;
  /** Original semester ID for comparison (edit mode) */
  originalSemesterId?: string | null;
  /** Past lesson count for displaying info message (edit mode) */
  pastLessonCount?: number;
}

/**
 * Semester selection section for schedule slot forms.
 * Used by both AddScheduleSlotSheet and EditScheduleSlotDialog.
 */
export function SemesterSection({
  academicYearId,
  selectedSemesterId,
  onSemesterChange,
  loadingSemesters,
  semesters,
  label = 'Semester (Optional)',
  showBadge = false,
  originalSemesterId,
  pastLessonCount,
}: SemesterSectionProps) {
  const hasAcademicYear = !!academicYearId;
  const semesterChanged = originalSemesterId !== undefined && selectedSemesterId !== originalSemesterId;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FormLabel className="text-white text-sm font-medium">{label}</FormLabel>
        {showBadge && (
          selectedSemesterId ? (
            <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/50">
              {semesters.find(s => s.id === selectedSemesterId)?.name || 'Semester'}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-purple-400 border-purple-400/50">
              All Semesters
            </Badge>
          )
        )}
      </div>
      <SemestersDropdown
        academicYearId={academicYearId}
        value={selectedSemesterId || ''}
        onValueChange={(id) => onSemesterChange(id || null)}
        placeholder="All semesters (Global)"
        disabled={loadingSemesters || !hasAcademicYear}
        showDateRangeInfo={true}
        onError={(message) => {
          console.error('Failed to load semesters:', message);
        }}
      />

      {/* No academic year warning */}
      {!hasAcademicYear && (
        <div className="text-xs text-red-300 mt-2">
          This class has no academic year. Semester selection is disabled.
        </div>
      )}

      {/* No semesters defined message */}
      {hasAcademicYear && !loadingSemesters && semesters.length === 0 && (
        <div className="text-xs text-white/60 mt-2">
          No semesters defined for this academic year. Create semesters in Academic Calendar settings.
        </div>
      )}

      {/* Semester change warnings (for edit mode) */}
      {semesterChanged && selectedSemesterId && !originalSemesterId && (
        <div className="text-xs text-amber-300 flex items-start gap-2 mt-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>This schedule will no longer apply to other semesters</span>
        </div>
      )}
      {semesterChanged && !selectedSemesterId && originalSemesterId && (
        <div className="text-xs text-amber-300 flex items-start gap-2 mt-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>This schedule will apply to all semesters</span>
        </div>
      )}

      {/* Past lessons info (for edit mode) */}
      {pastLessonCount !== undefined && pastLessonCount > 0 && (
        <div className="text-xs text-white/60 flex items-start gap-2 mt-1">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{pastLessonCount} past lesson{pastLessonCount !== 1 ? 's' : ''} will remain associated with their original semester</span>
        </div>
      )}
    </div>
  );
}
