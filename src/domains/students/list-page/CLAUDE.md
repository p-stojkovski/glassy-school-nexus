# Students Domain - List Page (list-page/)

> The `/students` route displaying all students with filtering, search, and table/card views.

**Parent:** [../CLAUDE.md](../CLAUDE.md)

## Directory Structure

```
list-page/
├── CLAUDE.md                           # This file
├── index.ts                            # Barrel exports
├── StudentTable.tsx                    # Table view (default)
├── StudentCard.tsx                     # Card view (responsive grid)
├── components/
│   ├── index.ts
│   ├── StudentFilters.tsx              # Search + filter dropdowns
│   ├── StudentPageHeader.tsx           # Page title, view toggle, add button
│   └── ClassNameCell.tsx               # Class name display in table
├── dialogs/
│   ├── index.ts
│   └── CreateStudentSheet.tsx          # Slide-over sheet for creating students
└── hooks/
    ├── index.ts
    └── useStudentsListPage.ts          # List page initialization
```

## Key Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `StudentTable` | Data table with sortable columns | `students`, `onView`, `onEdit`, `onDelete` |
| `StudentCard` | Card grid view for responsive layouts | `students`, `onView`, `onEdit`, `onDelete` |
| `StudentFilters` | Search input + filter dropdowns | `onFilterChange`, `classes` |
| `StudentPageHeader` | Title, view toggle, "Add Student" button | `onAddClick`, `viewMode`, `onViewModeChange` |
| `ClassNameCell` | Displays class name in table | `classId` |
| `CreateStudentSheet` | Side sheet with student form | `isOpen`, `onClose`, `onSuccess` |

## Data Flow

```
StudentsPage (router level)
  └── useStudentsListPage()           # Initialize: load students
  └── useStudents()                   # Get students, loading, errors
      └── StudentPageHeader
      └── StudentFilters
          └── useStudents().search()   # Server-side search
      └── StudentTable / StudentCard
          └── Row actions → Edit, Delete, View
      └── CreateStudentSheet
          └── useStudents().create()   # Create new student
```

## Table Columns

| Column | Field | Sortable | Notes |
|--------|-------|----------|-------|
| Name | `fullName` | Yes | Combined first + last |
| Email | `email` | Yes | Click to copy |
| Phone | `phoneNumber` | Yes | Formatted display |
| Class | `classId` | Yes | Via `ClassNameCell` |
| Status | `isActive` | Yes | Active/Inactive badge |
| Payment | (derived) | No | From obligations |
| Actions | - | No | View, Edit, Delete |

## Filtering Logic

### Server-Side (via `/search` endpoint)

```typescript
// StudentFilters sends params to useStudents().search()
const params: StudentSearchParams = {
  searchQuery?: string,    // Text search
  classId?: string,        // Class filter
  status?: 'active' | 'inactive',
  skip?: number,           // Pagination offset
  take?: number,           // Page size
};
```

### Client-Side (via `useStudentFilters`)

Used for payment status filter which requires obligations data:

```typescript
const filtered = useStudentFilters({
  students,
  obligations,
  paymentStatusFilter,
  // ... other filters
});
```

## View Modes

- **Table:** Default for desktop - sortable columns, dense data
- **Card:** Responsive grid - better for mobile/touch

Toggle persisted in component state (not Redux).

## CreateStudentSheet Pattern

Uses tabbed form with three tabs:
1. **Student Information:** Name, email, phone, DOB, school info
2. **Parent/Guardian:** Guardian details, emergency contacts
3. **Financial Information:** Discounts, payment preferences

```typescript
// Sheet integration
<CreateStudentSheet
  isOpen={isOpen}
  onClose={handleClose}
  onSuccess={(newStudent) => {
    // Student added to Redux via useStudents().create()
    handleClose();
  }}
/>
```

## useStudentsListPage Hook

Initializes the list page:

```typescript
const {
  students,
  loading,
  error,
  refreshStudents,
} = useStudentsListPage();
```

## Anti-Patterns

| Wrong | Correct |
|-------|---------|
| Client-side only filtering | Use server-side `/search` endpoint |
| Store view mode in Redux | Local component state is fine |
| Custom table component | Use existing `StudentTable` |
| Direct API calls in components | Use `useStudents()` hook |
| Load all data upfront | Use pagination with `skip`/`take` |

## Related Documentation

- **Domain Overview:** [../CLAUDE.md](../CLAUDE.md)
- **Shared Hooks:** [../_shared/CLAUDE.md](../_shared/CLAUDE.md)
- **Form Page:** [../form-page/CLAUDE.md](../form-page/CLAUDE.md)
- **Detail Page:** [../detail-page/CLAUDE.md](../detail-page/CLAUDE.md)
