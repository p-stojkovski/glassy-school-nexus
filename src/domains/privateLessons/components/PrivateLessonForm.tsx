import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import FormButtons from '@/components/common/FormButtons';
import { PrivateLesson } from '../privateLessonsSlice';
import { PrivateLessonFormData } from '../hooks/usePrivateLessonsManagement';
import { Student } from '@/domains/students/studentsSlice';
import { Teacher } from '@/domains/teachers/teachersSlice';
import { Classroom } from '@/domains/classrooms/classroomsSlice';

// Validation schema
const privateLessonSchema = z
  .object({
    studentId: z.string().min(1, 'Student is required'),
    teacherId: z.string().min(1, 'Teacher is required'),
    subject: z.string().min(1, 'Subject is required'),
    date: z.string().min(1, 'Date is required'),
    startTime: z
      .string()
      .min(1, 'Start time is required')
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    endTime: z
      .string()
      .min(1, 'End time is required')
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    classroomId: z.string().min(1, 'Classroom is required'),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(`2000-01-01T${data.startTime}`);
      const end = new Date(`2000-01-01T${data.endTime}`);
      return end > start;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  );

interface PrivateLessonFormProps {
  lesson?: PrivateLesson | null;
  students: Student[];
  teachers: Teacher[];
  classrooms: Classroom[];
  onSubmit: (data: PrivateLessonFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PrivateLessonForm: React.FC<PrivateLessonFormProps> = ({
  lesson,
  students,
  teachers,
  classrooms,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const isEditing = !!lesson;

  // Get tomorrow's date in YYYY-MM-DD format
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const form = useForm<PrivateLessonFormData>({
    resolver: zodResolver(privateLessonSchema),
    defaultValues: {
      studentId: lesson?.studentId || '',
      teacherId: lesson?.teacherId || '',
      subject: lesson?.subject || '',
      date: lesson?.date || getTomorrowDate(),
      startTime: lesson?.startTime || '12:00',
      endTime: lesson?.endTime || '13:00',
      classroomId: lesson?.classroomId || '',
      notes: lesson?.notes || '',
    },
  });

  const handleSubmit = (data: PrivateLessonFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* Student Selection */}
          <FormField
            control={form.control}
            name="studentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Student</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Teacher Selection */}
          <FormField
            control={form.control}
            name="teacherId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Teacher</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Subject */}
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Subject</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter subject"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Date</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="date"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Time Row */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Start Time</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="time"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">End Time</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="time"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Classroom Selection */}
          <FormField
            control={form.control}
            name="classroomId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Classroom</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select a classroom" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {classrooms.map((classroom) => (
                      <SelectItem key={classroom.id} value={classroom.id}>
                        {classroom.name} - {classroom.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Notes</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Optional notes"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 min-h-[80px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormButtons
          submitText={isEditing ? 'Update Lesson' : 'Schedule Lesson'}
          isLoading={isLoading}
          onCancel={onCancel}
        />
      </form>
    </Form>
  );
};

export default PrivateLessonForm;
