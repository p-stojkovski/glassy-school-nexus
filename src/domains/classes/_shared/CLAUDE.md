# Classes Domain - Shared (_shared/)

> Shared components, hooks, types, and utilities used across all class pages.

**Parent:** [../CLAUDE.md](../CLAUDE.md)

## Directory Structure

```
_shared/
├── CLAUDE.md                           # This file
├── index.ts                            # Barrel exports
├── components/
│   ├── index.ts
│   ├── ClassLoading.tsx                # Loading spinner for class pages
│   ├── LoadingTableSkeleton.tsx        # Table skeleton loader
│   ├── ActiveFilterChips.tsx           # Filter chips display
│   └── ScheduleConflictPanel.tsx       # Schedule conflict display panel
├── hooks/
│   ├── index.ts
│   ├── useClasses.ts                   # Primary Redux state hook + CRUD
│   ├── useScheduleConflictCheck.ts     # Schedule conflict validation
│   └── useStudentProgressData.ts       # Student progress with caching
├── types/
│   └── salaryRule.types.ts             # Salary rule TypeScript types
└── utils/
    ├── index.ts
    ├── classBreadcrumbs.ts             # Breadcrumb builder for class pages
    ├── scheduleUtils.ts                # Schedule time/day utilities
    ├── scheduleValidationUtils.ts      # Overlap and conflict validation
    └── studentFilters.ts               # Student filtering utilities
```

## Key Files

### Hooks

| Hook | Purpose | Used By |
|------|---------|---------|
| `useClasses` | Primary Redux CRUD + search operations | All pages |
| `useScheduleConflictCheck` | Real-time schedule conflict checking | AddScheduleSlotSheet |
| `useStudentProgressData` | Student summaries + lazy lesson details | StudentsTab |

### Components

| Component | Purpose |
|-----------|---------|
| `ClassLoading` | Loading spinner for class pages |
| `LoadingTableSkeleton` | Skeleton loader for tables |
| `ActiveFilterChips` | Displays active filters as removable chips |
| `ScheduleConflictPanel` | Shows schedule conflicts with details |

### Types

| Type | Description |
|------|-------------|
| `ClassSalaryRule` | Salary rule for a class |
| `CreateSalaryRuleRequest` | Request to create a salary rule |
| `UpdateSalaryRuleRequest` | Request to update a salary rule |
| `ClassSalaryPreview` | Preview of salary for a class |

## Hook Usage Patterns

### useClasses (Redux CRUD)
```typescript
const {
  classes,              // Full class list
  searchResults,        // Filtered results when searching
  displayClasses,       // Auto-selects correct list based on mode
  isSearchMode,         // Whether search is active
  loading,              // Per-operation loading states
  errors,               // Per-operation error states
  selectedClass,        // Currently selected class

  // Operations (all dispatch to Redux + call API)
  loadClasses,          // async () => void
  search,               // async (params: ClassSearchParams) => void
  create,               // async (data: ClassFormData) => ClassResponse
  update,               // async (id, data: ClassFormData) => ClassResponse
  remove,               // async (id, name) => void
  disable,              // async (id, name) => void
  enable,               // async (id, name) => void
  selectClass,          // (id: string) => void
  clearSearchMode,      // () => void
} = useClasses();
```

### useScheduleConflictCheck
```typescript
const {
  conflicts,            // LessonConflict[] - detected conflicts
  checking,             // Boolean - validation in progress
  error,                // string | null - error message
  hasConflicts,         // Boolean - shorthand for conflicts.length > 0
  dateRangeContext,     // string - human-readable date range
  existingOverlap,      // ExistingScheduleOverlapInfo | null
  clear,                // () => void - clear conflicts
} = useScheduleConflictCheck({
  classId,
  dayOfWeek,
  startTime,
  endTime,
  generateLessons,
  rangeType: 'UntilYearEnd' | 'UntilSemesterEnd' | 'Custom',
  customEndDate?: string,
});
```

### useStudentProgressData (Caching + Lazy Loading)
```typescript
const {
  summaries,            // StudentLessonSummary[] - student summary data
  loading,              // Boolean - initial loading state
  error,                // string | null - fetch error
  lessonDetails,        // Record<string, StudentLessonDetail[]> - lazy loaded
  loadingDetails,       // Set<string> - studentIds currently loading

  // Actions
  loadStudentDetails,   // (studentId) => Promise<void>
  retry,                // () => Promise<void>
  refresh,              // () => Promise<void> - bypasses cache
} = useStudentProgressData({
  classId,
  dataVersion?: number, // Increment to force refetch
});
```

## Utility Functions

### scheduleUtils.ts
```typescript
formatTime(time: string): string;              // "09:00" → "9:00 AM"
formatTimeRange(start, end): string;           // "9:00 AM - 11:00 AM"
getDayName(dayOfWeek: number): string;         // 1 → "Monday"
sortScheduleSlots(slots): ScheduleSlot[];      // Sort by day, then time
```

### scheduleValidationUtils.ts
```typescript
validateNoOverlaps(slots): ValidationResult;   // Check for slot overlaps
checkTimeConflict(slot1, slot2): boolean;      // Two slots conflict?
getOverlappingSlots(slots): OverlapInfo[];     // Get all overlapping pairs
```

### studentFilters.ts
```typescript
filterStudentsByStatus(students, status): Student[];
filterStudentsByProgress(students, min, max): Student[];
sortStudentsByName(students): Student[];
```

## ScheduleConflictPanel Pattern

The conflict panel shows schedule conflicts with teacher/classroom details:

```typescript
<ScheduleConflictPanel
  conflicts={conflicts}
  checking={checking}
  dateRangeContext={dateRangeContext}
  existingOverlap={existingOverlap}
/>
```

Displays:
- Teacher conflicts (teacher already scheduled)
- Classroom conflicts (room already booked)
- Existing slot overlaps (within same class)

## Anti-Patterns

| Wrong | Correct |
|-------|---------|
| Import hooks from `classesSlice.ts` | Import from `_shared/hooks/` |
| Create custom loading component | Use `ClassLoading` or `LoadingTableSkeleton` |
| Build breadcrumbs manually | Use `buildClassBreadcrumbs()` |
| Access Redux store directly | Use `useClasses()` hook |
| Skip conflict check before adding slot | Always use `useScheduleConflictCheck` |
| Load all student details upfront | Use lazy loading with `loadStudentDetails` |

## Related Documentation

- **Domain Overview:** [../CLAUDE.md](../CLAUDE.md)
- **Redux Slice:** [../classesSlice.ts](../classesSlice.ts)
- **API Types:** `types/api/class.ts`
- **Validation Schemas:** [../schemas/CLAUDE.md](../schemas/CLAUDE.md)
