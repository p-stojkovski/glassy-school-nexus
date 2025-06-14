
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { Input } from '../components/ui/input';
import SchedulingHeader from '../components/scheduling/SchedulingHeader';
import SchedulingFilters from '../components/scheduling/SchedulingFilters';
import SchedulingCalendar from '../components/scheduling/SchedulingCalendar';
import SchedulingOverview from '../components/scheduling/SchedulingOverview';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { 
  setScheduledClasses, 
  cancelScheduledClass,
  ScheduledClass 
} from '../store/slices/schedulingSlice';
import { toast } from '../hooks/use-toast';

const Scheduling: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { scheduledClasses } = useAppSelector((state: RootState) => state.scheduling);
  
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

  const handleScheduleClass = () => {
    navigate('/scheduling/new');
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
    navigate(`/scheduling/edit/${schedule.id}`);
  };

  const handleCancelSchedule = (schedule: ScheduledClass) => {
    setScheduleToCancel(schedule);
    setShowCancelDialog(true);
  };

  return (
    <div className="space-y-6">
      <SchedulingHeader onScheduleClass={handleScheduleClass} />

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
                value={cancelReason}                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason..."
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="flex-1 px-4 py-2 bg-white/5 text-white rounded-md hover:bg-white/10"
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
