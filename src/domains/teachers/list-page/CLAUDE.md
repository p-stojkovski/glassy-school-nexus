# Teachers Domain - List Page (list-page/)

> The `/teachers` route displaying all teachers with filtering, search, and table/card views.

**Parent:** [../CLAUDE.md](../CLAUDE.md)

## Directory Structure

```
list-page/
├── CLAUDE.md                           # This file
├── index.ts                            # Barrel exports
├── TeacherTable.tsx                    # Table view (default)
├── TeacherCard.tsx                     # Card view (responsive grid)
├── components/
│   ├── index.ts
│   ├── TeacherFilters.tsx              # Subject filter, search input
│   ├── TeacherHeader.tsx               # Page title, view toggle, add button
│   └── TeacherEmptyState.tsx           # Empty state messaging
└── dialogs/
    ├── index.ts
    └── CreateTeacherSheet.tsx          # Slide-over sheet for creating teachers
```

## Key Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `TeacherTable` | Data table with sortable columns | `teachers`, `onView`, `onEdit`, `onDelete` |
| `TeacherCard` | Card grid view for responsive layouts | `teachers`, `onView`, `onEdit`, `onDelete` |
| `TeacherFilters` | Subject dropdown + search input | `onFilterChange`, `subjects` |
| `TeacherHeader` | Title, view toggle, "Add Teacher" button | `onAddClick`, `viewMode`, `onViewModeChange` |
| `TeacherEmptyState` | Shown when no teachers exist | `onAddClick` |
| `CreateTeacherSheet` | Side sheet with teacher form | `isOpen`, `onClose`, `onSuccess` |

## Data Flow

```
TeachersPage (router level)
  └── useTeacherList()           # Initialize: load teachers + subjects
  └── useTeachers()              # Get displayTeachers, loading, errors
      └── TeacherHeader
      └── TeacherFilters
          └── useTeacherCRUD().searchTeachers()
      └── TeacherTable / TeacherCard
          └── Row actions → Edit, Delete, View
      └── CreateTeacherSheet
          └── useTeacherManagement().createTeacher()
```

## Table Columns

| Column | Field | Sortable | Notes |
|--------|-------|----------|-------|
| Name | `firstName`, `lastName` | Yes | Combined display |
| Email | `email` | Yes | Click to copy |
| Subject | `subject.name` | Yes | Chip display |
| Status | `isActive` | Yes | Active/Inactive badge |
| Actions | - | No | View, Edit, Delete |

## Filtering Logic

1. **Subject Filter:** Server-side via `/search` endpoint
2. **Text Search:** Server-side via `/search` endpoint
3. **Combined:** Both filters applied together

```typescript
// TeacherFilters sends params to useTeacherCRUD
const params: TeacherSearchParams = {
  subjectId?: string,
  searchQuery?: string,
};
```

## View Modes

- **Table:** Default for desktop - sortable columns, dense data
- **Card:** Responsive grid - better for mobile/touch

Toggle persisted in component state (not Redux).

## CreateTeacherSheet Pattern

Uses tabbed form with two tabs:
1. **Personal Information:** Name, email, phone, bio
2. **Professional Information:** Subject selection, hire date

```typescript
// Sheet integration
<CreateTeacherSheet
  isOpen={isOpen}
  onClose={handleClose}
  onSuccess={(newTeacher) => {
    // Teacher added to Redux via useTeacherManagement
    handleClose();
  }}
/>
```

## Anti-Patterns

| Wrong | Correct |
|-------|---------|
| Client-side filtering | Use server-side `/search` endpoint |
| Store view mode in Redux | Local component state is fine |
| Custom table component | Use existing `TeacherTable` |
| Direct API calls in components | Use `useTeacherCRUD` or `useTeacherManagement` |

## Related Documentation

- **Domain Overview:** [../CLAUDE.md](../CLAUDE.md)
- **Shared Hooks:** [../_shared/CLAUDE.md](../_shared/CLAUDE.md)
- **Form Page:** [../form-page/CLAUDE.md](../form-page/CLAUDE.md)
