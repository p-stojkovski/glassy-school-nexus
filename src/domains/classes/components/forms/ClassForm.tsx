
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock } from 'lucide-react';
import { Class } from '@/domains/classes/classesSlice';
import { ClassStatus } from '@/types/enums';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import StudentSelectionPanel from '@/components/common/StudentSelectionPanel';
import StudentSelectionTrigger from '@/components/common/StudentSelectionTrigger';

interface ClassFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ClassFormData) => void;
  editingClass?: Class | null;
}

export interface ClassFormData {
  name: string;
  subject: string;
  teacherId: string;
  classroomId: string;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  studentIds: string[];
  status: ClassStatus;
}

const ClassForm: React.FC<ClassFormProps> = ({ open, onOpenChange, onSubmit, editingClass }) => {
  const { teachers } = useAppSelector((state: RootState) => state.teachers);
  const { students } = useAppSelector((state: RootState) => state.students);
  const { classes } = useAppSelector((state: RootState) => state.classes);
  const { classrooms } = useAppSelector((state: RootState) => state.classrooms);
  const [isStudentPanelOpen, setIsStudentPanelOpen] = useState(false);
  const form = useForm<ClassFormData>({
    defaultValues: editingClass ? {
      name: editingClass.name,
      subject: editingClass.teacher.name.split(' ')[1] || 'English', // Extract subject from teacher name for now
      teacherId: editingClass.teacher.id,
      classroomId: editingClass.room.replace('Room ', ''),
      schedule: editingClass.schedule,
      studentIds: editingClass.studentIds || [],
      status: editingClass.status,
    } : {
      name: '',
      subject: '',
      teacherId: '',
      classroomId: '',
      schedule: [{ day: 'Monday', startTime: '09:00', endTime: '10:30' }],
      studentIds: [],
      status: ClassStatus.Active,
    }
  });

  const handleSubmit = (data: ClassFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  const addScheduleSlot = () => {
    const currentSchedule = form.getValues('schedule');
    form.setValue('schedule', [...currentSchedule, { day: 'Monday', startTime: '09:00', endTime: '10:30' }]);
  };

  const removeScheduleSlot = (index: number) => {
    const currentSchedule = form.getValues('schedule');
    form.setValue('schedule', currentSchedule.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {editingClass ? 'Edit Class' : 'Create New Class'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Class name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Class Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter class name"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                rules={{ required: "Subject is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Subject</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Chemistry">Chemistry</SelectItem>
                          <SelectItem value="Biology">Biology</SelectItem>
                          <SelectItem value="History">History</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="teacherId"
                rules={{ required: "Teacher is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Assigned Teacher</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select teacher" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="classroomId"
                rules={{ required: "Classroom is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Assigned Classroom</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select classroom" />
                        </SelectTrigger>
                        <SelectContent>
                          {classrooms.map((classroom) => (
                            <SelectItem key={classroom.id} value={classroom.id}>
                              {classroom.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel className="text-white mb-4 block">Schedule</FormLabel>
              {form.watch('schedule').map((_, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-white/5 rounded-lg">
                  <FormField
                    control={form.control}
                    name={`schedule.${index}.day`}
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
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`schedule.${index}.startTime`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70">Start Time</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="time"
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`schedule.${index}.endTime`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70">End Time</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="time"
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeScheduleSlot(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      disabled={form.watch('schedule').length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="ghost"
                onClick={addScheduleSlot}
                className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
              >
                <Clock className="w-4 h-4 mr-2" />
                Add Schedule Slot
              </Button>
            </div>            <div>
              <FormLabel className="text-white mb-4 block">Assign Students</FormLabel>              <FormField
                control={form.control}
                name="studentIds"
                render={({ field }) => (
                  <FormItem>
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

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                {editingClass ? 'Update Class' : 'Create Class'}
              </Button>
            </div>
          </form>        </Form>
      </DialogContent>
      
      {/* Student Selection Panel - render outside dialog to avoid z-index issues */}
      {open && (
        <StudentSelectionPanel
          students={students}
          classes={classes}
          selectedStudentIds={form.watch('studentIds') || []}
          onSelectionChange={(studentIds) => {
            form.setValue('studentIds', studentIds);
          }}
          isOpen={isStudentPanelOpen}
          onClose={() => setIsStudentPanelOpen(false)}
          title="Assign Students to Class"
          allowMultiple={true}
        />
      )}
    </Dialog>
  );
};

export default ClassForm;
