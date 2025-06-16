import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FormButtons from '@/components/common/FormButtons';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Teacher, addTeacher, updateTeacher } from '../teachersSlice';
import { TeacherStatus } from '@/types/enums';
import { toast } from '@/hooks/use-toast';
import { RootState } from '@/store';

// Email uniqueness validation helper
const createTeacherSchema = (
  existingTeachers: Teacher[],
  currentTeacherId?: string
) =>
  z.object({
    name: z
      .string()
      .min(1, 'Full name is required')
      .max(100, 'Name must be less than 100 characters')
      .regex(
        /^[a-zA-Z\s'-]+$/,
        'Name can only contain letters, spaces, apostrophes, and hyphens'
      ),
    email: z
      .string()
      .email('Please enter a valid email address')
      .toLowerCase()
      .refine(
        (email) => {
          // Check if email is unique (exclude current teacher when editing)
          const emailExists = existingTeachers.some(
            (teacher) =>
              teacher.email.toLowerCase() === email &&
              teacher.id !== currentTeacherId
          );
          return !emailExists;
        },
        {
          message:
            'This email address is already registered to another teacher',
        }
      ),
    phone: z
      .string()
      .optional()
      .refine(
        (phone) => {
          if (!phone || phone === '') return true;
          // Basic phone validation - accepts various formats
          const phoneRegex = /^[+]?[\d\s\-().]{7,15}$/;
          return phoneRegex.test(phone);
        },
        {
          message: 'Please enter a valid phone number',
        }
      ),
    subject: z.string().min(1, 'Subject is required'),
    status: z.enum([TeacherStatus.Active, TeacherStatus.Inactive]),
    notes: z.string().optional(),
  });

type TeacherFormData = z.infer<ReturnType<typeof createTeacherSchema>>;

interface TeacherFormProps {
  teacher?: Teacher | null;
  isOpen: boolean;
  onClose: () => void;
}

const TeacherForm: React.FC<TeacherFormProps> = ({
  teacher,
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { teachers } = useAppSelector((state: RootState) => state.teachers);
  const [isLoading, setIsLoading] = useState(false);

  // Create dynamic schema with email uniqueness validation
  const teacherSchema = createTeacherSchema(teachers, teacher?.id);

  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    mode: 'onBlur', // Validate on blur for better UX
    defaultValues: {
      name: teacher?.name || '',
      email: teacher?.email || '',
      phone: teacher?.phone || '',
      subject: teacher?.subject || '',
      status: teacher?.status || TeacherStatus.Active,
      notes: teacher?.notes || '',
    },
  });

  // Reset form when teacher prop changes
  useEffect(() => {
    if (teacher) {
      form.reset({
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone || '',
        subject: teacher.subject,
        status: teacher.status,
        notes: teacher.notes || '',
      });
    } else {
      form.reset({
        name: '',
        email: '',
        phone: '',
        subject: '',
        status: TeacherStatus.Active,
        notes: '',
      });
    }
  }, [teacher, form]);

  const handleSubmit = async (data: TeacherFormData) => {
    setIsLoading(true);
    try {
      // Additional validation before submission
      if (data.email) {
        data.email = data.email.toLowerCase().trim();
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (teacher) {
        // Update existing teacher
        const updatedTeacher: Teacher = {
          ...teacher,
          name: data.name.trim(),
          email: data.email,
          phone: data.phone?.trim() || '',
          subject: data.subject,
          status: data.status,
          notes: data.notes?.trim() || '',
        };
        dispatch(updateTeacher(updatedTeacher));
        toast({
          title: 'Teacher Updated Successfully',
          description: `${data.name} has been successfully updated with the latest information.`,
        });
      } else {
        // Add new teacher
        const newTeacher: Teacher = {
          id: `teacher-${Date.now()}`,
          name: data.name.trim(),
          email: data.email,
          phone: data.phone?.trim() || '',
          subject: data.subject,
          status: data.status,
          joinDate: new Date().toISOString(),
          classIds: [],
          notes: data.notes?.trim() || '',
        };
        dispatch(addTeacher(newTeacher));
        toast({
          title: 'Teacher Added Successfully',
          description: `${data.name} has been successfully added to the system.`,
        });
      }

      // Reset form and close
      form.reset();
      onClose();
    } catch (error) {
      console.error('Teacher form submission error:', error);
      toast({
        title: 'Submission Failed',
        description:
          'Unable to save teacher information. Please check your data and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form close
  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto"
      >
        <SheetHeader className="pb-6 border-b border-white/20">
          <SheetTitle className="text-2xl font-bold text-white">
            {teacher ? 'Edit Teacher' : 'Add New Teacher'}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {' '}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">
                      Full Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter full name"
                        {...field}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-amber-600 focus:ring-amber-600"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">
                      Email Address *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        {...field}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-amber-600 focus:ring-amber-600"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter phone number"
                        {...field}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-amber-600 focus:ring-amber-600"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">
                      Subject *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-yellow-400 focus:ring-yellow-400">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 border-white/20">
                        <SelectItem
                          value="Grammar & Writing"
                          className="text-white hover:bg-white/10"
                        >
                          Grammar & Writing
                        </SelectItem>
                        <SelectItem
                          value="Conversation & Speaking"
                          className="text-white hover:bg-white/10"
                        >
                          Conversation & Speaking
                        </SelectItem>
                        <SelectItem
                          value="Reading & Comprehension"
                          className="text-white hover:bg-white/10"
                        >
                          Reading & Comprehension
                        </SelectItem>
                        <SelectItem
                          value="Listening & Pronunciation"
                          className="text-white hover:bg-white/10"
                        >
                          Listening & Pronunciation
                        </SelectItem>
                        <SelectItem
                          value="Business English"
                          className="text-white hover:bg-white/10"
                        >
                          Business English
                        </SelectItem>
                        <SelectItem
                          value="IELTS Preparation"
                          className="text-white hover:bg-white/10"
                        >
                          IELTS Preparation
                        </SelectItem>
                        <SelectItem
                          value="TOEFL Preparation"
                          className="text-white hover:bg-white/10"
                        >
                          TOEFL Preparation
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">
                      Employment Status *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-yellow-400 focus:ring-yellow-400">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 border-white/20">
                        <SelectItem
                          value="active"
                          className="text-white hover:bg-white/10"
                        >
                          Active
                        </SelectItem>
                        <SelectItem
                          value="inactive"
                          className="text-white hover:bg-white/10"
                        >
                          Inactive
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">
                      Additional Notes
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any additional notes..."
                        {...field}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400 min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
              <FormButtons
                submitText={teacher ? 'Update Teacher' : 'Add Teacher'}
                isLoading={isLoading}
                onCancel={handleClose}
              />
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TeacherForm;
