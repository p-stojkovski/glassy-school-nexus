import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { toast } from 'sonner';
import GlassCard from '@/components/common/GlassCard';
import ScheduleEnrollmentTab from '@/domains/classes/components/forms/tabs/ScheduleEnrollmentTab';
import StudentSelectionPanel from '@/components/common/StudentSelectionPanel';
import StudentProgressTable from '@/domains/classes/components/sections/StudentProgressTable';
import { TransferStudentDialog } from '@/domains/classes/components/dialogs/TransferStudentDialog';
import { ClassBasicInfoResponse, ClassFormData } from '@/types/api/class';
import { addStudentsToClass, removeStudentFromClass } from '@/services/classApiService';

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

      // Refetch class data
      if (onRefetchClassData) {
        await onRefetchClassData();
      }

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
        {/* Student Progress Table or Empty State */}
        {classData.enrolledCount === 0 ? (
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Students
              </h3>
              <div className="flex items-center gap-4">
                <span className="text-sm text-white/50">
                  {classData.availableSlots} {classData.availableSlots === 1 ? 'slot' : 'slots'} available (capacity: {classData.classroomCapacity})
                </span>
                <Button
                  onClick={() => setIsAddPanelOpen(true)}
                  disabled={isAdding}
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Add Students
                </Button>
              </div>
            </div>
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-3">
                <Users className="w-6 h-6 text-white/40" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Students Enrolled</h3>
              <p className="text-white/60 mb-4 max-w-md mx-auto">
                This class doesn't have any students yet. Add students to start tracking their progress and attendance.
              </p>
            </div>
          </GlassCard>
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
