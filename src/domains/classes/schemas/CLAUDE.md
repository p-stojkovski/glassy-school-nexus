# Classes Domain - Schemas (schemas/)

> Zod validation schemas for class forms and data validation.

**Parent:** [../CLAUDE.md](../CLAUDE.md)

## Directory Structure

```
schemas/
├── CLAUDE.md                           # This file
├── index.ts                            # Barrel exports
└── classValidators.ts                  # All Zod schemas and validators
```

## Schema Overview

### classFormSchema
Main form validation schema for create/edit operations.

```typescript
export const classFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),

  subjectId: z.string()
    .uuid('Invalid subject'),

  teacherId: z.string()
    .uuid('Invalid teacher')
    .optional(),

  classroomId: z.string()
    .uuid('Invalid classroom')
    .optional(),

  description: z.string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional(),

  requirements: z.string()
    .max(2000, 'Requirements cannot exceed 2000 characters')
    .optional(),

  objectives: z.array(z.string())
    .optional(),

  materials: z.array(z.string())
    .optional(),

  schedule: z.array(scheduleSlotSchema)
    .optional(),

  studentIds: z.array(z.string().uuid())
    .optional(),
});
```

### scheduleSlotSchema
Validation for individual schedule slots.

```typescript
export const scheduleSlotSchema = z.object({
  dayOfWeek: z.number()
    .min(0, 'Invalid day of week')
    .max(6, 'Invalid day of week'),

  startTime: z.string()
    .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),

  endTime: z.string()
    .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
}).refine(
  (data) => data.startTime < data.endTime,
  { message: 'End time must be after start time' }
);
```

## Validation Functions

### validateAndPrepareClassData
Validates form data and transforms it into API request format.

```typescript
export function validateAndPrepareClassData(
  data: ClassFormData,
  isUpdate: boolean
): ValidationResult<CreateClassRequest | UpdateClassRequest> {
  // 1. Validate with Zod schema
  const result = classFormSchema.safeParse(data);
  if (!result.success) {
    return {
      isValid: false,
      errors: formatZodErrors(result.error),
    };
  }

  // 2. Additional business rules
  const scheduleOverlaps = validateNoOverlaps(data.schedule || []);
  if (scheduleOverlaps.hasOverlaps) {
    return {
      isValid: false,
      errors: { schedule: 'Schedule has overlapping time slots' },
    };
  }

  // 3. Transform to API format
  return {
    isValid: true,
    data: transformToRequest(result.data, isUpdate),
  };
}
```

### validateNoOverlaps
Checks for overlapping schedule slots within the same day.

```typescript
export function validateNoOverlaps(slots: ScheduleSlot[]): OverlapValidation {
  const slotsByDay = groupBy(slots, 'dayOfWeek');
  const overlaps: OverlapInfo[] = [];

  for (const [day, daySlots] of Object.entries(slotsByDay)) {
    for (let i = 0; i < daySlots.length; i++) {
      for (let j = i + 1; j < daySlots.length; j++) {
        if (timesOverlap(daySlots[i], daySlots[j])) {
          overlaps.push({
            slot1: daySlots[i],
            slot2: daySlots[j],
            dayOfWeek: Number(day),
          });
        }
      }
    }
  }

  return {
    hasOverlaps: overlaps.length > 0,
    overlaps,
  };
}
```

## Type Exports

```typescript
// Inferred types from schemas
export type ClassFormData = z.infer<typeof classFormSchema>;
export type ScheduleSlotData = z.infer<typeof scheduleSlotSchema>;

// Validation result types
export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors?: Record<string, string>;
}

export interface OverlapValidation {
  hasOverlaps: boolean;
  overlaps: OverlapInfo[];
}

export interface OverlapInfo {
  slot1: ScheduleSlotData;
  slot2: ScheduleSlotData;
  dayOfWeek: number;
}
```

## Backend Alignment

Schemas must match FluentValidation rules in `ClassValidationRules.cs`:

| Frontend (Zod) | Backend (FluentValidation) |
|----------------|---------------------------|
| `name.min(2).max(100)` | `Name.MinLength(2).MaxLength(100)` |
| `subjectId.uuid()` | `SubjectId.NotEmpty()` |
| `description.max(1000)` | `Description.MaxLength(1000)` |
| `requirements.max(2000)` | `Requirements.MaxLength(2000)` |
| `scheduleSlot.startTime < endTime` | Custom validator |

**Sync Rule:** When backend validation changes, update frontend schemas to match.

## Usage in Forms

```typescript
// In form components
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { classFormSchema, ClassFormData } from '../schemas';

const form = useForm<ClassFormData>({
  resolver: zodResolver(classFormSchema),
  defaultValues: {
    name: '',
    subjectId: '',
    // ...
  },
});
```

## Usage in Hooks

```typescript
// In useClasses hook
import { validateAndPrepareClassData } from '../schemas';

const create = async (data: ClassFormData) => {
  const validation = validateAndPrepareClassData(data, false);
  if (!validation.isValid) {
    throw new Error(Object.values(validation.errors)[0]);
  }

  const request = validation.data as CreateClassRequest;
  return await createClass(request);
};
```

## Anti-Patterns

| Wrong | Correct |
|-------|---------|
| Duplicate validation in components | Use centralized schemas |
| Skip schedule overlap validation | Always use `validateNoOverlaps` |
| Different rules than backend | Keep Zod and FluentValidation in sync |
| Return raw Zod errors | Format with `formatZodErrors` |
| Validate in API service | Validate in hooks before API call |

## Related Documentation

- **Domain Overview:** [../CLAUDE.md](../CLAUDE.md)
- **Form Page:** [../form-page/CLAUDE.md](../form-page/CLAUDE.md)
- **Backend Validation:** `think-english-api/src/Api/Features/Classes/Shared/ClassValidationRules.cs`
