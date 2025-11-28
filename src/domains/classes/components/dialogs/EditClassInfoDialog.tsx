import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { GraduationCap, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import SubjectsDropdown from '@/components/common/SubjectsDropdown';
import TeachersDropdown from '@/components/common/TeachersDropdown';
import ClassroomsDropdown from '@/components/common/ClassroomsDropdown';
import { ClassResponse } from '@/types/api/class';
import { classApiService } from '@/services/classApiService';
import { toast } from 'sonner';

interface EditClassInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: ClassResponse;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  subjectId: string;
  teacherId: string;
  classroomId: string;
}

export function EditClassInfoDialog({
  open,
  onOpenChange,
  classData,
  onSuccess,
}: EditClassInfoDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      subjectId: '',
      teacherId: '',
      classroomId: '',
    },
  });

  // Reset form when dialog opens or classData changes
  useEffect(() => {
    if (open && classData) {
      form.reset({
        name: classData.name || '',
        subjectId: classData.subjectId || '',
        teacherId: classData.teacherId || '',
        classroomId: classData.classroomId || '',
      });
    }
  }, [open, classData, form]);

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Fetch latest class data to avoid overwriting concurrent changes
      const latestData = await classApiService.getClassById(classData.id);

      // Merge with existing data (preserve schedule, students, additional details)
      const merged = {
        name: data.name,
        subjectId: data.subjectId,
        teacherId: data.teacherId,
        classroomId: data.classroomId,
        description: latestData.description || null,
        requirements: latestData.requirements || null,
        objectives: latestData.objectives || null,
        materials: latestData.materials || null,
        schedule: latestData.schedule,
        studentIds: latestData.studentIds,
      };

      await classApiService.updateClass(classData.id, merged);

      toast.success('Class information updated successfully');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update class information');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-yellow-400" />
            Edit Class Information
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Update the basic class details
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Class Name */}
            <FormField
              control={form.control}
              name="name"
              rules={{ required: 'Class name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Class Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter class name"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subject */}
            <FormField
              control={form.control}
              name="subjectId"
              rules={{ required: 'Subject is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Subject *</FormLabel>
                  <FormControl>
                    <SubjectsDropdown
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select subject"
                      className="bg-white/5 border-white/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Teacher */}
            <FormField
              control={form.control}
              name="teacherId"
              rules={{ required: 'Teacher is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Assigned Teacher *</FormLabel>
                  <FormControl>
                    <TeachersDropdown
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select teacher"
                      className="bg-white/5 border-white/20"
                      includeSubjectInfo={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Classroom */}
            <FormField
              control={form.control}
              name="classroomId"
              rules={{ required: 'Classroom is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Classroom *</FormLabel>
                  <FormControl>
                    <ClassroomsDropdown
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select classroom"
                      className="bg-white/5 border-white/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 font-semibold"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
