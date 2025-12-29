import React, { useState, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Users, Loader2, Plus, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { toast } from 'sonner';
import { ScheduleEnrollmentTab } from '@/domains/classes/form-page';
import StudentSelectionPanel from '@/components/common/StudentSelectionPanel';
import StudentProgressTable from '@/domains/classes/detail-page/tabs/students/StudentProgressTable';
import { TransferStudentDialog } from '@/domains/classes/detail-page/tabs/students/dialogs';
import StudentFilters from '@/domains/classes/detail-page/tabs/students/StudentFilters';
import { ClassBasicInfoResponse, ClassFormData } from '@/types/api/class';
import { addStudentsToClass, removeStudentFromClass } from '@/services/classApiService';
import { StudentFilter } from '@/domains/classes/_shared/utils/studentFilters';

interface StudentsTabProps {
  mode: 'view' | 'edit';
  classData: ClassBasicInfoResponse | null;
  form?: UseFormReturn<ClassFormData>;
  onRefetchClassData?: () => Promise<void>;
}

interface StudentToRemove {
  id: string;
  name: string;
  hasAttendance: boolean;
}

interface StudentToTransfer {
  id: string;
  name: string;
}

const StudentsTab: React.FC<StudentsTabProps> = ({
  mode,
  classData,
  form,
  onRefetchClassData,
}) => {
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<StudentToRemove | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [studentToTransfer, setStudentToTransfer] = useState<StudentToTransfer | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [studentFilter, setStudentFilter] = useState<StudentFilter>('all');
  // Bump this when we know enrollment changed to invalidate cache in StudentProgressTable
  const [dataVersion, setDataVersion] = useState(0);

  // Memoized callbacks for StudentProgressTable to prevent unnecessary re-renders
  const handleOpenAddPanel = useCallback(() => setIsAddPanelOpen(true), []);

  const handleRemoveStudentRequest = useCallback(
    (studentId: string, studentName: string, hasAttendance: boolean) => {
      setStudentToRemove({ id: studentId, name: studentName, hasAttendance });
    },
    []
  );

  const handleTransferStudentRequest = useCallback(
    (studentId: string, studentName: string) => {
      setStudentToTransfer({ id: studentId, name: studentName });
    },
    []
  );

  // Handle adding new students using the enrollment endpoint
  const handleAddStudents = async (selectedStudentIds: string[]) => {
    if (!classData) return;

    setIsAdding(true);
    try {
      // Use the selected students directly - the panel already filters to available students
      if (selectedStudentIds.length === 0) {
        toast.info('No new students to add');
        setIsAddPanelOpen(false);
        return;
      }

      // Use the dedicated enrollment endpoint
      const result = await addStudentsToClass(classData.id, { studentIds: selectedStudentIds });

      // Refetch class data
      if (onRefetchClassData) {
        await onRefetchClassData();
      }

      // Invalidate cached summaries
      setDataVersion((v) => v + 1);

      // Show success with details from response
      const successCount = result.enrolledCount ?? selectedStudentIds.length;
      toast.success(`${successCount} student${successCount !== 1 ? 's' : ''} added successfully`);
      setIsAddPanelOpen(false);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to add students';
      toast.error(errorMsg);
      console.error('Error adding students:', error);
    } finally {
      setIsAdding(false);
    }
  };

  // Handle removing a student using the enrollment endpoint
  const handleRemoveStudent = async () => {
    if (!classData || !studentToRemove) return;

    // CRITICAL: Double-check that student has no attendance
    if (studentToRemove.hasAttendance) {
      toast.error('Cannot remove student with lesson attendance');
      setStudentToRemove(null);
      return;
    }

    setIsRemoving(true);
    try {
      // Use the dedicated enrollment endpoint
      await removeStudentFromClass(classData.id, studentToRemove.id);

      // Refetch class data
      if (onRefetchClassData) {
        await onRefetchClassData();
      }

      toast.success('Student removed successfully');
      setStudentToRemove(null);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to remove student';
      toast.error(errorMsg);
      console.error('Error removing student:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  if (!classData) return null;

  if (mode === 'view') {
    return (
      <div className="space-y-4">
        {/* Filters and Actions - consistent wrapper styling across tabs */}
        <div className="flex flex-wrap items-end justify-between gap-3 p-3 bg-white/[0.02] rounded-lg border border-white/10">
          {/* Left: Search and Filters */}
          <div className="flex flex-wrap items-end gap-3">
            {/* Search Bar - first and wider - only show when there are students */}
            {classData.enrolledCount > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-white/50 font-medium">Search:</span>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <Input
                    type="text"
                    placeholder="Search students by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 w-[340px] bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/30 h-9"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Student Filter */}
            {classData.enrolledCount > 0 && (
              <StudentFilters
                filter={studentFilter}
                onFilterChange={setStudentFilter}
                compact={true}
              />
            )}
          </div>

          {/* Right: Add Students button */}
          <Button
            onClick={() => setIsAddPanelOpen(true)}
            disabled={isAdding}
            size="default"
            variant="outline"
            className="border-white/30 bg-white/10 hover:bg-white/20 text-white font-medium gap-2 shrink-0 h-9"
          >
            <Plus className="w-4 h-4" />
            Add Students
          </Button>
        </div>

        {/* Content Area - Table or Empty State */}
        {classData.enrolledCount === 0 ? (
          // Empty state with unified container styling
          <div className="border border-white/10 rounded-lg p-8 bg-white/[0.02]">
            <div className="flex flex-col items-center text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
                <Users className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Students Enrolled</h3>
              <p className="text-white/70 mb-6">
                There are no students enrolled in this class yet.
              </p>
              <Button
                onClick={() => setIsAddPanelOpen(true)}
                disabled={isAdding}
                size="default"
                variant="outline"
                className="border-white/30 bg-white/10 hover:bg-white/20 text-white font-medium gap-2"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Your First Student
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <StudentProgressTable
            classId={classData.id}
            mode={mode}
            isAddingStudents={isAdding}
            onAddStudents={handleOpenAddPanel}
            onRemoveStudent={handleRemoveStudentRequest}
            onTransferStudent={handleTransferStudentRequest}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            studentFilter={studentFilter}
            dataVersion={dataVersion}
          />
        )}

        {/* Add Students Panel */}
        {isAddPanelOpen && (
          <StudentSelectionPanel
            isOpen={isAddPanelOpen}
            onClose={() => setIsAddPanelOpen(false)}
            classes={[]}
            selectedStudentIds={[]} // Start with empty selection for adding new students
            availableForEnrollment={true} // Only fetch students not enrolled in any class
            onSelectionChange={handleAddStudents}
            title="Add Students to Class"
            allowMultiple={true}
            classData={{
              id: classData.id,
              enrolledCount: classData.enrolledCount,
              classroomCapacity: classData.classroomCapacity,
              availableSlots: classData.availableSlots,
            }}
          />
        )}

        {/* Remove Student Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={studentToRemove !== null}
          title="Remove Student"
          description={`Remove ${studentToRemove?.name || 'this student'} from this class?\n\nThey have not attended any lessons yet and can be safely removed.`}
          confirmText="Remove Student"
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleRemoveStudent}
          onClose={() => setStudentToRemove(null)}
        />

        {/* Transfer Student Dialog */}
        {studentToTransfer && (
          <TransferStudentDialog
            open={studentToTransfer !== null}
            onOpenChange={(open) => {
              if (!open) setStudentToTransfer(null);
            }}
            sourceClass={classData}
            studentId={studentToTransfer.id}
            studentName={studentToTransfer.name}
            onSuccess={async () => {
              if (onRefetchClassData) {
                await onRefetchClassData();
              }
            }}
          />
        )}
      </div>
    );
  }

  if (!form) return null;

  return <ScheduleEnrollmentTab form={form} students={[]} classes={[]} />;
};

export default StudentsTab;
