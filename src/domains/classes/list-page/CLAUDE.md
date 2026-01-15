# Classes Domain - List Page (list-page/)

> The `/classes` route displaying all classes with filtering, search, and table/grid views.

**Parent:** [../CLAUDE.md](../CLAUDE.md)

## Directory Structure

```
list-page/
├── CLAUDE.md                           # This file
├── index.ts                            # Barrel exports
├── ClassesPage.tsx                     # Main page component
├── components/
│   ├── index.ts
│   ├── ClassTable.tsx                  # Table view (default)
│   ├── ClassGrid.tsx                   # Card/grid view (responsive)
│   └── ClassFilters.tsx                # Subject filter, status, search
└── dialogs/
    ├── index.ts
    ├── CreateClassSheet.tsx            # Slide-over sheet for creating classes
    ├── DisableClassDialog.tsx          # Confirm disable dialog
    └── EnableClassDialog.tsx           # Confirm enable dialog
```

## Key Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `ClassesPage` | Main list page container | - |
| `ClassTable` | Data table with sortable columns | `classes`, `onView`, `onEdit`, `onDisable`, `onEnable`, `onDelete` |
| `ClassGrid` | Card grid view for responsive layouts | `classes`, `onView`, `onEdit`, `onDisable`, `onEnable`, `onDelete` |
| `ClassFilters` | Subject dropdown, status toggle, search | `onFilterChange`, `onSearch`, `activeFilters` |
| `CreateClassSheet` | Side sheet with class form | `isOpen`, `onClose`, `onSuccess` |
| `DisableClassDialog` | Confirmation for disabling | `isOpen`, `classData`, `onConfirm`, `onCancel` |
| `EnableClassDialog` | Confirmation for enabling | `isOpen`, `classData`, `onConfirm`, `onCancel` |

## Data Flow

```
ClassesPage
  └── useClasses()                  # Load all classes
      └── ClassFilters
          └── useClasses().search() # Server-side search
      └── ClassTable / ClassGrid
          └── Row actions → View, Edit, Disable/Enable, Delete
      └── CreateClassSheet
          └── useClasses().create()
      └── DisableClassDialog
          └── useClasses().disable()
      └── EnableClassDialog
          └── useClasses().enable()
```

## Table Columns

| Column | Field | Sortable | Notes |
|--------|-------|----------|-------|
| Name | `name` | Yes | Primary identifier |
| Subject | `subject.name` | Yes | Subject chip |
| Teacher | `teacher.firstName + lastName` | Yes | Assigned teacher |
| Classroom | `classroom.name` | Yes | Room assignment |
| Students | `enrolledStudents` | Yes | Count / capacity |
| Status | `isActive` | Yes | Active/Inactive badge |
| Actions | - | No | View, Edit, Disable/Enable, Delete |

## Filtering Logic

1. **Subject Filter:** Server-side via `/search` endpoint
2. **Status Filter:** Server-side (Active/Inactive/All)
3. **Text Search:** Server-side search query
4. **Combined:** All filters applied together

```typescript
// ClassFilters sends params to useClasses
const params: ClassSearchParams = {
  subjectId?: string,
  status?: 'active' | 'inactive' | 'all',
  searchQuery?: string,
};
```

## View Modes

- **Table:** Default for desktop - sortable columns, dense data
- **Grid:** Responsive card grid - better for mobile/touch

Toggle persisted in component state (not Redux).

## CreateClassSheet Pattern

Uses multi-tab form with three tabs:
1. **Basic Info:** Name, subject, teacher, classroom
2. **Schedule & Enrollment:** Schedule slots, student assignment
3. **Additional Details:** Description, requirements, objectives, materials

```typescript
// Sheet integration
<CreateClassSheet
  isOpen={isOpen}
  onClose={handleClose}
  onSuccess={(newClass) => {
    // Class added to Redux via useClasses
    handleClose();
  }}
/>
```

## Status Management

Classes can be enabled/disabled (soft delete):

```typescript
// Disable - marks class as inactive
const handleDisable = async () => {
  await disable(classId, className);
  // Shows confirmation, keeps data for reporting
};

// Enable - reactivates a disabled class
const handleEnable = async () => {
  await enable(classId, className);
};
```

**Business Rules:**
- Disabled classes don't appear in default list (filter by status)
- Cannot delete classes with enrollment history (use disable instead)
- Disabled classes still show in reports for historical data

## Anti-Patterns

| Wrong | Correct |
|-------|---------|
| Client-side filtering | Use server-side `/search` endpoint |
| Store view mode in Redux | Local component state is fine |
| Custom table component | Use existing `ClassTable` |
| Direct API calls in components | Use `useClasses` hook |
| Hard delete classes with history | Use disable instead |

## Related Documentation

- **Domain Overview:** [../CLAUDE.md](../CLAUDE.md)
- **Shared Hooks:** [../_shared/CLAUDE.md](../_shared/CLAUDE.md)
- **Detail Page:** [../detail-page/CLAUDE.md](../detail-page/CLAUDE.md)
- **Form Page:** [../form-page/CLAUDE.md](../form-page/CLAUDE.md)
