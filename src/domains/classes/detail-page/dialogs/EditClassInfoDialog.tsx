import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import SubjectsDropdown from '@/components/common/SubjectsDropdown';
import TeachersDropdown from '@/components/common/TeachersDropdown';
import ClassroomsDropdown from '@/components/common/ClassroomsDropdown';
import { ClassBasicInfoResponse } from '@/types/api/class';
import { classApiService } from '@/services/classApiService';
import { toast } from 'sonner';

interface EditClassInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: ClassBasicInfoResponse;
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
      // Use the dedicated basic info endpoint - no need to fetch/merge
      await classApiService.updateBasicInfo(classData.id, {
        name: data.name,
        subjectId: data.subjectId,
        teacherId: data.teacherId,
        classroomId: data.classroomId,
      });

      toast.success('Class information updated successfully');
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update class information';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 bg-white/10 backdrop-blur-md border border-white/20 text-white overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-4 py-4 border-b border-white/10">
            <SheetTitle className="flex items-center gap-2 text-white text-lg font-semibold">
              <GraduationCap className="w-5 h-5 text-yellow-400" />
              Edit Class Information
            </SheetTitle>
            <SheetDescription className="text-white/70">
              Update the basic class details
            </SheetDescription>
          </SheetHeader>

          {/* Form Content */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              <Form {...form}>
                <form id="edit-class-info-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
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
                            className="bg-white/5 border-white/10"
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
                            className="bg-white/5 border-white/10"
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
                            className="bg-white/5 border-white/10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="p-4 border-t border-white/10 bg-white/5">
            <div className="flex gap-3">
              <Button
                type="submit"
                form="edit-class-info-form"
                disabled={isSubmitting}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
