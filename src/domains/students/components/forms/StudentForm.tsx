
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { StudentStatus } from '@/types/enums';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Student } from '@/domains/students/studentsSlice';

const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().optional(),
  status: z.enum([StudentStatus.Active, StudentStatus.Inactive]),
  parentContact: z.string().optional(),
  notes: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  student?: Student | null;
  onSubmit: (data: StudentFormData) => void;
  onCancel: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ student, onSubmit, onCancel }) => {
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: student?.name || '',
      email: student?.email || '',
      phone: student?.phone || '',
      status: student?.status || StudentStatus.Active,
      parentContact: student?.parentContact || '',
      notes: '',
    },
  });

  const handleSubmit = (data: StudentFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-semibold">Full Name *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter student's full name"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-semibold">Email Address</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="Enter email address"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-semibold">Phone Number</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter phone number"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-semibold">Enrollment Status *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-yellow-400 focus:ring-yellow-400">
                    <SelectValue placeholder="Select enrollment status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />        <FormField
          control={form.control}
          name="parentContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-semibold">Parent/Guardian Contact</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Parent name and phone number"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-semibold">Additional Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Any additional information about the student"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400 min-h-[100px] resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 pt-6 border-t border-white/20">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="flex-1 text-white/70 hover:text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
          >
            {student ? 'Update Student' : 'Add Student'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default StudentForm;
