# Classes Domain - Detail Page (detail-page/)

> The `/classes/:id` route displaying class details with tabbed sections.

**Parent:** [../CLAUDE.md](../CLAUDE.md)

## Directory Structure

```
detail-page/
├── CLAUDE.md                           # This file
├── index.ts                            # Barrel exports
├── useClassPage.ts                     # Main page state management
├── useClassLessonContext.ts            # Current/next lesson determination
├── layout/
│   ├── index.ts
│   └── ClassPageHeader.tsx             # Header with title, edit, tabs
├── dialogs/
│   ├── index.ts
│   ├── EditClassInfoDialog.tsx         # Quick edit for basic info
│   └── EditClassDetailsSheet.tsx       # Full edit sheet
├── hooks/
│   └── useSalaryRules.ts               # Salary rules CRUD + preview
├── tabs/
│   ├── index.ts
│   ├── info/                           # Info tab (read-only overview)
│   ├── students/                       # Students tab (progress tracking)
│   ├── schedule/                       # Schedule tab (time slots)
│   ├── lessons/                        # Lessons tab
│   └── salary-rules/                   # Salary rules tab
└── teaching/
    ├── index.ts
    └── TeachingModePage.tsx            # Teaching mode view
```

## Tabs Overview

| Tab | Route | Description | Key Components |
|-----|-------|-------------|----------------|
| Lessons | `/classes/:id` (default) | Lesson list and management | `LessonsTab` |
| Students | `/classes/:id?tab=students` | Student progress tracking | `StudentsTab`, `StudentProgressTable` |
| Schedule | `/classes/:id?tab=schedule` | Weekly schedule grid | `ScheduleTab`, `WeeklyScheduleGrid` |
| Info | `/classes/:id?tab=info` | Read-only class overview | `InfoTab`, `ReadOnly*` components |
| Salary Rules | `/classes/:id?tab=salary-rules` | Teacher salary rules | `SalaryRulesTab`, `ClassSalaryPreviewCard` |

## Key Hooks

### useClassPage
Primary hook for the detail page - manages class data, tabs, and edit mode.

```typescript
const {
  mode,                 // 'view' | 'edit'
  classData,            // ClassBasicInfoResponse | ClassResponse
  editData,             // ClassFormData | null
  activeTab,            // 'lessons' | 'students' | 'schedule' | 'info' | 'salary-rules'
  hasUnsavedChanges,    // Boolean
  loading,              // Initial load state
  error,                // Fetch error
  tabsWithUnsavedChanges, // Set<string>

  // Archived schedules
  archivedSchedules,    // ArchivedScheduleSlotResponse[]
  loadingArchived,      // Boolean
  archivedSchedulesExpanded, // Boolean

  // Actions
  setActiveTab,         // (tab: TabId) => void
  enterEditMode,        // () => void
  exitEditMode,         // () => void
  registerTabUnsavedChanges, // (tabId, hasChanges) => void
  loadArchivedSchedules, // () => Promise<void>
  toggleArchivedSchedules, // () => void
  refreshClassData,     // () => Promise<void>
} = useClassPage(classId);
```

### useClassLessonContext
Determines current or next upcoming lesson.

```typescript
const {
  currentLesson,        // LessonResponse | null
  nextLesson,           // LessonResponse | null
  isInProgress,         // Boolean - lesson currently happening
  timeUntilNext,        // string - "in 2 hours"
} = useClassLessonContext(classId);
```

### useSalaryRules
Manages salary rules CRUD and preview for the class.

```typescript
const {
  rules,                // ClassSalaryRule[]
  preview,              // ClassSalaryPreview | null
  loading,              // Loading state
  error,                // Error message

  // Actions
  loadRules,            // () => Promise<void>
  createRule,           // (data) => Promise<void>
  updateRule,           // (id, data) => Promise<void>
  deleteRule,           // (id) => Promise<void>
  loadPreview,          // () => Promise<void>
} = useSalaryRules(classId);
```

## Tab: Students (`tabs/students/`)

```
students/
├── index.ts
├── StudentsTab.tsx                 # Main tab component
├── StudentProgressTable.tsx        # Student progress data table
├── StudentProgressTablePresenter.tsx # Table UI (presentational)
├── StudentProgressChips.tsx        # Attendance/progress chips
├── StudentFilters.tsx              # Filter by status, progress
├── StudentLessonDetailsRow.tsx     # Expandable lesson details
├── StudentRowActionsMenu.tsx       # Row action menu
├── CapacityValidationPanel.tsx     # Enrollment capacity warning
├── PrivacyIndicator.tsx            # Privacy status indicator
└── dialogs/
    └── TransferStudentDialog.tsx   # Transfer student to another class
```

**Key Features:**
- Lazy loading of student lesson details (expand row to load)
- Capacity validation (cannot exceed classroom capacity)
- Transfer students between classes (preserves history)
- Progress tracking (attendance, grades)

## Tab: Schedule (`tabs/schedule/`)

```
schedule/
├── index.ts
├── ScheduleTab.tsx                 # Main tab component
├── ClassScheduleSection.tsx        # Active schedule section
├── WeeklyScheduleGrid.tsx          # Visual weekly grid
├── ArchivedSchedulesSection.tsx    # Collapsed archived schedules
└── dialogs/
    ├── index.ts
    ├── AddScheduleSlotSheet.tsx    # Add new schedule slot (uses FormSheet)
    └── EditScheduleSlotDialog.tsx  # Edit existing slot
```

**Key Features:**
- Visual weekly schedule grid
- Conflict checking before adding slots
- Archived schedules (soft-deleted with `is_obsolete`)
- Lesson generation on schedule changes

## Tab: Info (`tabs/info/`)

```
info/
├── index.ts
├── InfoTab.tsx                     # Main tab component
├── ReadOnlyClassOverview.tsx       # Basic class info display
├── ReadOnlyRequirements.tsx        # Requirements section
├── ReadOnlyLearningObjectives.tsx  # Objectives list
└── ReadOnlyMaterials.tsx           # Materials list
```

**Key Features:**
- Read-only view of class details
- Quick edit button opens EditClassInfoDialog

## Tab: Salary Rules (`tabs/salary-rules/`)

```
salary-rules/
├── index.ts
├── SalaryRulesTab.tsx              # Main tab component
├── ClassSalaryPreviewCard.tsx      # Preview upcoming salary
├── CreateSalaryRuleDialog.tsx      # Add new salary rule
├── EditSalaryRuleDialog.tsx        # Edit existing rule
└── DeleteSalaryRuleDialog.tsx      # Confirm delete
```

**Key Features:**
- Per-class salary rules for teachers
- Preview projected earnings
- Support for tiered rates based on student count

## Lazy Loading Pattern

Each tab loads its own data when activated:

```typescript
// In StudentsTab
useEffect(() => {
  if (isActive && classId) {
    loadStudentProgress();
  }
}, [isActive, classId]);

// Row expansion loads details
const handleRowExpand = async (studentId: string) => {
  await loadStudentDetails(studentId);
};
```

## Unsaved Changes Pattern

Track unsaved changes across tabs to prevent data loss:

```typescript
// In each tab that has editable content
useEffect(() => {
  registerTabUnsavedChanges('schedule', hasLocalChanges);
}, [hasLocalChanges, registerTabUnsavedChanges]);

// In useClassPage - warn before leaving
const hasAnyUnsavedChanges = tabsWithUnsavedChanges.size > 0;
```

## Anti-Patterns

| Wrong | Correct |
|-------|---------|
| Load all tab data upfront | Lazy load per-tab |
| Hard delete schedule slots with lessons | Use soft delete (is_obsolete) |
| Ignore capacity limits | Always check `CapacityValidationPanel` |
| Skip conflict check for schedule | Use `useScheduleConflictCheck` |
| Forget to register unsaved changes | Use `registerTabUnsavedChanges` |

## Related Documentation

- **Domain Overview:** [../CLAUDE.md](../CLAUDE.md)
- **Shared Hooks:** [../_shared/CLAUDE.md](../_shared/CLAUDE.md)
- **List Page:** [../list-page/CLAUDE.md](../list-page/CLAUDE.md)
- **Form Page:** [../form-page/CLAUDE.md](../form-page/CLAUDE.md)
- **Teaching Mode:** [./teaching/](./teaching/)
