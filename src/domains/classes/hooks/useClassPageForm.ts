import React from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ClassFormData, ClassResponse } from '@/types/api/class';

// Reuse the existing form validation schema
const classSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  teacherId: z.string().min(1, 'Teacher is required'),
  classroomId: z.string().min(1, 'Classroom is required'),
  description: z.string().optional(),
  requirements: z.string().optional(),
  objectives: z.array(z.string()).optional().nullable(),
  materials: z.array(z.string()).optional().nullable(),
  schedule: z.array(z.object({
    dayOfWeek: z.string(),
    startTime: z.string(),
    endTime: z.string(),
  })).optional().refine((schedules) => {
    if (!schedules || schedules.length === 0) return true;
    
    // Check for duplicate day/time combinations
    const scheduleKeys = schedules.map(s => `${s.dayOfWeek}-${s.startTime}-${s.endTime}`);
    const uniqueKeys = new Set(scheduleKeys);
    
    if (scheduleKeys.length !== uniqueKeys.size) {
      return false;
    }
    
    // Check for overlapping times on the same day
    const dayGroups = schedules.reduce((acc, schedule) => {
      if (!acc[schedule.dayOfWeek]) acc[schedule.dayOfWeek] = [];
      acc[schedule.dayOfWeek].push({
        start: schedule.startTime,
        end: schedule.endTime
      });
      return acc;
    }, {} as Record<string, {start: string, end: string}[]>);
    
    for (const day in dayGroups) {
      const daySchedules = dayGroups[day];
      for (let i = 0; i < daySchedules.length; i++) {
        for (let j = i + 1; j < daySchedules.length; j++) {
          const schedule1 = daySchedules[i];
          const schedule2 = daySchedules[j];
          
          // Check for time overlap
          if (schedule1.start < schedule2.end && schedule2.start < schedule1.end) {
            return false;
          }
        }
      }
    }
    
    return true;
  }, {
    message: "Schedule cannot have duplicate or overlapping time slots on the same day"
  }),
  studentIds: z.array(z.string()).optional(),
});

export const useClassPageForm = (
  classData: ClassResponse | null,
  onFormChange?: (data: ClassFormData) => void
): UseFormReturn<ClassFormData> => {
  const form = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: classData?.name || '',
      subjectId: classData?.subjectId || '',
      teacherId: classData?.teacherId || '',
      classroomId: classData?.classroomId || '',
      description: classData?.description || '',
      requirements: classData?.requirements || '',
      objectives: classData?.objectives ?? [],
      materials: classData?.materials ?? [],
      schedule: classData?.schedule || [{ dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00' }],
      studentIds: classData?.studentIds || [],
    },
  });

  // Track form changes if callback provided
  React.useEffect(() => {
    if (!onFormChange) return;
    
    const subscription = form.watch((data) => {
      onFormChange(data as ClassFormData);
    });
    
    return () => subscription.unsubscribe();
  }, [form, onFormChange]);

  return form;
};
