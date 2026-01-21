# Students Domain - Schemas (schemas/)

> Zod validation schemas for student forms and data transformations.

**Parent:** [../CLAUDE.md](../CLAUDE.md)

## Directory Structure

```
schemas/
├── CLAUDE.md                           # This file
├── index.ts                            # Barrel exports
└── studentValidators.ts                # Re-exports from centralized location
```

## Important: Centralized Validation

**Primary Location:** `think-english-ui/src/utils/validation/studentValidators.ts`

The `schemas/studentValidators.ts` file re-exports from the centralized location. This ensures:
- Single source of truth for validation rules
- Easy sync with backend FluentValidation
- Consistent validation across all forms

## Main Schemas

Exported from `utils/validation/studentValidators.ts`:

### Form Schema

The primary schema used for create/edit forms:

```typescript
export const createStudentSchema = z.object({
  // Personal Information
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .regex(namePattern, 'Invalid characters in name'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters')
    .regex(namePattern, 'Invalid characters in name'),
  email: z.string()
    .email('Invalid email format')
    .max(320)
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .regex(phonePattern, 'Invalid phone format')
    .max(20)
    .optional(),
  dateOfBirth: z.string()
    .refine(isPast, 'Date cannot be in future')
    .optional(),
  placeOfBirth: z.string().max(100).optional(),
  enrollmentDate: z.string()
    .refine(notFuture, 'Date cannot be in future'),
  isActive: z.boolean(),

  // Guardian Information
  parentContact: z.string().max(100).optional(),
  parentEmail: z.string()
    .email('Invalid email format')
    .max(320)
    .optional()
    .or(z.literal('')),

  // Financial Information
  hasDiscount: z.boolean(),
  discountTypeId: z.string().uuid().optional().nullable(),
  discountAmount: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});
```

### Derived Types

```typescript
// Infer TypeScript type from schema
export type CreateStudentFormData = z.infer<typeof createStudentSchema>;
export type UpdateStudentFormData = z.infer<typeof updateStudentSchema>;

// Partial schemas for section editing
export const personalInfoSchema = createStudentSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  dateOfBirth: true,
  placeOfBirth: true,
});

export const guardianInfoSchema = createStudentSchema.pick({
  parentContact: true,
  parentEmail: true,
});

export const financialInfoSchema = createStudentSchema.pick({
  hasDiscount: true,
  discountTypeId: true,
  discountAmount: true,
  notes: true,
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

| Field | Zod Rule | FluentValidation Rule | Match |
|-------|----------|----------------------|-------|
| `firstName` | `.min(2).max(50).regex(namePattern)` | `NotEmpty().MaxLength(50).Must(IsValidName)` | ✅ |
| `lastName` | `.min(2).max(50).regex(namePattern)` | `NotEmpty().MaxLength(50).Must(IsValidName)` | ✅ |
| `email` | `.email().max(320).optional()` | `EmailAddress().MaxLength(320).When(...)` | ✅ |
| `phone` | `.regex(phonePattern).max(20).optional()` | `MaxLength(20).Must(IsValidPhoneNumber).When(...)` | ✅ |
| `dateOfBirth` | `.refine(isPast).optional()` | `Must(IsValidDateOfBirth).When(...)` | ✅ |
| `enrollmentDate` | `.refine(notFuture)` | `Must(IsValidEnrollmentDate)` | ✅ |
| `notes` | `.max(500).optional()` | `MaxLength(500).When(...)` | ✅ |
| `discountTypeId` | `.uuid().optional()` | `Must(IsValidGuid).When(hasDiscount)` | ✅ |
| `parentContact` | `.max(100).optional()` | `MaxLength(100).When(...)` | ✅ |
| `parentEmail` | `.email().max(320).optional()` | `EmailAddress().MaxLength(320).When(...)` | ✅ |

**Validation Constants (from `StudentValidationRules.cs`):**
- `MaxFirstNameLength = 50`, `MaxLastNameLength = 50`
- `MaxEmailLength = 320`, `MaxPhoneLength = 20`
- `MaxNotesLength = 500`, `MaxParentContactLength = 100`
- `MaxPlaceOfBirthLength = 100`
- `MinPhoneDigits = 7`, `MaxPhoneDigits = 15`

Backend validation file: `think-english-api/src/Api/Features/Students/Shared/ValidationRules/StudentValidationRules.cs`

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
