
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { Calendar } from '../components/ui/calendar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Plus, CalendarDays, Clock, Users, MapPin, Search, Filter, Edit, X } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import ScheduleClassForm from '../components/scheduling/ScheduleClassForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { 
  setScheduledClasses, 
  addScheduledClass, 
  updateScheduledClass, 
  cancelScheduledClass,
  setSelectedDate,
  setViewMode,
  setFilters,
  ScheduledClass 
} from '../store/slices/schedulingSlice';
import { toast } from '../components/ui/use-toast';

const Scheduling: React.FC = () => {
  const dispatch = useDispatch();
  const { scheduledClasses, selectedDate, viewMode, filters } = useSelector((state: RootState) => state.scheduling);
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
    const matchesClass = !filters.classId || schedule.classId === filters.classId;
    const matchesTeacher = !filters.teacherId || schedule.teacherId === filters.teacherId;
    const matchesClassroom = !filters.classroomId || schedule.classroomId === filters.classroomId;
    const matchesStatus = !filters.status || schedule.status === filters.status;
    
    return matchesSearch && matchesClass && matchesTeacher && matchesClassroom && matchesStatus;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Scheduling & Planning</h1>
          <p className="text-white/70 mt-2">
            Plan, schedule, and manage classes efficiently
          </p>
        </div>
        <Button 
          onClick={() => setShowScheduleForm(true)}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Schedule Class
        </Button>
      </div>

      {/* Filters */}
      <GlassCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
            <Input
              placeholder="Search by class or teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
          
          <Select value={filters.classId || ''} onValueChange={(value) => dispatch(setFilters({classId: value || undefined}))}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Classes</SelectItem>
              {classes.map((classItem) => (
                <SelectItem key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.teacherId || ''} onValueChange={(value) => dispatch(setFilters({teacherId: value || undefined}))}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Teachers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Teachers</SelectItem>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.classroomId || ''} onValueChange={(value) => dispatch(setFilters({classroomId: value || undefined}))}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Classrooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Classrooms</SelectItem>
              {classrooms.map((classroom) => (
                <SelectItem key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.status || ''} onValueChange={(value) => dispatch(setFilters({status: value || undefined}))}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Calendar</h2>
                <div className="flex gap-2">
                  {(['day', 'week', 'month'] as const).map((mode) => (
                    <Button
                      key={mode}
                      variant={viewMode === mode ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => dispatch(setViewMode(mode))}
                      className={
                        viewMode === mode
                          ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => dispatch(setSelectedDate(date || new Date()))}
                className="rounded-md border border-white/10 bg-white/5"
              />
            </div>
          </GlassCard>
        </div>

        {/* Schedule Overview */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Scheduled Classes
                </h2>
                <Badge variant="secondary" className="bg-white/10 text-white">
                  {filteredScheduledClasses.length} Classes
                </Badge>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredScheduledClasses.map((schedule) => (
                  <Card key={schedule.id} className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium text-white">
                              {schedule.className}
                            </h3>
                            <Badge
                              variant={
                                schedule.status === 'scheduled'
                                  ? 'default'
                                  : schedule.status === 'canceled'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              className={
                                schedule.status === 'scheduled'
                                  ? 'bg-green-500/20 text-green-300'
                                  : schedule.status === 'canceled'
                                  ? 'bg-red-500/20 text-red-300'
                                  : 'bg-blue-500/20 text-blue-300'
                              }
                            >
                              {schedule.status}
                            </Badge>
                            {schedule.isRecurring && (
                              <Badge variant="outline" className="border-yellow-500/50 text-yellow-300">
                                Recurring
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-white/60">
                            <div className="flex items-center gap-1">
                              <CalendarDays className="w-4 h-4" />
                              {schedule.date}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {schedule.startTime} - {schedule.endTime}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {schedule.studentIds.length} students
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {schedule.classroomName}
                            </div>
                          </div>
                          <p className="text-sm text-white/70">
                            Teacher: {schedule.teacherName}
                          </p>
                          {schedule.cancelReason && (
                            <p className="text-sm text-red-300">
                              Canceled: {schedule.cancelReason}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {schedule.status === 'scheduled' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingSchedule(schedule);
                                  setShowScheduleForm(true);
                                }}
                                className="text-white/70 hover:text-white hover:bg-white/10"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setScheduleToCancel(schedule);
                                  setShowCancelDialog(true);
                                }}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </GlassCard>
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
        description={`Are you sure you want to cancel ${scheduleToCancel?.className}?`}
        onConfirm={handleCancelClass}
        customContent={
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Reason for cancellation *</label>
            <Input
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason..."
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
        }
      />
    </div>
  );
};

export default Scheduling;
