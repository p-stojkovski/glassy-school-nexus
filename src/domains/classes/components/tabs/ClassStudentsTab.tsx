import React, { useState, useEffect, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Users, Loader2, Plus, Calendar, ListChecks, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { toast } from 'sonner';
import ScheduleEnrollmentTab from '@/domains/classes/components/forms/tabs/ScheduleEnrollmentTab';
import StudentSelectionPanel from '@/components/common/StudentSelectionPanel';
import StudentProgressTable from '@/domains/classes/components/sections/StudentProgressTable';
import { TransferStudentDialog } from '@/domains/classes/components/dialogs/TransferStudentDialog';
import { ClassBasicInfoResponse, ClassFormData, StudentLessonSummary } from '@/types/api/class';
import { addStudentsToClass, removeStudentFromClass, classApiService } from '@/services/classApiService';

interface ClassStudentsTabProps {
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

const ClassStudentsTab: React.FC<ClassStudentsTabProps> = ({
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
  const [studentSummaries, setStudentSummaries] = useState<StudentLessonSummary[]>([]);

  // Fetch student summaries for header display
  useEffect(() => {
    if (!classData?.id) return;

    const fetchSummaries = async () => {
      try {
        const data = await classApiService.getClassStudentsSummary(classData.id);
        setStudentSummaries(data);
      } catch (err) {
        console.error('Error fetching student summaries for header:', err);
      }
    };

    fetchSummaries();
  }, [classData?.id]);

  // Calculate total conducted lessons
  const totalConductedLessons = useMemo(() => {
    if (studentSummaries.length === 0) return 0;
    return Math.max(...studentSummaries.map((s) => s.totalLessons));
  }, [studentSummaries]);

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

      // Refetch class data and summaries
      if (onRefetchClassData) {
        await onRefetchClassData();
      }
      const summaries = await classApiService.getClassStudentsSummary(classData.id);
      setStudentSummaries(summaries);

      // Show success with details from response
      const successCount = result.enrolledCount ?? selectedStudentIds.length;
      toast.success(`${successCount} student${successCount !== 1 ? 's' : ''} added successfully`);
      setIsAddPanelOpen(false);
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to add students';
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

      // Refetch class data and summaries
      if (onRefetchClassData) {
        await onRefetchClassData();
      }
      const summaries = await classApiService.getClassStudentsSummary(classData.id);
      setStudentSummaries(summaries);

      toast.success('Student removed successfully');
      setStudentToRemove(null);
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to remove student';
      toast.error(errorMsg);
      console.error('Error removing student:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  if (!classData) return null;

  if (mode === 'view') {
    return (
      <div className="space-y-6">
        {/* Unified Header - Always visible */}
        <div className="mb-4 flex flex-wrap items-center gap-4 md:gap-6 p-3 bg-white/[0.02] rounded-lg border border-white/10">
          {/* Student count */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-white/60" />
            <span className="text-sm text-white/80">
              <span className="font-semibold text-white">{classData.enrolledCount}</span>{' '}
              {classData.enrolledCount === 1 ? 'student' : 'students'}
            </span>
          </div>

          {/* Conditional metric based on enrollment state */}
          {classData.enrolledCount > 0 ? (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white/80">
                <span className="font-semibold text-white">{totalConductedLessons}</span>{' '}
                {totalConductedLessons === 1 ? 'lesson' : 'lessons'} conducted
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white/80">
                <span className="font-semibold text-white">{classData.availableSlots}</span>{' '}
                {classData.availableSlots === 1 ? 'slot' : 'slots'} available
              </span>
            </div>
          )}

          {/* Capacity - always show */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-white/60" />
            <span className="text-sm text-white/60">
              Capacity: <span className="font-semibold text-white/80">{classData.classroomCapacity}</span>
            </span>
          </div>

          {/* Add Students button - right aligned */}
          <div className="ml-auto w-full md:w-auto md:ml-auto">
            <Button
              onClick={() => setIsAddPanelOpen(true)}
              disabled={isAdding}
              size="default"
              variant="outline"
              className="border-white/30 bg-white/10 hover:bg-white/20 text-white font-medium gap-2"
            >
                <Plus className="w-4 h-4" />
                Add Students
            </Button>
          </div>
        </div>

        {/* Content Area - Table or Empty State */}
        {classData.enrolledCount === 0 ? (
          // Empty state with unified container styling
          <div className="border border-white/10 rounded-lg p-8 bg-white/[0.02]">
            <div className="flex flex-col items-center text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
                <Users className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Students Enrolled</h3>
              <p className="text-white/60 text-sm mb-6">
                There are no students enrolled in this class yet.
              </p>
              <Button
                onClick={() => setIsAddPanelOpen(true)}
                disabled={isAdding}
                variant="outline"
                className="gap-2 border-white/30 bg-white/10 hover:bg-white/20 text-white font-medium"
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
            onAddStudents={() => setIsAddPanelOpen(true)}
            onRemoveStudent={(studentId, studentName, hasAttendance) => {
              setStudentToRemove({ id: studentId, name: studentName, hasAttendance });
            }}
            onTransferStudent={(studentId, studentName) => {
              setStudentToTransfer({ id: studentId, name: studentName });
            }}
          />
        )}

        {/* Add Students Panel */}
        <StudentSelectionPanel
          isOpen={isAddPanelOpen}
          onClose={() => setIsAddPanelOpen(false)}
          classes={[]}
          selectedStudentIds={[]}  // Start with empty selection for adding new students
          availableForEnrollment={true}  // Only fetch students not enrolled in any class
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

export default ClassStudentsTab;
