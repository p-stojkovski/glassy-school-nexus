# Classes Domain - Form Page (form-page/)

> Create and edit class forms used in sheets and standalone pages.

**Parent:** [../CLAUDE.md](../CLAUDE.md)

## Directory Structure

```
form-page/
├── CLAUDE.md                           # This file
├── index.ts                            # Barrel exports
├── ClassFormPage.tsx                   # Standalone form page container
├── ClassFormContent.tsx                # Shared form layout
├── CreateClassHeader.tsx               # Header for create mode
├── useClassFormPage.ts                 # Page-level state management
└── tabs/
    ├── index.ts
    ├── BasicInfoTab.tsx                # Name, subject, teacher, classroom
    ├── ScheduleEnrollmentTab.tsx       # Schedule slots, student assignment
    └── AdditionalDetailsTab.tsx        # Description, requirements, objectives
```

## Form Structure

### Three-Tab Layout

| Tab | Fields | Required Fields |
|-----|--------|-----------------|
| **Basic Info** | Name, Subject, Teacher, Classroom | Name, Subject |
| **Schedule & Enrollment** | Schedule slots, Students | - |
| **Additional Details** | Description, Requirements, Objectives, Materials | - |

### Field Validation

| Field | Rules |
|-------|-------|
| `name` | Required, 2-100 chars, unique per academic year |
| `subjectId` | Required (dropdown) |
| `teacherId` | Optional (dropdown) |
| `classroomId` | Optional (dropdown) |
| `description` | Optional, max 1000 chars |
| `requirements` | Optional, max 2000 chars |
| `objectives` | Optional, array of strings |
| `materials` | Optional, array of strings |
| `schedule` | Array of ScheduleSlot (validated for overlaps) |
| `studentIds` | Array of student IDs (validated against capacity) |

## Key Hooks

### useClassFormPage
Page-level orchestration for standalone form pages.

```typescript
const {
  isLoading,            // Initial data loading
  classData,            // Class data (edit mode only)
  subjects,             // Available subjects
  teachers,             // Available teachers
  classrooms,           // Available classrooms
  students,             // Available students for enrollment
  handleSave,           // Form submission handler
  handleCancel,         // Cancel/back navigation
} = useClassFormPage({
  classId?: string,     // For edit mode
});
```

## Tab Components

### BasicInfoTab
Core class information with dropdowns that fetch their own data.

```typescript
<BasicInfoTab
  form={form}
  mode="create" | "edit"
/>
```

**Dropdown Pattern:** Each dropdown fetches its own options internally (decentralized loading):
```typescript
// Inside SubjectDropdown (example)
useEffect(() => {
  const loadSubjects = async () => {
    const subjects = await subjectApiService.getAll();
    setOptions(subjects);
  };
  loadSubjects();
}, []);
```

### ScheduleEnrollmentTab
Schedule slot management with conflict checking and student enrollment.

```typescript
<ScheduleEnrollmentTab
  form={form}
  classId={classId}  // For edit mode conflict checking
  mode="create" | "edit"
/>
```

**Features:**
- Add/remove schedule slots
- Real-time conflict validation
- Student multi-select with capacity check
- Visual schedule preview

### AdditionalDetailsTab
Rich text and list inputs for class details.

```typescript
<AdditionalDetailsTab
  form={form}
/>
```

**Features:**
- Description textarea
- Requirements textarea
- Dynamic list for objectives (add/remove)
- Dynamic list for materials (add/remove)

## Form Usage in Sheets

### CreateClassSheet (list-page)
```typescript
<ClassFormContent
  mode="create"
  onSuccess={(newClass) => {
    onClose();
    // Class added to Redux automatically
  }}
  onCancel={onClose}
/>
```

### EditClassDetailsSheet (detail-page)
```typescript
<ClassFormContent
  mode="edit"
  initialData={classData}
  onSuccess={(updatedClass) => {
    onClose();
    refreshClassData();
  }}
  onCancel={onClose}
/>
```

## Validation Integration

Form uses Zod schemas from `schemas/classValidators.ts`:

```typescript
// classValidators.ts
export const classFormSchema = z.object({
  name: z.string().min(2).max(100),
  subjectId: z.string().uuid(),
  teacherId: z.string().uuid().optional(),
  classroomId: z.string().uuid().optional(),
  description: z.string().max(1000).optional(),
  requirements: z.string().max(2000).optional(),
  objectives: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  schedule: z.array(scheduleSlotSchema).optional(),
  studentIds: z.array(z.string().uuid()).optional(),
});

// Schedule slot validation
export const scheduleSlotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});
```

## Schedule Conflict Handling

When adding/editing schedule slots:

```typescript
// In ScheduleEnrollmentTab
const { conflicts, hasConflicts, checking } = useScheduleConflictCheck({
  classId,
  dayOfWeek,
  startTime,
  endTime,
  generateLessons: true,
  rangeType: 'UntilYearEnd',
});

// Block submission if conflicts exist
const canSubmit = !hasConflicts && !checking;
```

## Capacity Validation

Enrollment cannot exceed classroom capacity:

```typescript
// In ScheduleEnrollmentTab
const selectedStudentCount = selectedStudents.length;
const classroomCapacity = selectedClassroom?.capacity ?? Infinity;
const isOverCapacity = selectedStudentCount > classroomCapacity;

{isOverCapacity && (
  <CapacityValidationPanel
    selectedCount={selectedStudentCount}
    capacity={classroomCapacity}
  />
)}
```

## Anti-Patterns

| Wrong | Correct |
|-------|---------|
| Inline validation rules | Use Zod schema from `classValidators.ts` |
| Pass dropdown data from parent | Let dropdowns fetch their own data |
| Skip schedule conflict check | Always validate with `useScheduleConflictCheck` |
| Allow over-capacity enrollment | Validate against classroom capacity |
| Custom form state management | Use react-hook-form with Zod resolver |

## Related Documentation

- **Domain Overview:** [../CLAUDE.md](../CLAUDE.md)
- **Shared Hooks:** [../_shared/CLAUDE.md](../_shared/CLAUDE.md)
- **Validation Schemas:** [../schemas/CLAUDE.md](../schemas/CLAUDE.md)
- **List Page (Create Sheet):** [../list-page/CLAUDE.md](../list-page/CLAUDE.md)
- **Detail Page (Edit Sheet):** [../detail-page/CLAUDE.md](../detail-page/CLAUDE.md)
