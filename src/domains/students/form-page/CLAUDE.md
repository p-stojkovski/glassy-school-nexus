# Students Domain - Form Page (form-page/)

> Create and edit student forms used in sheets and standalone pages.

**Parent:** [../CLAUDE.md](../CLAUDE.md)

## Directory Structure

```
form-page/
├── CLAUDE.md                           # This file
├── index.ts                            # Barrel exports
├── CreateStudentHeader.tsx             # Header for create page
├── forms/
│   ├── index.ts
│   ├── StudentForm.tsx                 # Base form component
│   ├── StudentFormContent.tsx          # Form fields layout
│   ├── TabbedStudentFormContent.tsx    # Main tabbed form
│   └── tabs/
│       ├── index.ts
│       ├── StudentInformationTab.tsx   # Personal details
│       ├── ParentGuardianTab.tsx       # Guardian info
│       └── FinancialInformationTab.tsx # Financial details
└── hooks/
    ├── index.ts
    ├── useStudentForm.ts               # Form state + validation
    └── useStudentFormPage.ts           # Page-level state
```

## Form Structure

### Three-Tab Layout

| Tab | Fields | Required Fields |
|-----|--------|-----------------|
| **Student Information** | First Name, Last Name, Email, Phone, DOB, School Name, Grade Level | First Name, Last Name |
| **Parent/Guardian** | Guardian Name, Relationship, Phone, Email, Emergency Contact | Guardian Name |
| **Financial Information** | Discount Type, Discount Percentage, Payment Notes | None |

### Field Validation

| Field | Rules |
|-------|-------|
| `firstName` | Required, 2-50 chars |
| `lastName` | Required, 2-50 chars |
| `email` | Optional, valid email format |
| `phoneNumber` | Optional, valid phone format |
| `dateOfBirth` | Optional, valid date, not in future |
| `guardianName` | Required, 2-100 chars |
| `guardianPhone` | Optional, valid phone format |
| `guardianEmail` | Optional, valid email format |
| `discountTypeId` | Optional, valid UUID |
| `discountPercentage` | Optional, 0-100 |

## Key Hooks

### useStudentForm

Manages form state, validation, and submission.

```typescript
const {
  form,                  // react-hook-form instance
  isSubmitting,          // Form submission in progress
  errors,                // Validation errors

  // Submission
  handleSubmit,          // Form submit handler
  resetForm,             // Reset to initial state

  // Discount types (loaded on mount)
  discountTypes,         // Available discount types
  loadingDiscountTypes,
} = useStudentForm({
  mode: 'create' | 'edit',
  initialData?: StudentResponse,
  onSuccess?: (student: StudentResponse) => void,
});
```

### useStudentFormPage

Page-level orchestration for standalone form pages.

```typescript
const {
  isLoading,             // Initial data loading
  student,               // Student data (edit mode)
  discountTypes,         // Available discounts
  handleSave,            // Save handler
  handleCancel,          // Cancel/back navigation
} = useStudentFormPage({
  studentId?: string,    // For edit mode
});
```

## Tab Components

### StudentInformationTab

Personal information fields:

```typescript
<StudentInformationTab
  form={form}
  // Renders: firstName, lastName, email, phone, DOB, schoolName, gradeLevel
/>
```

### ParentGuardianTab

Guardian and emergency contact fields:

```typescript
<ParentGuardianTab
  form={form}
  // Renders: guardianName, relationship, guardianPhone, guardianEmail, emergencyContact
/>
```

### FinancialInformationTab

Discount and payment configuration:

```typescript
<FinancialInformationTab
  form={form}
  discountTypes={discountTypes}
  // Renders: discountTypeId, discountPercentage, paymentNotes
/>
```

## Form Usage in Sheets

### CreateStudentSheet (list-page)

```typescript
<TabbedStudentFormContent
  mode="create"
  onSuccess={(newStudent) => {
    onClose();
    // Student added to Redux via useStudents().create()
  }}
  onCancel={onClose}
/>
```

### EditStudentSheet (detail-page)

```typescript
<TabbedStudentFormContent
  mode="edit"
  initialData={student}
  onSuccess={(updatedStudent) => {
    onClose();
    // Student updated in Redux via useStudents().update()
  }}
  onCancel={onClose}
/>
```

## Validation Integration

Forms use Zod schemas from `schemas/studentValidators.ts`:

```typescript
// studentValidators.ts
export const studentFormSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email().optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  guardianName: z.string().min(2).max(100),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().email().optional().or(z.literal('')),
  discountTypeId: z.string().uuid().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  // ... more fields
});
```

## Discount Types Loading

Discount types are loaded via `useStudents()` hook:

```typescript
// In FinancialInformationTab
const { discountTypes, loadDiscountTypes } = useStudents();

useEffect(() => {
  if (discountTypes.length === 0) {
    loadDiscountTypes();
  }
}, []);

<Select value={field.value} onValueChange={field.onChange}>
  {discountTypes.map((discount) => (
    <SelectItem key={discount.id} value={discount.id}>
      {discount.name} ({discount.percentage}%)
    </SelectItem>
  ))}
</Select>
```

## Form Data Flow

```
User fills form
  → Zod validates on change
    → react-hook-form manages state
      → handleSubmit triggered
        → validateAndPrepareStudentData()
          → useStudents().create() or .update()
            → Redux updated
              → onSuccess callback
```

## Anti-Patterns

| Wrong | Correct |
|-------|---------|
| Inline validation rules | Use Zod schema from `studentValidators.ts` |
| Load discount types per form | Use cached types from Redux |
| Custom form state management | Use `useStudentForm` hook |
| Skip form reset on cancel | Always call `resetForm()` |
| Allow submit while validating | Disable submit button during validation |

## Related Documentation

- **Domain Overview:** [../CLAUDE.md](../CLAUDE.md)
- **List Page (Create Sheet):** [../list-page/CLAUDE.md](../list-page/CLAUDE.md)
- **Detail Page (Edit Sheet):** [../detail-page/CLAUDE.md](../detail-page/CLAUDE.md)
- **Validation Schemas:** [../schemas/CLAUDE.md](../schemas/CLAUDE.md)
