import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Clock, Plus, Trash2, Users, Calendar, CheckCircle2 } from 'lucide-react';
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
import StudentSelectionTrigger from '@/components/common/StudentSelectionTrigger';
import StudentSelectionPanel from '@/components/common/StudentSelectionPanel';
import { NativeTimeInput } from '@/components/common';
import { ClassFormData } from '@/types/api/class';

interface ScheduleEnrollmentTabProps {
  form: UseFormReturn<ClassFormData>;
  students?: any[];
  classes?: any[];
}

const ScheduleEnrollmentTab: React.FC<ScheduleEnrollmentTabProps> = ({
  form,
  students = [],
  classes = [],
}) => {
  const [isStudentPanelOpen, setIsStudentPanelOpen] = useState(false);

  // Function to check for schedule conflicts
  const hasScheduleConflict = (currentIndex: number, schedule: any[]) => {
    if (!schedule || schedule.length <= 1) return false;
    
    const currentSlot = schedule[currentIndex];
    if (!currentSlot?.dayOfWeek || !currentSlot?.startTime || !currentSlot?.endTime) return false;
    
    return schedule.some((slot, index) => {
      if (index === currentIndex) return false;
      if (slot.dayOfWeek !== currentSlot.dayOfWeek) return false;
      
      // Check for time overlap
      return currentSlot.startTime < slot.endTime && slot.startTime < currentSlot.endTime;
    });
  };

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

  const schedule = form.watch('schedule') || [];
  const selectedStudentIds = form.watch('studentIds') || [];

  return (
    <div className="space-y-6">
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
                    <FormLabel className="text-white/70">
                      Day
                    </FormLabel>
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

              <div style={{paddingTop: "32px"}}>
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

      {/* Student Enrollment Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Student Enrollment
          </h3> 
        </div>

        <FormField
          control={form.control}
          name="studentIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Assign Students</FormLabel>
              <FormControl>
                <StudentSelectionTrigger
                  students={students}
                  selectedStudentIds={field.value || []}
                  onOpenPanel={() => setIsStudentPanelOpen(true)}
                  placeholder="Select students for this class..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Student Selection Panel */}
      <StudentSelectionPanel
        students={students}
        classes={classes}
        selectedStudentIds={form.watch('studentIds') || []}
        onSelectionChange={(studentIds) => {
          form.setValue('studentIds', studentIds, { 
            shouldDirty: true, 
            shouldTouch: true,
            shouldValidate: true 
          });
        }}
        isOpen={isStudentPanelOpen}
        onClose={() => setIsStudentPanelOpen(false)}
        title="Assign Students to Class"
        allowMultiple={true}
      />
    </div>
  );
};

export default ScheduleEnrollmentTab;

