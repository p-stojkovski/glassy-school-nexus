import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Overview tab contains: name, subjectId, teacherId, classroomId, description, requirements, objectives, materials
export interface OverviewFormData {
  name: string;
  subjectId: string;
  teacherId: string;
  classroomId: string;
  description?: string;
  requirements?: string;
  objectives?: string[] | null;
  materials?: string[] | null;
}

// Validation schema for Overview tab fields
const overviewSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(100, 'Class name must be 100 characters or less'),
  subjectId: z.string().min(1, 'Subject is required'),
  teacherId: z.string().min(1, 'Teacher is required'),
  classroomId: z.string().min(1, 'Classroom is required'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  requirements: z.string().optional(),
  objectives: z.array(z.string()).optional().nullable(),
  materials: z.array(z.string()).optional().nullable(),
});

export const useOverviewTabForm = (
  initialData: OverviewFormData
): UseFormReturn<OverviewFormData> => {
  const form = useForm<OverviewFormData>({
    resolver: zodResolver(overviewSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: initialData.name || '',
      subjectId: initialData.subjectId || '',
      teacherId: initialData.teacherId || '',
      classroomId: initialData.classroomId || '',
      description: initialData.description || '',
      requirements: initialData.requirements || '',
      objectives: initialData.objectives ?? [],
      materials: initialData.materials ?? [],
    },
  });

  return form;
};
