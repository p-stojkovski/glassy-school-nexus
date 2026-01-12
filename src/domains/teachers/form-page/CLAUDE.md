# Teachers Domain - Form Page (form-page/)

> Create and edit teacher forms used in sheets and standalone pages.

**Parent:** [../CLAUDE.md](../CLAUDE.md)

## Directory Structure

```
form-page/
├── CLAUDE.md                           # This file
├── index.ts                            # Barrel exports
├── forms/
│   ├── index.ts
│   ├── TabbedTeacherFormContent.tsx    # Main form with tabs
│   └── tabs/
│       ├── index.ts
│       ├── PersonalInformationTab.tsx   # Name, email, phone, bio
│       └── ProfessionalInformationTab.tsx # Subject, hire date
└── hooks/
    ├── index.ts
    ├── useTeacherForm.ts               # Form state + validation
    └── useTeacherFormPage.ts           # Page-level state
```

## Form Structure

### Two-Tab Layout

| Tab | Fields | Required Fields |
|-----|--------|-----------------|
| **Personal Information** | First Name, Last Name, Email, Phone, Bio | First Name, Last Name, Email |
| **Professional Information** | Subject, Hire Date | Subject |

### Field Validation

| Field | Rules |
|-------|-------|
| `firstName` | Required, 2-50 chars |
| `lastName` | Required, 2-50 chars |
| `email` | Required, valid email, unique (server check) |
| `phone` | Optional, valid phone format |
| `bio` | Optional, max 500 chars |
| `subjectId` | Required (dropdown) |
| `hireDate` | Optional, valid date |

## Key Hooks

### useTeacherForm
Manages form state, validation, and submission.

```typescript
const {
  form,                  // react-hook-form instance
  isSubmitting,          // Form submission in progress
  errors,                // Validation errors

  // Email availability checking
  emailAvailability,     // 'checking' | 'available' | 'taken' | null
  checkEmailAvailability, // Debounced email check

  // Submission
  handleSubmit,          // Form submit handler
  resetForm,             // Reset to initial state
} = useTeacherForm({
  mode: 'create' | 'edit',
  initialData?: TeacherResponse,
  onSuccess?: (teacher: TeacherResponse) => void,
});
```

### useTeacherFormPage
Page-level orchestration (used for standalone form pages).

```typescript
const {
  isLoading,             // Initial data loading
  teacher,               // Teacher data (edit mode)
  subjects,              // Available subjects
  handleSave,            // Save handler
  handleCancel,          // Cancel/back navigation
} = useTeacherFormPage({
  teacherId?: string,    // For edit mode
});
```

## Email Availability Pattern

Real-time email checking with debounce:

```typescript
// In PersonalInformationTab
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input
          {...field}
          onChange={(e) => {
            field.onChange(e);
            checkEmailAvailability(e.target.value);
          }}
        />
      </FormControl>
      {emailAvailability === 'checking' && <Spinner />}
      {emailAvailability === 'taken' && (
        <FormMessage>Email already in use</FormMessage>
      )}
    </FormItem>
  )}
/>
```

## Form Usage in Sheets

### CreateTeacherSheet (list-page)
```typescript
<TabbedTeacherFormContent
  mode="create"
  onSuccess={(newTeacher) => {
    onClose();
    // Teacher added to Redux automatically
  }}
  onCancel={onClose}
/>
```

### EditTeacherSheet (detail-page)
```typescript
<TabbedTeacherFormContent
  mode="edit"
  initialData={teacher}
  onSuccess={(updatedTeacher) => {
    onClose();
    // Teacher updated in Redux automatically
  }}
  onCancel={onClose}
/>
```

## Validation Integration

Form uses Zod schemas from `utils/validation/teacherValidators.ts`:

```typescript
// teacherValidators.ts
export const teacherFormSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  subjectId: z.string().uuid(),
  hireDate: z.string().optional(),
});
```

## Subject Loading

Subjects are loaded via `useTeachers` hook (cached in Redux):

```typescript
// In ProfessionalInformationTab
const { subjects } = useTeachers();

<Select value={field.value} onValueChange={field.onChange}>
  {subjects.map((subject) => (
    <SelectItem key={subject.id} value={subject.id}>
      {subject.name}
    </SelectItem>
  ))}
</Select>
```

## Anti-Patterns

| Wrong | Correct |
|-------|---------|
| Inline validation rules | Use Zod schema from `teacherValidators.ts` |
| Load subjects in each form | Use cached subjects from Redux |
| Skip email availability check | Always check on email change |
| Custom form state management | Use `useTeacherForm` hook |

## Related Documentation

- **Domain Overview:** [../CLAUDE.md](../CLAUDE.md)
- **List Page (Create Sheet):** [../list-page/CLAUDE.md](../list-page/CLAUDE.md)
- **Detail Page (Edit Sheet):** [../detail-page/CLAUDE.md](../detail-page/CLAUDE.md)
- **Validation Schemas:** `utils/validation/teacherValidators.ts`
