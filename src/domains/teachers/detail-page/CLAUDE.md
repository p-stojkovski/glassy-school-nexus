# Teachers Domain - Detail Page (detail-page/)

> The `/teachers/:id` route displaying a teacher's profile with tabbed sections.

**Parent:** [../CLAUDE.md](../CLAUDE.md)

## Directory Structure

```
detail-page/
├── CLAUDE.md                           # This file
├── index.ts                            # Barrel exports
├── TeacherProfilePage.tsx              # Main page component with tabs
├── useTeacherProfile.ts                # Profile data + tab state management
├── layout/
│   ├── index.ts
│   ├── TeacherPageHeader.tsx           # Header with name, edit, year selector
│   ├── TeacherProfileHeader.tsx        # Profile card header
│   ├── TeacherBasicInfo.tsx            # Basic info display
│   └── AcademicYearSelector.tsx        # Year dropdown for filtering
├── dialogs/
│   ├── index.ts
│   └── EditTeacherSheet.tsx            # Edit teacher side sheet
├── hooks/
│   ├── index.ts
│   ├── useTeacherAcademicYear.ts       # Academic year context
│   ├── useTeacherSalaryCalculations.ts # Salary calculations list
│   ├── useTeacherSalaryCalculationDetail.ts # Single calculation detail
│   └── useTeacherSalaryPreview.ts      # Salary preview data
└── tabs/
    ├── classes/                        # Classes tab
    ├── lessons/                        # Lessons tab
    ├── schedule/                       # Schedule tab (calendar views)
    ├── salary/                         # Salary overview tab
    └── salary-calculations/            # Salary calculations list tab
```

## Tabs Overview

| Tab | Route | Description | Key Hook |
|-----|-------|-------------|----------|
| Schedule | `/teachers/:id` (default) | Weekly/monthly calendar | `overviewData` from profile |
| Classes | `/teachers/:id?tab=classes` | Class list with payments | `useTeacherClasses` |
| Salary | `/teachers/:id?tab=salary` | Salary calculations list | `useTeacherSalaryCalculations` |

## Key Hooks

### useTeacherProfile
Primary hook for the detail page - manages teacher data and tab state.

```typescript
const {
  teacher,              // Current teacher data
  isLoading,            // Initial load state
  error,                // Fetch error
  activeTab,            // Current tab: 'schedule' | 'classes' | 'salary'
  setActiveTab,         // Tab change handler
  overviewData,         // Overview metrics
  overviewLoading,      // Overview fetch state
  paymentSummary,       // Payment summary data
  isEditSheetOpen,      // Edit sheet visibility
  handleOpenEditSheet,
  handleCloseEditSheet,
  handleEditSuccess,
} = useTeacherProfile();
```

### useTeacherAcademicYear
Manages academic year context for filtering tab data.

```typescript
const {
  selectedYearId,       // Currently selected year ID
  selectedYear,         // Full year object
  setSelectedYearId,    // Change year
  years,                // All available years
  isLoading,            // Years loading
  isBetweenYears,       // True if current date is between years
  betweenYearsMessage,  // Message when between years
} = useTeacherAcademicYear();
```

## Tab: Classes (`tabs/classes/`)

```
classes/
├── index.ts
├── TeacherClassesTab.tsx           # Main tab component
├── ClassMetrics.tsx                # Summary metrics cards
├── ClassPaymentCard.tsx            # Class card with payment info
├── StudentPaymentRow.tsx           # Student row in payment card
├── useTeacherClasses.ts            # Data fetching hook
├── useTeacherClassesWithPayments.ts # Classes + payment data
└── schedule/
    ├── ScheduleStatsBar.tsx        # Schedule summary
    ├── TeacherScheduleGrid.tsx     # Weekly grid view
    └── useTeacherSchedule.ts       # Schedule data hook
```

## Tab: Lessons (`tabs/lessons/`)

```
lessons/
├── index.ts
├── TeacherLessonsTab.tsx           # Main tab component
├── TeacherLessonsTable.tsx         # Lessons data table
├── TeacherLessonsFilters.tsx       # Date range, class filters
├── LessonsStatsBar.tsx             # Lesson statistics
└── useTeacherLessons.ts            # Data fetching hook
```

## Tab: Schedule (`tabs/schedule/`)

```
schedule/
├── index.ts
├── TeacherScheduleTab.tsx          # Main tab component
└── calendar/
    ├── index.ts
    ├── calendarTypes.ts            # Calendar type definitions
    ├── calendarUtils.ts            # Date/time utilities
    ├── LessonsCalendar.tsx         # Calendar wrapper
    ├── LessonsCalendarWeekly.tsx   # Week view
    ├── LessonsCalendarMonthly.tsx  # Month view
    ├── LessonsCalendarFilters.tsx  # View mode, date navigation
    ├── LessonsCalendarNavigation.tsx # Prev/next/today
    ├── LessonSlot.tsx              # Individual lesson cell
    ├── LessonDayCell.tsx           # Day cell in monthly view
    └── useLessonsCalendar.ts       # Calendar state hook
```

## Tab: Salary (`tabs/salary/`)

```
salary/
├── index.ts
├── TeacherSalaryTab.tsx            # Main tab component
├── SalaryEmptyState.tsx            # No calculations yet
├── SalarySummaryCards.tsx          # Summary statistics
├── SalaryBreakdownTable.tsx        # Detailed breakdown
├── useTeacherSalary.ts             # Data hook
└── setup/
    ├── SalarySetupSheet.tsx        # Configure salary rules
    ├── SalaryPreviewCards.tsx      # Preview cards
    ├── salarySetupSchema.ts        # Zod validation
    └── useSalaryCalculations.ts    # Setup operations
```

## Tab: Salary Calculations (`tabs/salary-calculations/`)

```
salary-calculations/
├── index.ts
├── SalaryCalculationsTab.tsx       # Main tab - calculations list
├── SalaryPreviewCard.tsx           # Preview for upcoming month
├── dialogs/
│   ├── GenerateSalaryDialog.tsx    # Generate new calculation
│   ├── ApproveSalaryDialog.tsx     # Approve with optional adjustment
│   └── ReopenSalaryDialog.tsx      # Reopen approved calculation
└── schemas/
    └── salaryDialogSchemas.ts      # Zod schemas for dialogs
```

## Academic Year Filtering

All tabs filter data by selected academic year:

```typescript
<TeacherClassesTab
  teacherId={teacher.id}
  academicYearId={selectedYearId}  // From useTeacherAcademicYear
  yearName={selectedYear?.name}
/>
```

## Data Loading Pattern

Each tab loads its own data lazily when activated:

```typescript
// In SalaryCalculationsTab
useEffect(() => {
  if (isActive && academicYearId) {
    loadCalculations(academicYearId);
  }
}, [isActive, academicYearId]);
```

## Anti-Patterns

| Wrong | Correct |
|-------|---------|
| Load all tab data upfront | Lazy load per-tab |
| Ignore academic year context | Filter by `selectedYearId` |
| Store tab state in Redux | Use URL query params or local state |
| Create custom header | Use `TeacherPageHeader` |

## Related Documentation

- **Domain Overview:** [../CLAUDE.md](../CLAUDE.md)
- **Shared Hooks:** [../_shared/CLAUDE.md](../_shared/CLAUDE.md)
- **Salary Calculation Detail:** [../salary-calculation-detail-page/CLAUDE.md](../salary-calculation-detail-page/CLAUDE.md)
