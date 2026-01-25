# Settings Domain - ThinkEnglish

> Configuration and reference data management for the ThinkEnglish school management system.

## Quick Reference

| Resource | Purpose |
|----------|---------|
| **Backend:** | Multiple API endpoints across different features |
| **Structure:** | Type-based organization (simple domain < 15 files per sub-domain) |

## Domain Purpose

Manages configuration settings and reference data used across the application: subjects, discount types, lesson statuses, and academic calendar (years, semesters, teaching breaks).

**Core Entities:** Subject, DiscountType, LessonStatus, AcademicYear, Semester, TeachingBreak

**Note:** Classrooms is an **external domain** (`src/domains/classrooms/`) with its own Redux slice and management logic. The ClassroomSettingsTab is imported from there but displayed on the Settings page.

## Architecture

The Settings domain uses **type-based organization** (organized by component type) since each sub-domain has fewer than 15 files. This differs from complex domains like Classes or Students which use flow-based organization.

### Directory Structure

```
settings/
├── CLAUDE.md                         # This file
├── settingsSlice.ts                  # Unified Redux slice for all sub-domains
├── index.ts                          # Domain barrel exports
│
├── _shared/                          # Shared across all sub-domains
│   ├── components/
│   │   ├── SettingsTable.tsx         # Reusable table component
│   │   └── index.ts
│   └── index.ts
│
├── types/                            # TypeScript types for all sub-domains
│   ├── subjectTypes.ts
│   ├── discountTypeTypes.ts
│   ├── lessonStatusTypes.ts
│   ├── academicCalendarTypes.ts
│   └── index.ts                      # Barrel export
│
├── subjects/                         # Subjects sub-domain
│   ├── components/
│   │   ├── SubjectSettingsTab.tsx    # Main tab component
│   │   ├── SubjectForm.tsx           # Create/edit form
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useSubjects.ts            # Redux + API hook
│   │   └── index.ts
│   ├── schemas/
│   │   ├── subjectSchemas.ts         # Zod validation
│   │   └── index.ts
│   └── index.ts
│
├── discount-types/                   # Discount Types sub-domain
│   ├── components/
│   │   ├── DiscountTypeSettingsTab.tsx
│   │   ├── DiscountTypeForm.tsx
│   │   └── index.ts
│   ├── hooks/
│   │   └── useDiscountTypes.ts
│   ├── schemas/
│   │   └── discountTypeSchemas.ts
│   └── index.ts
│
├── lesson-statuses/                  # Lesson Statuses sub-domain (READ-ONLY)
│   ├── components/
│   │   ├── LessonStatusSettingsTab.tsx
│   │   ├── LessonStatusForm.tsx      # Edit only (display name, color)
│   │   └── index.ts
│   ├── hooks/
│   │   └── useLessonStatuses.ts
│   ├── schemas/
│   │   └── lessonStatusSchemas.ts
│   └── index.ts
│
└── academic-calendar/                # Academic Calendar sub-domain
    ├── components/
    │   ├── AcademicCalendarSettingsTab.tsx  # Container with sub-tabs
    │   ├── AcademicYearsManagement.tsx
    │   ├── SemestersManagement.tsx
    │   ├── TeachingBreaksManagement.tsx
    │   └── shared/
    │       └── DateRangeDisplay.tsx
    ├── forms/
    │   ├── AcademicYearForm.tsx
    │   ├── SemesterForm.tsx
    │   └── TeachingBreakForm.tsx
    ├── hooks/
    │   ├── useAcademicYears.ts
    │   ├── useSemesters.ts
    │   ├── useTeachingBreaks.ts
    │   └── index.ts
    ├── schemas/
    │   └── academicCalendarSchemas.ts
    └── index.ts
```

## Sub-Domains

| Sub-Domain | CRUD | Notes |
|------------|------|-------|
| **Subjects** | Full | Sort order display, key uniqueness |
| **Discount Types** | Full | `requiresAmount` flag, used by students |
| **Lesson Statuses** | Read + Update only | Predefined statuses, edit display name/color only |
| **Academic Calendar** | Full (nested) | Academic Years -> Semesters -> Teaching Breaks |
| **Classrooms** | External domain | Lives in `src/domains/classrooms/` |

## Redux State Structure

The Settings domain uses a **unified slice** (`settingsSlice.ts`) with nested state for each sub-domain:

```typescript
interface SettingsState {
  subjects: {
    items: Subject[];
    loading: { fetching, creating, updating, deleting };
    errors: { fetch, create, update, delete };
  };
  discountTypes: {
    items: DiscountType[];
    loading: { fetching, creating, updating, deleting };
    errors: { fetch, create, update, delete };
  };
  lessonStatuses: {
    items: LessonStatus[];
    loading: { fetching, updating };  // No create/delete
    errors: { fetch, update };
  };
  academicCalendar: {
    academicYears: AcademicYear[];
    semesters: Record<string, Semester[]>;       // Keyed by yearId
    teachingBreaks: Record<string, TeachingBreak[]>; // Keyed by yearId
    activeAcademicYearId: string | null;
    loading: { ...12 operations };
    errors: { ...12 operations };
  };
}
```

### Key Patterns

**1. Per-Operation Loading/Error States**

Each sub-domain tracks loading and error states separately for each operation:

```typescript
loading: {
  fetching: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
}
errors: {
  fetch: string | null;
  create: string | null;
  update: string | null;
  delete: string | null;
}
```

**2. Custom Hooks Pattern**

Each sub-domain has a custom hook that:
- Selects state from Redux
- Dispatches actions
- Calls API services
- Handles errors with toast notifications
- Returns boolean success for UI feedback

```typescript
const { subjects, loading, fetchSubjects, createSubject, ... } = useSubjects();
```

**3. Cache Invalidation**

Legacy localStorage caching is cleared on mutations:
```typescript
const clearCache = () => localStorage.removeItem('think-english-subjects');
```

**4. SortOrder Display**

Subjects and Discount Types maintain `sortOrder` for display ordering. Data is sorted after fetch:
```typescript
const sorted = data.sort((a, b) => a.sortOrder - b.sortOrder);
```

**5. Academic Calendar Nested Entities**

Semesters and Teaching Breaks are stored in Records keyed by `academicYearId`:
- When a year is deleted, its semesters and breaks are also removed from state
- Active year ID is tracked separately for quick access

## Form Validation with Zod

Schemas are defined in each sub-domain's `schemas/` folder:

```typescript
// subjects/schemas/subjectSchemas.ts
export const subjectFormSchema = z.object({
  key: z.string().min(1, 'Key is required').max(50),
  name: z.string().min(1, 'Name is required').max(100),
  sortOrder: z.number().int().min(0),
});

export type SubjectFormData = z.infer<typeof subjectFormSchema>;
```

## Error Handling

**409 Conflict Errors** are handled specially for:
- Duplicate key (subjects, discount types)
- Entity in use (cannot delete subjects/discount types that are referenced)

```typescript
if (error?.status === 409) {
  toast.error('Subject with this key already exists');
} else {
  toast.error(message);
}
```

## Shared Components

### SettingsTable

A reusable table component for all settings tabs:

```typescript
<SettingsTable
  title="Subjects"
  description="Manage available subjects"
  columns={columns}
  data={subjects}
  onAdd={handleAdd}
  onEdit={handleEdit}
  onDelete={handleDelete}
  isLoading={loading.fetching}
  hideAddButton={false}      // Optional
  hideDeleteButton={false}   // Optional for read-only entities
/>
```

**Props:**
- `hideAddButton`: Hide add button (for read-only tables)
- `hideDeleteButton`: Hide delete action (for Lesson Statuses)

## Special Cases

### Lesson Statuses (Read-Only)

Lesson statuses are **predefined** and cannot be created or deleted. Only display properties can be updated:
- `displayName`: User-facing name
- `color`: Hex color for UI display

The `useLessonStatuses` hook only provides `fetchLessonStatuses` and `updateLessonStatus`.

### Academic Calendar (Nested Structure)

Academic Calendar has three levels:
1. **Academic Years** - Top level, one can be marked as active
2. **Semesters** - Belong to a year, have date ranges
3. **Teaching Breaks** - Belong to a year, types: holiday, vacation, other

**Active Year Logic:**
- When a year is marked active, all other years are deactivated
- `activeAcademicYearId` is updated automatically

## Import Patterns

**Recommended:** Import from sub-domain barrels:

```typescript
// From SettingsPage
import { SubjectSettingsTab } from '@/domains/settings/subjects';
import { DiscountTypeSettingsTab } from '@/domains/settings/discount-types';
import { LessonStatusSettingsTab } from '@/domains/settings/lesson-statuses';
import { AcademicCalendarSettingsTab } from '@/domains/settings/academic-calendar';

// Note: Classrooms is external
import ClassroomSettingsTab from '@/domains/settings/components/tabs/ClassroomSettingsTab';
```

**From main domain barrel:**

```typescript
import { settingsReducer, selectSubjects, useSubjects } from '@/domains/settings';
```

## Common Tasks

### Adding a New Setting Type

1. Create types in `types/newTypeTypes.ts`
2. Add to `types/index.ts` barrel
3. Add state structure to `settingsSlice.ts`
4. Create `new-type/` folder with components, hooks, schemas
5. Create barrel export in `new-type/index.ts`
6. Add to main `index.ts` barrel
7. Add tab to `SettingsPage.tsx`

### Fetching Data on Tab Mount

```typescript
useEffect(() => {
  if (subjects.length === 0) {
    fetchSubjects();
  }
}, [subjects.length, fetchSubjects]);
```

### Handling Form Submission

```typescript
const handleSubmit = async (data: FormData) => {
  const success = selectedItem
    ? await updateItem(selectedItem.id, data)
    : await createItem(data);

  if (success) {
    handleCloseForm();
  }
};
```

## Key File Locations

| Purpose | Path |
|---------|------|
| Redux Slice | `settingsSlice.ts` |
| Subjects API | `../../services/subjectApiService.ts` |
| Discount Types API | `../../services/discountTypeApiService.ts` |
| Lesson Statuses API | `../../services/lessonStatusApiService.ts` |
| Academic Calendar API | `services/academicCalendarApi.ts` |
| Shared Table | `_shared/components/SettingsTable.tsx` |
| Types | `types/` folder |

## Testing Considerations

- Test 409 conflict handling for create/update/delete
- Test loading states during async operations
- Test Academic Calendar cascading delete (year deletion removes semesters/breaks)
- Test active year toggle logic
- Test sortOrder-based display ordering

## Migration History

**Phase 1-5 (Completed):**
- Migrated from direct API calls to Redux Toolkit
- Created unified `settingsSlice.ts` with per-operation loading/error states
- Organized sub-domains into type-based folder structure
- Added Zod validation schemas
- Preserved existing `SettingsTable` shared component

**Note:** Legacy files in `components/tabs/`, `components/forms/`, `components/shared/` have been superseded by the new structure but may still exist for reference.

## Related Domains

- **Classrooms** (`src/domains/classrooms/`) - External domain with own slice
- **Students** - References Discount Types for financial info
- **Classes** - References Subjects for class configuration
- **Lessons** - References Lesson Statuses for tracking

## Maintenance Notes

- When adding new reference data types, follow the existing sub-domain pattern
- Keep the unified slice structure for consistency
- Lesson Statuses should remain read-only (predefined at backend)
- Academic Calendar active year logic is critical for filtering in other domains

## Troubleshooting

**"Subject with this key already exists"**
- 409 conflict from backend
- Key must be unique across all subjects

**"Cannot delete: in use"**
- Entity is referenced by other records
- Check Classes (subjects) or Students (discount types)

**Academic Year data not loading**
- Check if `fetchAcademicYears` was called
- Verify `academicYears` array in Redux state
- Semesters/Breaks require yearId to be passed

---

*Last updated: 2026-01-22*