
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Class } from '../../store/slices/classesSlice';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '../../store';
import GlassCard from '../common/GlassCard';
import ScheduleForm from './ScheduleForm';
import StudentSelectionPanel from '../common/StudentSelectionPanel';
import StudentSelectionTrigger from '../common/StudentSelectionTrigger';

interface ClassFormContentProps {
  onSubmit: (data: ClassFormData) => void;
  onCancel: () => void;
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
  status: 'active' | 'inactive' | 'pending';
}

const ClassFormContent: React.FC<ClassFormContentProps> = ({ onSubmit, onCancel, editingClass }) => {
  const { teachers } = useAppSelector((state: RootState) => state.teachers);
  const { classrooms } = useAppSelector((state: RootState) => state.classrooms);
  const { students } = useAppSelector((state: RootState) => state.students);
  const [isStudentPanelOpen, setIsStudentPanelOpen] = useState(false);

  const form = useForm<ClassFormData>({
    defaultValues: editingClass ? {
      name: editingClass.name,
      subject: editingClass.teacher.subject,
      teacherId: editingClass.teacher.id,
      classroomId: editingClass.roomId || '',
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
      status: 'active',
    }
  });

  const handleSubmit = (data: ClassFormData) => {
    onSubmit(data);
  };

  return (
    <GlassCard className="p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                        <SelectItem value="German">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">            <FormField
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
                        {teachers.length > 0 ? (
                          teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.name}{' '}
                              <span className="text-sm text-white/60">
                                ({teacher.subject})
                              </span>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-teachers" disabled>
                            No teachers available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /><FormField
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
                        {classrooms.length > 0 ? (
                          classrooms.map((classroom) => (
                            <SelectItem key={classroom.id} value={classroom.id}>
                              {classroom.name}{' '}
                              <span className="text-sm text-white/60">
                                (Capacity: {classroom.capacity})
                              </span>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-classrooms" disabled>
                            No classrooms available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>              )}
            />          </div>

          {/* Student Assignment Section */}
          <div>            <FormField
              control={form.control}
              name="studentIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white mb-4 block">Assign Students</FormLabel>
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
          
          <ScheduleForm />
          
          <div className="flex justify-end items-center space-x-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              {editingClass ? 'Update Class' : 'Create Class'}
            </Button>          </div>
        </form>
      </Form>
      
      {/* Student Selection Panel */}
      <StudentSelectionPanel
        students={students}
        selectedStudentIds={form.watch('studentIds') || []}
        onSelectionChange={(studentIds) => {
          form.setValue('studentIds', studentIds);
        }}
        isOpen={isStudentPanelOpen}
        onClose={() => setIsStudentPanelOpen(false)}
        title="Assign Students to Class"
        allowMultiple={true}
      />
    </GlassCard>
  );
};

export default ClassFormContent;
