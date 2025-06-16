import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '../store';
import {
  addScheduledClass,
  updateScheduledClass,
  ScheduledClass,
} from '@/domains/scheduling/schedulingSlice';
import { toast } from '@/hooks/use-toast';
import ScheduleClassForm from '@/domains/scheduling/components/ScheduleClassForm';
import { ScheduleFormData } from '@/domains/scheduling/components/types';
import { ScheduledClassStatus } from '@/types/enums';

const ScheduleForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { scheduledClasses } = useAppSelector(
    (state: RootState) => state.scheduling
  );
  const { classes } = useAppSelector((state: RootState) => state.classes);
  const { teachers } = useAppSelector((state: RootState) => state.teachers);
  const { classrooms } = useAppSelector((state: RootState) => state.classrooms);

  const editingSchedule = id ? scheduledClasses.find((s) => s.id === id) : null;
  const isEditing = !!editingSchedule; // Using ScheduleFormData imported from ScheduleClassForm

  const checkConflicts = (scheduleData: ScheduleFormData) => {
    const conflicts = scheduledClasses.filter(
      (existing) =>
        existing.date === scheduleData.date &&
        existing.status === ScheduledClassStatus.Scheduled &&
        existing.id !== scheduleData.id &&
        (existing.teacherId === scheduleData.teacherId ||
          existing.classroomId === scheduleData.classroomId ||
          existing.studentIds.some((id: string) =>
            scheduleData.studentIds.includes(id)
          )) &&
        ((scheduleData.startTime >= existing.startTime &&
          scheduleData.startTime < existing.endTime) ||
          (scheduleData.endTime > existing.startTime &&
            scheduleData.endTime <= existing.endTime) ||
          (scheduleData.startTime <= existing.startTime &&
            scheduleData.endTime >= existing.endTime))
    );

    return conflicts;
  };

  const handleSubmit = (scheduleData: ScheduleFormData) => {
    const conflicts = checkConflicts(scheduleData);

    if (conflicts.length > 0) {
      toast({
        title: 'Scheduling Conflict',
        description:
          'There are conflicts with existing schedules. Please choose a different time.',
        variant: 'destructive',
      });
      return;
    }

    const selectedClass = classes.find((c) => c.id === scheduleData.classId);
    const selectedTeacher = teachers.find(
      (t) => t.id === scheduleData.teacherId
    );
    const selectedClassroom = classrooms.find(
      (c) => c.id === scheduleData.classroomId
    );

    if (isEditing && editingSchedule) {
      const updatedSchedule: ScheduledClass = {
        ...editingSchedule,
        ...scheduleData,
        className: selectedClass?.name || editingSchedule.className,
        teacherName: selectedTeacher?.name || editingSchedule.teacherName,
        classroomName: selectedClassroom?.name || editingSchedule.classroomName,
        updatedAt: new Date().toISOString(),
      };

      dispatch(updateScheduledClass(updatedSchedule));
      toast({
        title: 'Class Rescheduled',
        description: `${updatedSchedule.className} has been rescheduled successfully.`,
      });
    } else {
      const newSchedule: ScheduledClass = {
        id: `schedule-${Date.now()}`,
        ...scheduleData,
        className: selectedClass?.name || '',
        teacherName: selectedTeacher?.name || '',
        classroomName: selectedClassroom?.name || '',
        status: ScheduledClassStatus.Scheduled,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dispatch(addScheduledClass(newSchedule));
      toast({
        title: 'Class Scheduled',
        description: `${newSchedule.className} has been scheduled successfully.`,
      });
    }

    navigate('/scheduling');
  };

  const handleBack = () => {
    navigate('/scheduling');
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-4">
        {' '}
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-white hover:bg-white/5"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Scheduling
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isEditing ? 'Reschedule Class' : 'Schedule New Class'}
          </h1>
          <p className="text-white/70">
            {isEditing
              ? 'Update class schedule information'
              : 'Create a new class schedule'}
          </p>
        </div>
      </div>{' '}
      <div className="w-full max-w-full">
        <ScheduleClassForm
          onSubmit={handleSubmit}
          onCancel={handleBack}
          initialData={editingSchedule}
        />
      </div>
    </div>
  );
};

export default ScheduleForm;
