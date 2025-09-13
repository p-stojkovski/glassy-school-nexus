import React, { useState, useEffect } from 'react';
import { RootState } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  AttendanceRecord,
  StudentAttendance,
  createAttendanceRecord,
  updateDetailedAttendanceRecord,
  selectAttendanceByClassId,
  selectAttendanceByDate,
  setCurrentRecord,
} from '@/domains/attendance/attendanceSlice';
import GlassCard from '@/components/common/GlassCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import HomeworkCompletionCell from './HomeworkCompletionCell';
import { isHomeworkCompletionEnabled, getDefaultHomeworkCompletion } from '@/utils/homeworkStatusUtils';

interface AttendanceMarkerProps {
  classId: string;
  date: string;
}

type StatusType = 'present' | 'absent' | 'late';

const AttendanceMarker: React.FC<AttendanceMarkerProps> = ({
  classId,
  date,
}) => {
  const dispatch = useAppDispatch();
  const { classes } = useAppSelector((state: RootState) => state.classes);
  const { teachers } = useAppSelector((state: RootState) => state.teachers);
  const { students } = useAppSelector((state: RootState) => state.students);
  const attendanceRecords = useAppSelector(
    (state: RootState) => state.attendance.attendanceRecords
  );
  const [attendanceData, setAttendanceData] = useState<
    Record<string, { status: StatusType; notes: string; homeworkCompleted?: boolean; homeworkNotes?: string }>
  >({});
  const [selectedClass, setSelectedClass] = useState(
    classes.find((c) => c.id === classId)
  );
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);

  // Initialize or fetch attendance data when class or date changes
  useEffect(() => {
    if (classId && date) {
      // Find if we have an existing record for this class and date
      const existingRecord = attendanceRecords.find(
        (record) => record.classId === classId && record.sessionDate === date
      );

      if (existingRecord) {
        // We are editing an existing record
        setIsEditing(true);
        setCurrentRecordId(existingRecord.id);

        // Convert student records to the format our component uses
        const studentData: Record<
          string,
          { status: StatusType; notes: string; homeworkCompleted?: boolean; homeworkNotes?: string }
        > = {};
        existingRecord.studentRecords.forEach((record) => {
          studentData[record.studentId] = {
            status: record.status,
            notes: record.notes || '',
            homeworkCompleted: record.homeworkCompleted,
            homeworkNotes: record.homeworkNotes || '',
          };
        });

        setAttendanceData(studentData);
        dispatch(setCurrentRecord(existingRecord));
      } else {
        // Creating a new record
        setIsEditing(false);
        setCurrentRecordId(null);
        dispatch(setCurrentRecord(null));
        // Initialize with default values
        if (selectedClass) {
          // Use all students for now - in a real implementation we'd have proper class-student association
          const classStudents = students;

          const initialData: Record<
            string,
            { status: StatusType; notes: string; homeworkCompleted?: boolean; homeworkNotes?: string }
          > = {};
          classStudents.forEach((student) => {
            initialData[student.id] = { 
              status: 'present', 
              notes: '',
              homeworkCompleted: getDefaultHomeworkCompletion('present'),
              homeworkNotes: ''
            };
          });

          setAttendanceData(initialData);
        } else {
          setAttendanceData({});
        }
      }
    }
  }, [classId, date, attendanceRecords, selectedClass, students, dispatch]);

  // Update selected class when classId changes
  useEffect(() => {
    setSelectedClass(classes.find((c) => c.id === classId));
  }, [classId, classes]);
  if (!classId || classId === 'all-classes') {
    return (
      <GlassCard className="p-6 text-white text-center py-12">
        <h3 className="text-xl">
          Please select a specific class to mark attendance
        </h3>
      </GlassCard>
    );
  }

  if (!selectedClass) {
    return (
      <GlassCard className="p-6 text-white text-center py-12">
        <h3 className="text-xl">Class not found</h3>
      </GlassCard>
    );
  }

  const handleStatusChange = (studentId: string, status: StatusType) => {
    setAttendanceData((prev) => {
      const currentData = prev[studentId] || { status: 'present', notes: '', homeworkCompleted: false, homeworkNotes: '' };
      
      // Reset homework completion when student becomes absent
      const newHomeworkCompleted = status === 'absent' ? undefined : currentData.homeworkCompleted;
      const newHomeworkNotes = status === 'absent' ? undefined : currentData.homeworkNotes;
      
      return {
        ...prev,
        [studentId]: { 
          ...currentData, 
          status,
          homeworkCompleted: newHomeworkCompleted,
          homeworkNotes: newHomeworkNotes
        },
      };
    });
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], notes },
    }));
  };

  const handleHomeworkChange = (studentId: string, completed: boolean) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], homeworkCompleted: completed },
    }));
  };

  const handleHomeworkNotesChange = (studentId: string, homeworkNotes: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], homeworkNotes },
    }));
  };
  const handleSubmit = () => {
    // Check if all students have attendance marked
    // Use all students for now - in a real implementation we'd have proper class-student association
    const classStudents = students;

    const unmarkedStudents = classStudents.filter(
      (student) => !attendanceData[student.id]
    );

    if (unmarkedStudents.length > 0) {
      toast({
        title: 'Missing Attendance',
        description: `Please mark attendance for all students before submitting`,
        variant: 'destructive',
      });
      return;
    }

    // Check for present students without homework completion marked (optional warning)
    const presentStudentsWithoutHomework = classStudents.filter((student) => {
      const studentData = attendanceData[student.id];
      return studentData && 
             studentData.status !== 'absent' && 
             studentData.homeworkCompleted === undefined;
    });

    if (presentStudentsWithoutHomework.length > 0) {
      toast({
        title: 'Homework Status Missing',
        description: `${presentStudentsWithoutHomework.length} present students don't have homework completion marked. You can still submit, but homework data will be incomplete.`,
        variant: 'default',
      });
    }

    setConfirmDialogOpen(true);
  };

  const confirmSubmit = () => {
    if (!selectedClass) return;

    // Convert attendance data to the format expected by our store
    const studentRecords: StudentAttendance[] = Object.entries(
      attendanceData
    ).map(([studentId, data]) => {
      const student = students.find((s) => s.id === studentId);
      return {
        studentId,
        studentName: student?.name || 'Unknown Student',
        status: data.status,
        notes: data.notes || undefined,
        homeworkCompleted: data.homeworkCompleted,
        homeworkNotes: data.homeworkNotes || undefined,
      };
    });

    const teacherId = selectedClass.teacher?.id || '';
    const teacher = teachers.find((t) => t.id === teacherId);

    if (isEditing && currentRecordId) {
      // Update existing record
      const updatedRecord: AttendanceRecord = {
        id: currentRecordId,
        classId,
        className: selectedClass.name,
        teacherId,
        teacherName: teacher?.name || 'Unknown Teacher',
        sessionDate: date,
        studentRecords,
        updatedAt: new Date().toISOString(),
        createdAt:
          attendanceRecords.find((r) => r.id === currentRecordId)?.createdAt ||
          new Date().toISOString(),
      };

      dispatch(updateDetailedAttendanceRecord(updatedRecord));
      toast({
        title: 'Attendance Updated',
        description: `Attendance record for ${selectedClass.name} has been updated`,
      });
    } else {
      // Create new record
      const newRecord: AttendanceRecord = {
        id: `attendance-${Date.now()}`,
        classId,
        className: selectedClass.name,
        teacherId,
        teacherName: teacher?.name || 'Unknown Teacher',
        sessionDate: date,
        studentRecords,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dispatch(createAttendanceRecord(newRecord));
      toast({
        title: 'Attendance Submitted',
        description: `Attendance record for ${selectedClass.name} has been saved`,
      });
    }

    setConfirmDialogOpen(false);
  };
  // Get all students for now - in a real implementation, we'd have a proper class-student association
  const classStudents = students;

  if (classStudents.length === 0) {
    return (
      <GlassCard className="p-6 text-white text-center py-12">
        <h3 className="text-xl">No students available to mark attendance</h3>
      </GlassCard>
    );
  }

  return (
    <>
      <GlassCard className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium text-white">
              {isEditing ? 'Edit Attendance' : 'Mark Attendance'}:{' '}
              {selectedClass.name}
            </h3>
            <div className="text-white bg-white/10 px-3 py-1 rounded-md text-sm">
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
          <Table className="text-white">
            <TableHeader>
              <TableRow className="hover:bg-white/5 border-white/20">
                <TableHead className="text-white/70">Student Name</TableHead>
                <TableHead className="text-white/70 w-[200px]">
                  Status
                </TableHead>
                <TableHead className="text-white/70 w-[150px]">
                  Homework
                </TableHead>
                <TableHead className="text-white/70 w-[250px]">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classStudents.map((student) => (
                <TableRow
                  key={student.id}
                  className="hover:bg-white/5 border-white/10"
                >
                  <TableCell>{student.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-4 h-4 rounded-full ${
                            attendanceData[student.id]?.status === 'present'
                              ? 'bg-green-500'
                              : 'bg-white/20'
                          }`}
                          onClick={() =>
                            handleStatusChange(student.id, 'present')
                          }
                        />
                        <Label
                          className="cursor-pointer"
                          onClick={() =>
                            handleStatusChange(student.id, 'present')
                          }
                        >
                          Present
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-4 h-4 rounded-full ${
                            attendanceData[student.id]?.status === 'absent'
                              ? 'bg-red-500'
                              : 'bg-white/20'
                          }`}
                          onClick={() =>
                            handleStatusChange(student.id, 'absent')
                          }
                        />
                        <Label
                          className="cursor-pointer"
                          onClick={() =>
                            handleStatusChange(student.id, 'absent')
                          }
                        >
                          Absent
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-4 h-4 rounded-full ${
                            attendanceData[student.id]?.status === 'late'
                              ? 'bg-yellow-500'
                              : 'bg-white/20'
                          }`}
                          onClick={() => handleStatusChange(student.id, 'late')}
                        />
                        <Label
                          className="cursor-pointer"
                          onClick={() => handleStatusChange(student.id, 'late')}
                        >
                          Late
                        </Label>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <HomeworkCompletionCell
                      studentId={student.id}
                      studentName={student.name}
                      attendanceStatus={attendanceData[student.id]?.status || 'present'}
                      homeworkCompleted={attendanceData[student.id]?.homeworkCompleted}
                      onHomeworkChange={handleHomeworkChange}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={attendanceData[student.id]?.notes || ''}
                      onChange={(e) =>
                        handleNotesChange(student.id, e.target.value)
                      }
                      placeholder="Add notes (optional)"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Homework Completion Summary */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium">Homework Completion Summary</h4>
              <div className="text-white/80 text-sm">
                {(() => {
                  const presentStudents = Object.values(attendanceData).filter(data => data.status !== 'absent');
                  const completedHomework = presentStudents.filter(data => data.homeworkCompleted === true);
                  return `${completedHomework.length}/${presentStudents.length} students completed homework`;
                })()}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
            >
              {isEditing ? 'Update Attendance' : 'Submit Attendance'}
            </Button>
          </div>
        </div>
      </GlassCard>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent className="bg-gray-900 text-white border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Attendance Submission</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              {isEditing
                ? 'Are you sure you want to update the attendance record? This will overwrite the previous record.'
                : 'Are you sure you want to submit this attendance record?'}
            </AlertDialogDescription>
          </AlertDialogHeader>{' '}
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 hover:bg-white/10 text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              onClick={confirmSubmit}
            >
              {isEditing ? 'Update' : 'Submit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AttendanceMarker;

