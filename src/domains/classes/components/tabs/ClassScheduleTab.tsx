import React, { useCallback } from 'react';
import { FormProvider } from 'react-hook-form';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import GlassCard from '@/components/common/GlassCard';
import { NativeTimeInput } from '@/components/common';
import ClassScheduleSection from '@/domains/classes/components/sections/ClassScheduleSection';
import TabEditControls from '@/domains/classes/components/unified/TabEditControls';
import { ClassResponse } from '@/types/api/class';
import { useScheduleTabForm, ScheduleFormData } from '@/domains/classes/hooks/useScheduleTabForm';
import { classApiService } from '@/services/classApiService';
import { toast } from 'sonner';

interface ClassScheduleTabProps {
  classData: ClassResponse;
  onUpdate: () => void;
  onUnsavedChangesChange?: (hasChanges: boolean) => void;
}

const ClassScheduleTab: React.FC<ClassScheduleTabProps> = ({
  classData,
  onUpdate,
  onUnsavedChangesChange,
}) => {
  const [mode, setMode] = React.useState<'view' | 'edit'>('view');
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  // Extract schedule data from classData
  const scheduleData: ScheduleFormData = {
    schedule: classData.schedule || [
      { dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00' },
    ],
  };

  // Initialize form
  const form = useScheduleTabForm(scheduleData);

  // Track unsaved changes
  React.useEffect(() => {
    if (mode !== 'edit') {
      setHasUnsavedChanges(false);
      onUnsavedChangesChange?.(false);
      return;
    }

    const subscription = form.watch((formData) => {
      // Compare with original data
      const hasChanges =
        JSON.stringify(formData.schedule || []) !== JSON.stringify(classData.schedule || []);

      setHasUnsavedChanges(hasChanges);
      onUnsavedChangesChange?.(hasChanges);
    });

    return () => subscription.unsubscribe();
  }, [form, mode, classData, onUnsavedChangesChange]);

  const handleEdit = useCallback(() => {
    setMode('edit');
    form.reset(scheduleData);
  }, [form, scheduleData]);

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        setMode('view');
        form.reset(scheduleData);
        setHasUnsavedChanges(false);
        onUnsavedChangesChange?.(false);
      }
    } else {
      setMode('view');
      form.reset(scheduleData);
    }
  }, [hasUnsavedChanges, form, scheduleData, onUnsavedChangesChange]);

  const handleSave = useCallback(async () => {
    // Validate form
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error('Please fix validation errors before saving');
      return;
    }

    setIsSaving(true);
    try {
      const formData = form.getValues();

      // Fetch latest class data to avoid overwriting concurrent changes
      const latestData = await classApiService.getClassById(classData.id);

      // Merge schedule data with existing class data
      const merged = {
        name: latestData.name,
        subjectId: latestData.subjectId,
        teacherId: latestData.teacherId,
        classroomId: latestData.classroomId,
        description: latestData.description,
        requirements: latestData.requirements,
        objectives: latestData.objectives,
        materials: latestData.materials,
        schedule: formData.schedule,
        studentIds: latestData.studentIds,
      };

      // Update class
      await classApiService.updateClass(classData.id, merged);

      toast.success('Schedule updated successfully');
      setMode('view');
      setHasUnsavedChanges(false);
      onUnsavedChangesChange?.(false);

      // Refresh parent data
      await onUpdate();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update schedule');
    } finally {
      setIsSaving(false);
    }
  }, [form, classData, onUpdate, onUnsavedChangesChange]);

  // Helper functions for schedule management
  const addScheduleSlot = () => {
    const currentSchedule = form.getValues('schedule') || [];
    form.setValue('schedule', [
      ...currentSchedule,
      { dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00' },
    ]);
  };

  const removeScheduleSlot = (index: number) => {
    const currentSchedule = form.getValues('schedule') || [];
    form.setValue(
      'schedule',
      currentSchedule.filter((_, i) => i !== index)
    );
  };

  const hasScheduleConflict = (currentIndex: number, schedule: any[]) => {
    if (!schedule || schedule.length <= 1) return false;

    const currentSlot = schedule[currentIndex];
    if (!currentSlot?.dayOfWeek || !currentSlot?.startTime || !currentSlot?.endTime)
      return false;

    return schedule.some((slot, index) => {
      if (index === currentIndex) return false;
      if (slot.dayOfWeek !== currentSlot.dayOfWeek) return false;

      // Check for time overlap
      return currentSlot.startTime < slot.endTime && slot.startTime < currentSlot.endTime;
    });
  };

  if (mode === 'view') {
    return (
      <div className="space-y-6">
        <ClassScheduleSection
          mode="view"
          classData={classData}
          onEdit={handleEdit}
        />
      </div>
    );
  }

  // Edit mode
  const schedule = form.watch('schedule') || [];

  return (
    <FormProvider {...form}>
      <div className="space-y-6">
        <GlassCard className="p-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Edit Schedule
              </h3>
              <p className="text-white/60 text-sm">
                Update the class schedule
              </p>
            </div>
            <TabEditControls
              mode="edit"
              hasUnsavedChanges={hasUnsavedChanges}
              isSaving={isSaving}
              onEdit={handleEdit}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>

          {/* Schedule Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Schedule
              </h3>
              <Button
                type="button"
                variant="ghost"
                onClick={addScheduleSlot}
                className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Time Slot
              </Button>
            </div>

            {/* Schedule validation error */}
            {form.formState.errors.schedule?.message && (
              <div className="text-red-400 text-sm p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                {form.formState.errors.schedule.message}
              </div>
            )}

            <div className="space-y-3">
              {schedule.map((_, index) => {
                const hasConflict = hasScheduleConflict(index, schedule);
                return (
                  <div
                    key={index}
                    className={`grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-lg border ${
                      hasConflict
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <FormField
                      control={form.control}
                      name={`schedule.${index}.dayOfWeek`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/70">Day</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Monday">Monday</SelectItem>
                                <SelectItem value="Tuesday">Tuesday</SelectItem>
                                <SelectItem value="Wednesday">Wednesday</SelectItem>
                                <SelectItem value="Thursday">Thursday</SelectItem>
                                <SelectItem value="Friday">Friday</SelectItem>
                                <SelectItem value="Saturday">Saturday</SelectItem>
                                <SelectItem value="Sunday">Sunday</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`schedule.${index}.startTime`}
                      render={({ field }) => (
                        <FormItem>
                          <NativeTimeInput
                            label="Start Time"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select start time"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`schedule.${index}.endTime`}
                      render={({ field }) => (
                        <FormItem>
                          <NativeTimeInput
                            label="End Time"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select end time"
                            min={form.watch(`schedule.${index}.startTime`)}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div style={{ paddingTop: '32px' }}>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeScheduleSlot(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full"
                        disabled={schedule.length === 1}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>

                    {/* Conflict warning */}
                    {hasConflict && (
                      <div className="col-span-full mt-2 text-red-400 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                        This schedule conflicts with another slot on the same day
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {schedule.length === 0 && (
              <div className="text-center py-8 text-white/60">
                <Clock className="w-12 h-12 mx-auto mb-4 text-white/40" />
                <p>No schedule slots added yet.</p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={addScheduleSlot}
                  className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Time Slot
                </Button>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </FormProvider>
  );
};

export default ClassScheduleTab;
