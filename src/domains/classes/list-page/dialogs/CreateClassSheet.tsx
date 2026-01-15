import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, Calendar, AlertTriangle } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormSheet } from '@/components/common/sheets';
import SubjectsDropdown from '@/components/common/SubjectsDropdown';
import TeachersDropdown from '@/components/common/TeachersDropdown';
import ClassroomsDropdown from '@/components/common/ClassroomsDropdown';
import { classApiService } from '@/services/classApiService';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import { useTeachers } from '@/hooks/useTeachers';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { CreateClassRequest } from '@/types/api/class';
import { toast } from 'sonner';

// Validation schema for quick create - only essential fields
const quickCreateSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(100, 'Class name must be 100 characters or less'),
  subjectId: z.string().min(1, 'Subject is required'),
  teacherId: z.string().min(1, 'Teacher is required'),
  classroomId: z.string().min(1, 'Classroom is required'),
});

type QuickCreateFormData = z.infer<typeof quickCreateSchema>;

interface CreateClassSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (classId: string) => void;
}

export function CreateClassSheet({
  open,
  onOpenChange,
  onSuccess,
}: CreateClassSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSetTeacherDefault, setHasSetTeacherDefault] = useState(false);
  const user = useAppSelector((state: RootState) => state.auth.user);
  const { teachers } = useTeachers();
  const { years, isLoading: isLoadingYears } = useAcademicYears();

  // Find the active academic year
  const activeYear = useMemo(() => years.find(y => y.isActive), [years]);
  const hasActiveYear = !!activeYear;

  const form = useForm<QuickCreateFormData>({
    resolver: zodResolver(quickCreateSchema),
    defaultValues: {
      name: '',
      subjectId: '',
      teacherId: '',
      classroomId: '',
    },
  });

  // Reset form when sheet opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: '',
        subjectId: '',
        teacherId: '',
        classroomId: '',
      });
    }
  }, [open, form]);

  // Set teacher default if user is a teacher
  useEffect(() => {
    if (open && !hasSetTeacherDefault && user && teachers.length > 0) {
      const userRole = user.role?.toLowerCase();
      if (userRole === 'teacher') {
        // Match by email since User ID !== Teacher ID
        const matchingTeacher = teachers.find(
          teacher => teacher.email.toLowerCase() === user.email.toLowerCase()
        );

        if (matchingTeacher) {
          form.setValue('teacherId', matchingTeacher.id);
          setHasSetTeacherDefault(true);
        }
      }
    }

    // Reset flag when sidebar closes
    if (!open) {
      setHasSetTeacherDefault(false);
    }
  }, [open, user, teachers, form, hasSetTeacherDefault]);

  const handleSubmit = async (data: QuickCreateFormData) => {
    setIsSubmitting(true);

    try {
      const request: CreateClassRequest = {
        name: data.name,
        subjectId: data.subjectId,
        teacherId: data.teacherId,
        classroomId: data.classroomId,
        // No schedule - user will add it after creation
      };

      const response = await classApiService.createClass(request);

      toast.success('Class created! Now add a schedule to start generating lessons.');
      onOpenChange(false);
      onSuccess(response.id);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create class';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      intent="primary"
      size="sm"
      icon={GraduationCap}
      title="Create New Class"
      description="Create your class with the essentials below. You'll add the schedule and students immediately after."
      confirmText={isSubmitting ? 'Adding...' : 'Add Class'}
      cancelText="Cancel"
      onConfirm={form.handleSubmit(handleSubmit)}
      isLoading={isSubmitting}
      disabled={!hasActiveYear || isLoadingYears}
      isDirty={form.formState.isDirty}
    >
      {/* Academic Year Banner */}
      {!isLoadingYears && (
        hasActiveYear ? (
          <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-indigo-300">
              This class will be created for <span className="font-semibold">{activeYear.name}</span>
            </span>
          </div>
        ) : (
          <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300">
              No active academic year. Please configure an academic year before creating classes.
            </span>
          </div>
        )
      )}

      {/* Show blocking message if no active year */}
      {!isLoadingYears && !hasActiveYear ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-amber-500/20 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Academic Year Required</h3>
          <p className="text-white/60 max-w-xs">
            You need to set up an active academic year before you can create classes.
            Please go to Settings → Academic Calendar to configure your academic year.
          </p>
        </div>
      ) : (
        <Form {...form}>
          <form id="quick-create-class-form" className="space-y-4">
            {hasActiveYear && (
              <p className="text-white/60 text-sm mb-4">
                All fields are required.
              </p>
            )}

            {/* Class Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Class Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Beginner English A1"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-yellow-400 focus:ring-yellow-400"
                    />
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />

            {/* Subject Field */}
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Subject</FormLabel>
                  <FormControl>
                    <SubjectsDropdown
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select subject"
                      className="bg-white/5 border-white/20"
                    />
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />

            {/* Assigned Teacher Field */}
            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Assigned Teacher</FormLabel>
                  <FormControl>
                    <TeachersDropdown
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select teacher"
                      className="bg-white/5 border-white/20"
                      includeSubjectInfo={true}
                    />
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />

            {/* Assigned Classroom Field */}
            <FormField
              control={form.control}
              name="classroomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Assigned Classroom</FormLabel>
                  <FormControl>
                    <ClassroomsDropdown
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select classroom"
                      className="bg-white/5 border-white/20"
                    />
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />
          </form>
        </Form>
      )}
    </FormSheet>
  );
}
