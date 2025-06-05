
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Checkbox } from '../ui/checkbox';
import { Clock, Search } from 'lucide-react';
import { Class } from '../../store/slices/classesSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Student } from '../../store/slices/studentsSlice';
import GlassCard from '../common/GlassCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

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
  const { teachers } = useSelector((state: RootState) => state.teachers);
  const { students } = useSelector((state: RootState) => state.students);
  const { classrooms } = useSelector((state: RootState) => state.classrooms);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  const form = useForm<ClassFormData>({
    defaultValues: editingClass ? {
      name: editingClass.name,
      subject: editingClass.teacher.subject,
      teacherId: editingClass.teacher.id,
      classroomId: editingClass.room.replace('Room ', ''),
      schedule: editingClass.schedule,
      studentIds: [],
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

  const addScheduleSlot = () => {
    const currentSchedule = form.getValues('schedule');
    form.setValue('schedule', [...currentSchedule, { day: 'Monday', startTime: '09:00', endTime: '10:30' }]);
  };

  const removeScheduleSlot = (index: number) => {
    const currentSchedule = form.getValues('schedule');
    form.setValue('schedule', currentSchedule.filter((_, i) => i !== index));
  };

  // Filter students based on search term
  const filteredStudents = students.filter((student) => 
    student.name.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  // Toggle student selection
  const toggleStudent = (studentId: string) => {
    const currentIds = form.getValues('studentIds') || [];
    if (currentIds.includes(studentId)) {
      form.setValue('studentIds', currentIds.filter(id => id !== studentId));
    } else {
      form.setValue('studentIds', [...currentIds, studentId]);
    }
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
          </div>

          <div>
            <FormLabel className="text-white mb-4 block">Students</FormLabel>
            <div className="bg-white/5 p-4 rounded-lg space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <Input
                  placeholder="Search students by name..."
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>
              
              <div className="overflow-y-auto max-h-80">
                <Table className="text-white">
                  <TableHeader>
                    <TableRow className="hover:bg-white/5 border-white/20">
                      <TableHead className="text-white/70 w-10">Select</TableHead>
                      <TableHead className="text-white/70">Name</TableHead>
                      <TableHead className="text-white/70">Email</TableHead>
                      <TableHead className="text-white/70">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <TableRow 
                          key={student.id} 
                          className="hover:bg-white/5 border-white/10 cursor-pointer"
                          onClick={() => toggleStudent(student.id)}
                        >
                          <TableCell>
                            <Checkbox
                              checked={form.watch('studentIds')?.includes(student.id)}
                              onCheckedChange={() => toggleStudent(student.id)}
                              className="border-white/20"
                            />
                          </TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium 
                              ${student.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
                              {student.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-white/50">
                          No students found matching your search.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
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
            </Button>
          </div>
        </form>
      </Form>
    </GlassCard>
  );
};

export default ClassFormContent;
