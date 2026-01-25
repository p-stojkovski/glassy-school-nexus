import { z } from 'zod';

export const subjectSchema = z.object({
  key: z.string()
    .min(1, 'Key is required')
    .max(20, 'Key must be 20 characters or less')
    .regex(/^[A-Z0-9_]+$/, 'Key must be uppercase letters, numbers, and underscores only'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  sortOrder: z.coerce.number()
    .int('Sort order must be a whole number')
    .min(0, 'Sort order must be 0 or greater'),
});

export type SubjectFormData = z.infer<typeof subjectSchema>;
