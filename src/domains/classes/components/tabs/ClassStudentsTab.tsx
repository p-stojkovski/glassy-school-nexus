import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Plus, Loader2, Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { toast } from 'sonner';
import GlassCard from '@/components/common/GlassCard';
import ScheduleEnrollmentTab from '@/domains/classes/components/forms/tabs/ScheduleEnrollmentTab';
import StudentSelectionPanel from '@/components/common/StudentSelectionPanel';
import StudentProgressTable from '@/domains/classes/components/sections/StudentProgressTable';
import { ClassResponse, ClassFormData } from '@/types/api/class';
import { classApiService } from '@/services/classApiService';
import { studentApiService } from '@/services/studentApiService';
import { Student } from '@/domains/students/studentsSlice';

interface ClassStudentsTabProps {
  mode: 'view' | 'edit';
  classData: ClassResponse | null;
  form?: UseFormReturn<ClassFormData>;
  onRefetchClassData?: () => Promise<void>;
}

interface StudentToRemove {
  id: string;
  name: string;
  hasAttendance: boolean;
}

const ClassStudentsTab: React.FC<ClassStudentsTabProps> = ({
  mode,
  classData,
  form,
  onRefetchClassData,
}) => {
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<StudentToRemove | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Load active students on mount for the add panel
  useEffect(() => {
    const loadAllStudents = async () => {
      setIsLoadingStudents(true);
      try {
        const { students: activeStudents } = await studentApiService.searchStudents({
          isActive: true,
          skip: 0,
          take: 1000,
        });
        setAllStudents(Array.isArray(activeStudents) ? activeStudents : []);
      } catch (error: any) {
        console.error('Error loading students:', error);
        toast.error('Failed to load students');
      } finally {
        setIsLoadingStudents(false);
      }
    };

    if (mode === 'view') {
      loadAllStudents();
    }
  }, [mode]);

  // Handle adding new students
  const handleAddStudents = async (selectedStudentIds: string[]) => {
    if (!classData) return;

    setIsAdding(true);
    try {
      // Get the IDs to add (newly selected, not already enrolled)
      const newStudentIds = selectedStudentIds.filter(
        (id) => !classData.studentIds.includes(id)
      );

      if (newStudentIds.length === 0) {
        toast.info('No new students to add');
        setIsAddPanelOpen(false);
        return;
      }

      // Merge with existing
      const merged = [...new Set([...classData.studentIds, ...newStudentIds])];

      // Update class with new student list
      await classApiService.updateClass(classData.id, {
        ...classData,
        studentIds: merged,
      });

      // Refetch class data
      if (onRefetchClassData) {
        await onRefetchClassData();
      }

      toast.success(`${newStudentIds.length} student${newStudentIds.length !== 1 ? 's' : ''} added successfully`);
      setIsAddPanelOpen(false);
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to add students';
      toast.error(errorMsg);
      console.error('Error adding students:', error);
    } finally {
      setIsAdding(false);
    }
  };

  // Handle removing a student
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
      // Filter out the removed student
      const filtered = classData.studentIds.filter((id) => id !== studentToRemove.id);

      // Update class with new student list
      await classApiService.updateClass(classData.id, {
        ...classData,
        studentIds: filtered,
      });

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
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-3">
                <Users className="w-6 h-6 text-white/40" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Students Enrolled</h3>
              <p className="text-white/60 mb-4 max-w-md mx-auto">
                This class doesn't have any students yet. Add students to start tracking their progress and attendance.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  onClick={() => setIsAddPanelOpen(true)}
                  disabled={isAdding || isLoadingStudents}
                  className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium"
                >
                  {isLoadingStudents ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Add Students
                    </>
                  )}
                </Button>
              </div>
              {classData.availableSlots > 0 && (
                <p className="text-white/40 text-sm mt-4">
                  {classData.availableSlots} {classData.availableSlots === 1 ? 'slot' : 'slots'} available (capacity: {classData.classroomCapacity})
                </p>
              )}
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
          />
        )}

        {/* Add Students Panel */}
        <StudentSelectionPanel
          isOpen={isAddPanelOpen}
          onClose={() => setIsAddPanelOpen(false)}
          students={allStudents}
          classes={[]}
          selectedStudentIds={[]}  // Start with empty selection for adding new students
          excludeStudentIds={classData.studentIds}  // Hide already enrolled students
          onSelectionChange={handleAddStudents}
          title="Add Students to Class"
          allowMultiple={true}
        />

        {/* Remove Student Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={studentToRemove !== null}
          title="Remove Student"
          message={`Remove ${studentToRemove?.name || 'this student'} from this class?\n\nThey have not attended any lessons yet and can be safely removed.`}
          confirmText="Remove Student"
          cancelText="Cancel"
          isDangerous={true}
          isLoading={isRemoving}
          onConfirm={handleRemoveStudent}
          onCancel={() => setStudentToRemove(null)}
        />
      </div>
    );
  }

  if (!form) return null;

  return <ScheduleEnrollmentTab form={form} students={[]} classes={[]} />;
};

export default ClassStudentsTab;
