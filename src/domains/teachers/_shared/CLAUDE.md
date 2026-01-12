# Teachers Domain - Shared (_shared/)

> Shared components, hooks, types, and utilities used across all teacher pages.

**Parent:** [../CLAUDE.md](../CLAUDE.md)

## Directory Structure

```
_shared/
├── CLAUDE.md                           # This file
├── index.ts                            # Barrel exports
├── components/
│   ├── index.ts
│   └── TeacherLoading.tsx              # Loading spinner for teacher pages
├── hooks/
│   ├── index.ts
│   ├── useTeachers.ts                  # Primary Redux state hook
│   ├── useTeacherCRUD.ts               # CRUD operations with API
│   ├── useTeacherFilters.ts            # Filter state management
│   ├── useTeacherList.ts               # List page initialization
│   └── useTeacherManagement.ts         # High-level management operations
├── types/
│   ├── index.ts
│   └── salaryCalculation.types.ts      # Salary calculation TypeScript types
└── utils/
    └── teacherBreadcrumbs.ts           # Breadcrumb builder for teacher pages
```

## Key Files

### Hooks

| Hook | Purpose | Used By |
|------|---------|---------|
| `useTeachers` | Primary Redux state access and actions | All pages |
| `useTeacherCRUD` | API calls for create, update, delete, search | List page, forms |
| `useTeacherFilters` | Filter state (subject, search query) | List page filters |
| `useTeacherList` | Initialize list page (load teachers, subjects) | List page |
| `useTeacherManagement` | High-level operations (combines CRUD + state) | Sheets, forms |

### Types

| Type | Description |
|------|-------------|
| `SalaryCalculation` | Salary calculation summary for list view |
| `SalaryCalculationItem` | Breakdown per class/tier |
| `SalaryCalculationDetail` | Full calculation with items and audit log |
| `SalaryAuditLog` | Audit trail entry |
| `TeacherSalaryPreview` | Projected earnings preview |
| `GenerateSalaryRequest` | Request to generate calculation |
| `ApproveSalaryRequest` | Request to approve with optional adjustment |
| `ReopenSalaryRequest` | Request to reopen approved calculation |

## Hook Usage Patterns

### useTeachers (Redux State)
```typescript
const {
  teachers,              // Full teacher list
  searchResults,         // Filtered results when searching
  displayTeachers,       // Auto-selects correct list based on mode
  isSearchMode,          // Whether search is active
  loading,               // Per-operation loading states
  errors,                // Per-operation error states
  subjects,              // Available subjects for filtering

  // Actions
  setTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
  setSearchMode,
} = useTeachers();
```

### useTeacherCRUD (API Operations)
```typescript
const {
  createTeacher,    // async (data) => TeacherResponse
  updateTeacher,    // async (id, data) => TeacherResponse
  deleteTeacher,    // async (id) => void
  searchTeachers,   // async (params) => TeacherResponse[]
  loadTeachers,     // async () => void (initial load)
  loadSubjects,     // async () => void
} = useTeacherCRUD();
```

## Salary Calculation Types

The domain includes comprehensive types for the variable salary feature:

```typescript
// Status flow: pending → approved (can reopen → pending)
type SalaryCalculationStatus = 'pending' | 'approved' | 'reopened';

// API path helpers
SalaryCalculationApiPaths.LIST(teacherId);
SalaryCalculationApiPaths.BY_ID(teacherId, calcId);
SalaryCalculationApiPaths.APPROVE(teacherId, calcId);
SalaryCalculationApiPaths.REOPEN(teacherId, calcId);
SalaryCalculationApiPaths.PREVIEW(teacherId, year, month);
```

## Anti-Patterns

| Wrong | Correct |
|-------|---------|
| Import hooks from `teachersSlice.ts` | Import from `_shared/hooks/` |
| Create custom loading component | Use `TeacherLoading` |
| Build breadcrumbs manually | Use `buildTeacherBreadcrumbs()` |
| Access Redux store directly | Use `useTeachers()` hook |

## Related Documentation

- **Domain Overview:** [../CLAUDE.md](../CLAUDE.md)
- **Redux Slice:** [../teachersSlice.ts](../teachersSlice.ts)
- **API Types:** `types/api/teacher.ts`
