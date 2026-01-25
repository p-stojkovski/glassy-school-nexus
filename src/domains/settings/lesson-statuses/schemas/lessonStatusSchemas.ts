import { z } from 'zod';

export const lessonStatusSchema = z.object({
  description: z.string()
    .max(500, 'Description must be 500 characters or less'),
});

export type LessonStatusFormData = z.infer<typeof lessonStatusSchema>;
