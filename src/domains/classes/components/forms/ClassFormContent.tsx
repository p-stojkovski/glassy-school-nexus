import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Circle, BookOpen, Calendar, FileText } from 'lucide-react';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import GlassCard from '@/components/common/GlassCard';
import FormButtons from '@/components/common/FormButtons';
import BasicClassInfoTab from './tabs/BasicClassInfoTab';
import ScheduleEnrollmentTab from './tabs/ScheduleEnrollmentTab';
import AdditionalDetailsTab from './tabs/AdditionalDetailsTab';
import { ClassFormData } from '@/types/api/class';
import { ClassResponse } from '@/types/api/class';

// Form validation schema
const classSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  teacherId: z.string().min(1, 'Teacher is required'),
  classroomId: z.string().min(1, 'Classroom is required'),
  description: z.string().optional(),
  requirements: z.string().optional(),
  objectives: z.string().optional(),
  materials: z.string().optional(),
  schedule: z.array(z.object({
    dayOfWeek: z.string(),
    startTime: z.string(),
    endTime: z.string(),
  })).optional(),
  studentIds: z.array(z.string()).optional(),
});

export interface ClassFormRef {
  submitForm: () => void;
  getFormData: () => ClassFormData;
}

interface ClassFormContentProps {
  classItem?: ClassResponse | null;
  teachers: any[];
  classrooms: any[];
  onSubmit: (data: ClassFormData) => Promise<void>;
  onCancel: () => void;
  onFormChange?: (data: ClassFormData) => void;
}

const TabbedClassFormContent = React.forwardRef<ClassFormRef, ClassFormContentProps>((
  {
    classItem,
    teachers,
    classrooms,
    onSubmit,
    onCancel,
    onFormChange,
  },
  ref
) => {
  const [activeTab, setActiveTab] = useState('basic-info');

  const form = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: classItem?.name || '',
      subjectId: classItem?.subjectId || '',
      teacherId: classItem?.teacherId || '',
      classroomId: classItem?.classroomId || '',
      description: classItem?.description || '',
      requirements: classItem?.requirements || '',
      objectives: classItem?.objectives || '',
      materials: classItem?.materials || '',
      schedule: classItem?.schedule || [{ dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00' }],
      studentIds: classItem?.studentIds || [],
    },
  });

  const {
    formState: { errors },
  } = form;

  // Watch form values for data indicators
  const watchedValues = form.watch();

  // Track form changes
  useEffect(() => {
    const subscription = form.watch((data) => {
      onFormChange?.(data as ClassFormData);
    });
    return () => subscription.unsubscribe();
  }, [form, onFormChange]);

  // Determine which tabs have errors for auto-navigation
  const basicTabErrors = useMemo(() => {
    return !!(
      errors.name ||
      errors.subjectId ||
      errors.teacherId ||
      errors.classroomId ||
      errors.description
    );
  }, [errors]);

  const scheduleTabErrors = useMemo(() => {
    return !!(errors.schedule || errors.studentIds);
  }, [errors]);

  const detailsTabErrors = useMemo(() => {
    return !!(
      errors.requirements ||
      errors.objectives ||
      errors.materials
    );
  }, [errors]);

  // Determine which tabs have data for visual indicators
  const basicTabHasData = useMemo(() => {
    return !!(
      watchedValues.name ||
      watchedValues.subjectId ||
      watchedValues.teacherId ||
      watchedValues.classroomId ||
      watchedValues.description
    );
  }, [
    watchedValues.name,
    watchedValues.subjectId,
    watchedValues.teacherId,
    watchedValues.classroomId,
    watchedValues.description,
  ]);

  const scheduleTabHasData = useMemo(() => {
    return !!(
      (watchedValues.schedule && watchedValues.schedule.length > 0) ||
      (watchedValues.studentIds && watchedValues.studentIds.length > 0)
    );
  }, [watchedValues.schedule, watchedValues.studentIds]);

  const detailsTabHasData = useMemo(() => {
    return !!(
      watchedValues.requirements ||
      watchedValues.objectives ||
      watchedValues.materials
    );
  }, [
    watchedValues.requirements,
    watchedValues.objectives,
    watchedValues.materials,
  ]);

  // Auto-navigate to tab with errors on form submission
  const handleSubmit = async (data: ClassFormData) => {
    const isValid = await form.trigger();

    if (!isValid) {
      if (basicTabErrors) {
        setActiveTab('basic-info');
      } else if (scheduleTabErrors) {
        setActiveTab('schedule-enrollment');
      } else if (detailsTabErrors) {
        setActiveTab('additional-details');
      }
      return;
    }

    try {
      await onSubmit(data);
    } catch (error: any) {
      console.error('Form submission error:', error);
    }
  };

  const TabIndicator: React.FC<{ hasErrors: boolean; hasData: boolean }> = ({ hasErrors, hasData }) => (
    <div className="flex items-center gap-1 ml-2">
      {hasErrors && <Circle className="h-2 w-2 fill-red-400 text-red-400" />}
      {!hasErrors && hasData && <Circle className="h-2 w-2 fill-yellow-400 text-yellow-400" />}
    </div>
  );

  // Expose form methods via ref
  React.useImperativeHandle(ref, () => ({
    submitForm: () => {
      form.handleSubmit(handleSubmit)();
    },
    getFormData: () => {
      return form.getValues();
    },
  }), [form, handleSubmit]);

  return (
    <GlassCard className="p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="bg-white/10 border-white/20">
              <TabsTrigger
                value="basic-info"
                className="data-[state=active]:bg-white/20 text-white"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Basic Information
                <TabIndicator hasErrors={basicTabErrors} hasData={basicTabHasData} />
              </TabsTrigger>
              <TabsTrigger
                value="schedule-enrollment"
                className="data-[state=active]:bg-white/20 text-white"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule & Enrollment
                <TabIndicator hasErrors={scheduleTabErrors} hasData={scheduleTabHasData} />
              </TabsTrigger>
              <TabsTrigger
                value="additional-details"
                className="data-[state=active]:bg-white/20 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Additional Details
                <TabIndicator hasErrors={detailsTabErrors} hasData={detailsTabHasData} />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic-info">
              <BasicClassInfoTab 
                form={form}
                teachers={teachers}
                classrooms={classrooms}
              />
            </TabsContent>

            <TabsContent value="schedule-enrollment">
              <ScheduleEnrollmentTab form={form} />
            </TabsContent>

            <TabsContent value="additional-details">
              <AdditionalDetailsTab form={form} />
            </TabsContent>
          </Tabs>

          <div className="pt-4">
            <FormButtons
              submitText={classItem ? 'Update Class' : 'Add Class'}
              onCancel={onCancel}
              disabled={!form.formState.isValid}
            />
          </div>
        </form>
      </Form>
    </GlassCard>
  );
});

TabbedClassFormContent.displayName = 'TabbedClassFormContent';

export default TabbedClassFormContent;
