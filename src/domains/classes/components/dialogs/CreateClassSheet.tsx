import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, Sparkles, ArrowRight } from 'lucide-react';
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
import GlassCard from '@/components/common/GlassCard';
import { classApiService } from '@/services/classApiService';
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-5 border-b border-white/10">
            <SheetTitle className="flex items-center gap-3 text-white text-xl font-semibold">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <GraduationCap className="w-6 h-6 text-yellow-400" />
              </div>
              Create New Class
            </SheetTitle>
            <SheetDescription className="text-white/70 mt-2">
              Start with the essentials. You'll add the schedule and students next.
            </SheetDescription>
          </SheetHeader>

          {/* Form Content */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              <Form {...form}>
                <form id="quick-create-class-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  
                  {/* Essential Information Card */}
                  <GlassCard className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <h3 className="text-sm font-semibold text-white/90">Class Information</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Class Name */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Class Name *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g., Beginner English A1"
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-yellow-500/50"
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
                    </div>
                  </GlassCard>

                  {/* What's Next Info */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-300 mb-2">What happens next?</h4>
                    <ul className="text-sm text-white/70 space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">&bull;</span>
                        Your class will be created immediately
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">&bull;</span>
                        Add a weekly schedule to generate lessons
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">&bull;</span>
                        Enroll students and add learning materials
                      </li>
                    </ul>
                  </div>
                </form>
              </Form>
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="p-4 border-t border-white/10 bg-white/5">
            <div className="flex gap-3">
              <Button
                type="submit"
                form="quick-create-class-form"
                disabled={isSubmitting}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold gap-2"
              >
                {isSubmitting ? (
                  'Creating...'
                ) : (
                  <>
                    Create & Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="text-white/70 hover:text-white hover:bg-white/10"
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

