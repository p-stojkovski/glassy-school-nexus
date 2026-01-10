/**
 * Class Validation Helpers (Zod + helpers)
 * Matches backend API rules and app conventions
 */

import * as z from 'zod';
import {
  ClassValidationRules as R,
  ScheduleSlotDto,
  CreateClassRequest,
  UpdateClassRequest,
} from '@/types/api/class';

export interface ClassFormData {
  name: string;
  subjectId: string;
  teacherId: string;
  classroomId: string;
  description?: string | null;
  requirements?: string | null;
  objectives?: string[] | null;
  materials?: string[] | null;
  schedule: ScheduleSlotDto[];
  studentIds?: string[] | null;
}

export interface ClassFormErrors {
  name?: string;
  subjectId?: string;
  teacherId?: string;
  classroomId?: string;
  description?: string;
  requirements?: string;
  objectives?: string;
  materials?: string;
  schedule?: string;
  studentIds?: string;
}

// Slot schema
const scheduleSlotSchema = z.object({
  dayOfWeek: z.enum(R.ALLOWED_DAYS, { required_error: 'Day of week is required.' }),
  startTime: z.string().regex(R.TIME_24H.PATTERN, R.TIME_24H.ERROR_MESSAGE),
  endTime: z.string().regex(R.TIME_24H.PATTERN, R.TIME_24H.ERROR_MESSAGE),
}).refine((slot) => {
  // Compare HH:mm strings by converting to minutes
  const [sh, sm] = slot.startTime.split(':').map(Number);
  const [eh, em] = slot.endTime.split(':').map(Number);
  return eh * 60 + em > sh * 60 + sm;
}, { message: 'End time must be after start time.', path: ['endTime'] });

// GUID schema
const guid = z.string().regex(R.GUID.PATTERN, R.GUID.ERROR_MESSAGE);

// Main schema
export const createClassSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(R.NAME.MAX_LENGTH, `Name must not exceed ${R.NAME.MAX_LENGTH} characters.`),
  subjectId: guid,
  teacherId: guid,
  classroomId: guid,
  description: z.string()
    .max(R.DESCRIPTION.MAX_LENGTH, `Description must not exceed ${R.DESCRIPTION.MAX_LENGTH} characters.`)
    .optional()
    .nullable(),
  requirements: z.string()
    .max(R.REQUIREMENTS.MAX_LENGTH, `Requirements must not exceed ${R.REQUIREMENTS.MAX_LENGTH} characters.`)
    .optional()
    .nullable(),
  objectives: z.array(
    z.string().max(R.OBJECTIVES.MAX_LENGTH, `Each objective must not exceed ${R.OBJECTIVES.MAX_LENGTH} characters.`)
  )
    .max(R.OBJECTIVES.MAX_COUNT, `Cannot have more than ${R.OBJECTIVES.MAX_COUNT} objectives.`)
    .optional()
    .nullable(),
  materials: z.array(
    z.string().max(R.MATERIALS.MAX_LENGTH, `Each material must not exceed ${R.MATERIALS.MAX_LENGTH} characters.`)
  )
    .max(R.MATERIALS.MAX_COUNT, `Cannot have more than ${R.MATERIALS.MAX_COUNT} materials.`)
    .optional()
    .nullable(),
  schedule: z.array(scheduleSlotSchema)
    .min(1, 'At least one schedule slot is required.')
    .max(R.SCHEDULE.MAX_SLOTS, `Cannot have more than ${R.SCHEDULE.MAX_SLOTS} schedule slots.`),
  studentIds: z.array(guid).optional().nullable(),
});

export const updateClassSchema = createClassSchema; // same rules

// Types from schema
export type CreateClassFormData = z.infer<typeof createClassSchema>;
export type UpdateClassFormData = z.infer<typeof updateClassSchema>;

// Sanitization
export const sanitizeClassData = <T extends Partial<ClassFormData>>(data: T): T => {
  return {
    ...data,
    name: data.name?.trim() || '',
    subjectId: data.subjectId?.trim() || '',
    teacherId: data.teacherId?.trim() || '',
    classroomId: data.classroomId?.trim() || '',
    description: data.description?.trim() || null,
    requirements: data.requirements?.trim() || null,
    objectives: Array.isArray(data.objectives) ? data.objectives.map((o) => o.trim()).filter(Boolean) || null : null,
    materials: Array.isArray(data.materials) ? data.materials.map((m) => m.trim()).filter(Boolean) || null : null,
    schedule: (data.schedule || []).map((s) => ({
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
    })),
    studentIds: data.studentIds?.filter(Boolean) || null,
  } as T;
};

// Request builders
export const createClassRequest = (data: Partial<ClassFormData>): CreateClassRequest => {
  const d = sanitizeClassData(data);
  return {
    name: d.name!,
    subjectId: d.subjectId!,
    teacherId: d.teacherId!,
    classroomId: d.classroomId!,
    description: d.description ?? null,
    requirements: d.requirements ?? null,
    objectives: d.objectives ?? null,
    materials: d.materials ?? null,
    schedule: d.schedule || [],
    studentIds: d.studentIds ?? null,
  };
};

export const createUpdateClassRequest = (data: ClassFormData): UpdateClassRequest => {
  const d = sanitizeClassData(data);
  return {
    name: d.name!,
    subjectId: d.subjectId!,
    teacherId: d.teacherId!,
    classroomId: d.classroomId!,
    description: d.description ?? null,
    requirements: d.requirements ?? null,
    objectives: d.objectives ?? null,
    materials: d.materials ?? null,
    schedule: d.schedule || [],
    studentIds: d.studentIds ?? null,
  };
};

// Validation orchestrator
export interface ValidationResult {
  isValid: boolean;
  errors: ClassFormErrors;
  data?: CreateClassRequest | UpdateClassRequest;
}

export const validateAndPrepareClassData = (
  data: Partial<ClassFormData>,
  isUpdate: boolean = false
): ValidationResult => {
  const sanitized = sanitizeClassData(data);
  const schema = isUpdate ? updateClassSchema : createClassSchema;
  const result = schema.safeParse(sanitized);

  if (!result.success) {
    const errors: ClassFormErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof ClassFormErrors;
      if (!errors[key]) errors[key] = issue.message;
    }
    return { isValid: false, errors };
  }

  const requestData = isUpdate
    ? createUpdateClassRequest(result.data as ClassFormData)
    : createClassRequest(result.data as Partial<ClassFormData>);

  return { isValid: true, errors: {}, data: requestData };
};

// ============================================================================
// SALARY RULE SCHEMAS (Phase 6.4 - Teacher Variable Salary)
// ============================================================================

/**
 * Schema for creating a new salary rule
 * Backend validation rules (CreateClassSalaryRuleValidationRules):
 * - MinStudents: >= 0
 * - RatePerLesson: > 0, max 2 decimal places
 * - EffectiveFrom: required, valid date
 * - EffectiveTo: optional, if provided must be >= EffectiveFrom
 */
export const createSalaryRuleSchema = z.object({
  minStudents: z.coerce
    .number({ required_error: 'Minimum students is required' })
    .int('Must be a whole number')
    .min(0, 'Must be 0 or greater'),
  ratePerLesson: z.coerce
    .number({ required_error: 'Rate per lesson is required' })
    .positive('Must be greater than 0')
    .refine(
      (val) => /^\d+(\.\d{1,2})?$/.test(val.toString()),
      'Maximum 2 decimal places allowed'
    ),
  effectiveFrom: z.string().min(1, 'Effective from date is required'),
  effectiveTo: z.string().optional().nullable(),
}).refine(
  (data) => {
    if (!data.effectiveTo) return true;
    return data.effectiveTo >= data.effectiveFrom;
  },
  {
    message: 'End date must be on or after start date',
    path: ['effectiveTo'],
  }
);

/**
 * Schema for updating an existing salary rule
 * Same validation as create
 */
export const updateSalaryRuleSchema = createSalaryRuleSchema;

// Types from schema
export type CreateSalaryRuleFormData = z.infer<typeof createSalaryRuleSchema>;
export type UpdateSalaryRuleFormData = z.infer<typeof updateSalaryRuleSchema>;
