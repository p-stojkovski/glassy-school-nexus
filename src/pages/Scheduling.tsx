
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import SchedulingHeader from '../components/scheduling/SchedulingHeader';
import SchedulingFilters from '../components/scheduling/SchedulingFilters';
import SchedulingCalendar from '../components/scheduling/SchedulingCalendar';
import SchedulingOverview from '../components/scheduling/SchedulingOverview';
import ScheduleClassForm from '../components/scheduling/ScheduleClassForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { 
  setScheduledClasses, 
  addScheduledClass, 
  updateScheduledClass, 
  cancelScheduledClass,
  ScheduledClass 
} from '../store/slices/schedulingSlice';
import { toast } from '../components/ui/use-toast';

const Scheduling: React.FC = () => {
  const dispatch = useDispatch();
  const { scheduledClasses } = useSelector((state: RootState) => state.scheduling);
  const { classes } = useSelector((state: RootState) => state.classes);
  const { teachers } = useSelector((state: RootState) => state.teachers);
  const { classrooms } = useSelector((state: RootState) => state.classrooms);
  
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledClass | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [scheduleToCancel, setScheduleToCancel] = useState<ScheduledClass | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load mock scheduled classes
  useEffect(() => {
    const mockScheduledClasses: ScheduledClass[] = [
      {
        id: '1',
        classId: 'class-1',
        className: 'English Basics A1',
        teacherId: 'teacher-1',
        teacherName: 'Sarah Johnson',
        studentIds: ['student-1', 'student-2', 'student-3'],
        classroomId: '101',
        classroomName: 'Room 101',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:30',
        status: 'scheduled',
        isRecurring: true,
        recurringPattern: 'weekly',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        classId: 'class-2',
        className: 'English Intermediate B1',
        teacherId: 'teacher-2',
        teacherName: 'Michael Brown',
        studentIds: ['student-4', 'student-5'],
        classroomId: '102',
        classroomName: 'Room 102',
        date: new Date().toISOString().split('T')[0],
        startTime: '11:00',
        endTime: '12:30',
        status: 'scheduled',
        isRecurring: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    dispatch(setScheduledClasses(mockScheduledClasses));
  }, [dispatch]);

  const filteredScheduledClasses = scheduledClasses.filter(schedule => {
    const matchesSearch = schedule.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const checkConflicts = (scheduleData: any) => {
    const conflicts = scheduledClasses.filter(existing => 
      existing.date === scheduleData.date &&
      existing.status === 'scheduled' &&
      existing.id !== scheduleData.id &&
      (
        (existing.teacherId === scheduleData.teacherId) ||
        (existing.classroomId === scheduleData.classroomId) ||
        (existing.studentIds.some((id: string) => scheduleData.studentIds.includes(id)))
      ) &&
      (
        (scheduleData.startTime >= existing.startTime && scheduleData.startTime < existing.endTime) ||
        (scheduleData.endTime > existing.startTime && scheduleData.endTime <= existing.endTime) ||
        (scheduleData.startTime <= existing.startTime && scheduleData.endTime >= existing.endTime)
      )
    );

    return conflicts;
  };

  const handleScheduleClass = (scheduleData: any) => {
    const conflicts = checkConflicts(scheduleData);
    
    if (conflicts.length > 0) {
      toast({
        title: "Scheduling Conflict",
        description: "There are conflicts with existing schedules. Please choose a different time.",
        variant: "destructive",
      });
      return;
    }

    const selectedClass = classes.find(c => c.id === scheduleData.classId);
    const selectedTeacher = teachers.find(t => t.id === scheduleData.teacherId);
    const selectedClassroom = classrooms.find(c => c.id === scheduleData.classroomId);

    const newSchedule: ScheduledClass = {
      id: `schedule-${Date.now()}`,
      ...scheduleData,
      className: selectedClass?.name || '',
      teacherName: selectedTeacher?.name || '',
      classroomName: selectedClassroom?.name || '',
      status: 'scheduled' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addScheduledClass(newSchedule));
    setShowScheduleForm(false);
    
    toast({
      title: "Class Scheduled",
      description: `${newSchedule.className} has been scheduled successfully.`,
    });
  };

  const handleReschedule = (scheduleData: any) => {
    if (!editingSchedule) return;

    const conflicts = checkConflicts({ ...scheduleData, id: editingSchedule.id });
    
    if (conflicts.length > 0) {
      toast({
        title: "Scheduling Conflict",
        description: "There are conflicts with existing schedules. Please choose a different time.",
        variant: "destructive",
      });
      return;
    }

    const selectedClass = classes.find(c => c.id === scheduleData.classId);
    const selectedTeacher = teachers.find(t => t.id === scheduleData.teacherId);
    const selectedClassroom = classrooms.find(c => c.id === scheduleData.classroomId);

    const updatedSchedule: ScheduledClass = {
      ...editingSchedule,
      ...scheduleData,
      className: selectedClass?.name || editingSchedule.className,
      teacherName: selectedTeacher?.name || editingSchedule.teacherName,
      classroomName: selectedClassroom?.name || editingSchedule.classroomName,
      updatedAt: new Date().toISOString(),
    };

    dispatch(updateScheduledClass(updatedSchedule));
    setEditingSchedule(null);
    setShowScheduleForm(false);
    
    toast({
      title: "Class Rescheduled",
      description: `${updatedSchedule.className} has been rescheduled successfully.`,
    });
  };

  const handleCancelClass = () => {
    if (scheduleToCancel && cancelReason.trim()) {
      dispatch(cancelScheduledClass({
        id: scheduleToCancel.id,
        reason: cancelReason
      }));
      
      toast({
        title: "Class Canceled",
        description: `${scheduleToCancel.className} has been canceled.`,
      });
      
      setShowCancelDialog(false);
      setScheduleToCancel(null);
      setCancelReason('');
    }
  };

  const handleEditSchedule = (schedule: ScheduledClass) => {
    setEditingSchedule(schedule);
    setShowScheduleForm(true);
  };

  const handleCancelSchedule = (schedule: ScheduledClass) => {
    setScheduleToCancel(schedule);
    setShowCancelDialog(true);
  };

  return (
    <div className="space-y-6">
      <SchedulingHeader onScheduleClass={() => setShowScheduleForm(true)} />

      <SchedulingFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SchedulingCalendar />
        </div>

        <div className="lg:col-span-2">
          <SchedulingOverview
            scheduledClasses={filteredScheduledClasses}
            onEdit={handleEditSchedule}
            onCancel={handleCancelSchedule}
          />
        </div>
      </div>

      {/* Schedule Class Dialog */}
      <Dialog open={showScheduleForm} onOpenChange={setShowScheduleForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-white/20">
          <ScheduleClassForm
            onSubmit={editingSchedule ? handleReschedule : handleScheduleClass}
            onCancel={() => {
              setShowScheduleForm(false);
              setEditingSchedule(null);
            }}
            initialData={editingSchedule}
          />
        </DialogContent>
      </Dialog>

      {/* Cancel Class Dialog */}
      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancel Class"
        description={`Are you sure you want to cancel ${scheduleToCancel?.className}? Please provide a reason for cancellation.`}
        onConfirm={handleCancelClass}
      />

      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg border border-white/20 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Cancel Class</h3>
            <p className="text-white/70 mb-4">
              Are you sure you want to cancel {scheduleToCancel?.className}?
            </p>
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium text-white">Reason for cancellation *</label>
              <Input
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason..."
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="flex-1 px-4 py-2 bg-white/10 text-white rounded-md hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelClass}
                disabled={!cancelReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduling;
