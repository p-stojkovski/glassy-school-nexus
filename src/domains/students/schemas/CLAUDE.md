# Students Domain - Schemas (schemas/)

> Zod validation schemas for student forms and data transformations.

**Parent:** [../CLAUDE.md](../CLAUDE.md)

## Directory Structure

```
schemas/
├── CLAUDE.md                           # This file
├── index.ts                            # Barrel exports
└── studentValidators.ts                # All validation schemas
```

## Main File: studentValidators.ts

Contains all Zod schemas for student validation, organized by purpose.

### Form Schema

The primary schema used for create/edit forms:

```typescript
export const studentFormSchema = z.object({
  // Personal Information
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters'),
  email: z.string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  phoneNumber: z.string()
    .regex(/^[\d\s\-+()]*$/, 'Invalid phone format')
    .optional(),
  dateOfBirth: z.string()
    .refine(val => !val || new Date(val) <= new Date(), 'Date cannot be in future')
    .optional(),
  schoolName: z.string().max(100).optional(),
  gradeLevel: z.string().max(50).optional(),

  // Guardian Information
  guardianName: z.string()
    .min(2, 'Guardian name must be at least 2 characters')
    .max(100, 'Guardian name cannot exceed 100 characters'),
  guardianRelationship: z.string().max(50).optional(),
  guardianPhone: z.string()
    .regex(/^[\d\s\-+()]*$/, 'Invalid phone format')
    .optional(),
  guardianEmail: z.string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  emergencyContact: z.string().max(200).optional(),

  // Financial Information
  discountTypeId: z.string().uuid().optional().nullable(),
  discountPercentage: z.number()
    .min(0, 'Discount cannot be negative')
    .max(100, 'Discount cannot exceed 100%')
    .optional(),
  paymentNotes: z.string().max(500).optional(),
});
```

### Derived Types

```typescript
// Infer TypeScript type from schema
export type StudentFormData = z.infer<typeof studentFormSchema>;

// Partial schema for section editing
export const studentInfoSectionSchema = studentFormSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  phoneNumber: true,
  dateOfBirth: true,
  schoolName: true,
  gradeLevel: true,
});

export const guardianSectionSchema = studentFormSchema.pick({
  guardianName: true,
  guardianRelationship: true,
  guardianPhone: true,
  guardianEmail: true,
  emergencyContact: true,
});

export const financialSectionSchema = studentFormSchema.pick({
  discountTypeId: true,
  discountPercentage: true,
  paymentNotes: true,
});
```

## Validation Helper

```typescript
/**
 * Validates and prepares student data for API submission.
 * Handles both create and update scenarios.
 */
export function validateAndPrepareStudentData(
  data: StudentFormData,
  isUpdate: boolean
): {
  isValid: boolean;
  data?: CreateStudentRequest | UpdateStudentRequest;
  errors: Record<string, string>;
} {
  const result = studentFormSchema.safeParse(data);

  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.errors.forEach((err) => {
      errors[err.path.join('.')] = err.message;
    });
    return { isValid: false, errors };
  }

  // Transform to API request format
  const apiData = transformToApiRequest(result.data, isUpdate);
  return { isValid: true, data: apiData, errors: {} };
}
```

## Backend Validation Sync

**Critical:** Zod schemas must match FluentValidation rules in backend.

| Field | Zod Rule | FluentValidation Rule |
|-------|----------|----------------------|
| `firstName` | `.min(2).max(50)` | `MinLength(2).MaxLength(50)` |
| `lastName` | `.min(2).max(50)` | `MinLength(2).MaxLength(50)` |
| `email` | `.email().optional()` | `EmailAddress().When(x => !string.IsNullOrEmpty(x.Email))` |
| `guardianName` | `.min(2).max(100)` | `MinLength(2).MaxLength(100)` |
| `discountPercentage` | `.min(0).max(100)` | `InclusiveBetween(0, 100)` |

Backend validation file: `think-english-api/src/Api/Features/Students/Shared/StudentValidationRules.cs`

## Usage in Components

### With react-hook-form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentFormSchema, StudentFormData } from '../schemas/studentValidators';

const form = useForm<StudentFormData>({
  resolver: zodResolver(studentFormSchema),
  defaultValues: {
    firstName: '',
    lastName: '',
    // ... other defaults
  },
});
```

### With Section Editing

```typescript
import { studentInfoSectionSchema } from '../schemas/studentValidators';

// Validate only personal info section
const result = studentInfoSectionSchema.safeParse(sectionData);
```

## Custom Refinements

For complex validation logic:

```typescript
// Example: Discount percentage required when discount type selected
export const studentFormSchemaWithRefinements = studentFormSchema.refine(
  (data) => {
    if (data.discountTypeId && !data.discountPercentage) {
      return false;
    }
    return true;
  },
  {
    message: 'Discount percentage required when discount type is selected',
    path: ['discountPercentage'],
  }
);
```

## Anti-Patterns

| Wrong | Correct |
|-------|---------|
| Inline Zod schemas in components | Import from `studentValidators.ts` |
| Different rules than backend | Sync with `StudentValidationRules.cs` |
| Skip validation on section save | Use section-specific schema |
| Ignore validation errors | Display all errors to user |
| Hardcode error messages | Use Zod's built-in messages |

## Verification

```bash
# Check for schema usage consistency
grep -r "zodResolver" --include="*.tsx" src/domains/students

# Ensure no inline z.object() in components
grep -r "z.object({" --include="*.tsx" src/domains/students
```

## Related Documentation

- **Domain Overview:** [../CLAUDE.md](../CLAUDE.md)
- **Form Page:** [../form-page/CLAUDE.md](../form-page/CLAUDE.md)
- **Backend Validation:** `think-english-api/src/Api/Features/Students/Shared/StudentValidationRules.cs`
- **API Types:** `types/api/student.ts`
