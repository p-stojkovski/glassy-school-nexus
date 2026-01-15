# Students Domain - Shared (_shared/)

> Shared components, hooks, and utilities used across all student pages.

**Parent:** [../CLAUDE.md](../CLAUDE.md)

## Directory Structure

```
_shared/
├── CLAUDE.md                           # This file
├── index.ts                            # Barrel exports
├── components/
│   ├── index.ts
│   ├── StudentLoading.tsx              # Loading spinner for student pages
│   └── StudentEmptyState.tsx           # Empty state when no students
├── hooks/
│   ├── index.ts
│   ├── useStudents.ts                  # Primary Redux state + API hook
│   ├── useStudentFilters.ts            # Client-side filtering logic
│   ├── useStudentFilterState.ts        # Filter state management
│   ├── useInitializeStudents.ts        # Lazy loading initialization
│   └── useUnsavedChangesWarning.ts     # Navigation protection
└── utils/
    └── (Student utilities)
```

## Key Hooks

### useStudents (Primary Hook)

The main hook for all student operations - provides Redux state access and API calls.

```typescript
const {
  // === State (dual-state aware) ===
  students,              // Current display list (auto-switches based on mode)
  all,                   // Full student list
  searchResults,         // Results when searching
  selectedStudent,       // Currently selected student
  discountTypes,         // Cached discount types

  // === Loading & Errors ===
  loading,               // Per-operation loading states
  errors,                // Per-operation error states

  // === Search State ===
  isSearchMode,          // Whether search is active
  searchQuery,           // Current search text
  searchParams,          // Full search parameters

  // === Pagination ===
  totalCount,
  currentPage,
  pageSize,

  // === CRUD Operations ===
  loadStudents,          // async () => Student[]
  loadDiscountTypes,     // async () => DiscountTypeDto[]
  search,                // async (params) => SearchResult
  create,                // async (data) => Student
  update,                // async (id, data) => Student
  remove,                // async (id, name) => void

  // === State Setters ===
  setSearchQuery,
  setSearchMode,
  setSelectedStudent,
  setCurrentPage,
  setPageSize,
  clearAllErrors,
  resetState,
} = useStudents();
```

### useStudentFilters (Client-Side Filtering)

Provides memoized client-side filtering for students.

```typescript
const filteredStudents = useStudentFilters({
  students,              // Student array to filter
  obligations,           // Payment obligations for status
  searchTerm,            // Text search
  statusFilter,          // 'all' | 'active' | 'inactive'
  paymentStatusFilter,   // 'all' | 'pending' | 'partial' | 'paid' | 'overdue'
  classFilter,           // 'all' | 'unassigned' | classId
});
```

### useStudentFilterState

Manages filter UI state (search term, dropdowns, etc.).

```typescript
const {
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  // ... other filters
} = useStudentFilterState();
```

### useInitializeStudents

Initializes student and financial data on component mount.

```typescript
const {
  refreshStudents,       // () => void
  refreshFinancialData,  // () => void
  isLoading,             // boolean
  isInitialized,         // boolean
} = useInitializeStudents();
```

### useUnsavedChangesWarning

Prevents navigation when there are unsaved changes.

```typescript
const {
  hasUnsavedChanges,
  setHasUnsavedChanges,
  confirmNavigation,
  // Used with UnsavedChangesDialog
} = useUnsavedChangesWarning();
```

## Components

| Component | Purpose | Props |
|-----------|---------|-------|
| `StudentLoading` | Loading spinner for student pages | None |
| `StudentEmptyState` | Empty state when no students | `onAddClick` |

## Helper Functions

### getStudentPaymentStatus

Determines payment status for a student based on obligations.

```typescript
const status = getStudentPaymentStatus(studentId, obligations);
// Returns: 'pending' | 'partial' | 'paid' | 'overdue'
```

## Import Patterns

```typescript
// Recommended: Named imports from barrel
import { useStudents, useStudentFilters } from '../_shared/hooks';
import { StudentLoading, StudentEmptyState } from '../_shared/components';

// Wrong: Direct file imports
import { useStudents } from '../_shared/hooks/useStudents'; // Avoid
```

## Anti-Patterns

| Wrong | Correct |
|-------|---------|
| Import from `studentsSlice.ts` directly | Use `useStudents()` hook |
| Create custom loading component | Use `StudentLoading` |
| Duplicate filter logic | Use `useStudentFilters` |
| Access Redux store directly | Use `useStudents()` hook |
| Skip unsaved changes warning | Use `useUnsavedChangesWarning` |

## Related Documentation

- **Domain Overview:** [../CLAUDE.md](../CLAUDE.md)
- **Redux Slice:** [../studentsSlice.ts](../studentsSlice.ts)
- **API Types:** `types/api/student.ts`
- **List Page:** [../list-page/CLAUDE.md](../list-page/CLAUDE.md)
