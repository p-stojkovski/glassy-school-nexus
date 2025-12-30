# Class Management Domain - ThinkEnglish

> Orientation guide for the Classes domain. For deep dives, see the specialist agent and skill.

## Quick Reference

| Resource | Purpose |
|----------|---------|
| **Agent:** `classes-domain-specialist` | Full-stack investigation, troubleshooting, implementation |
| **Skill:** `classes-domain-reference` | Auto-injected quick reference during active work |
| **Backend:** `think-english-api/src/Api/Features/Classes/` | 21 endpoints + 13 shared contract files |

## Domain Purpose

Manages classes, schedules, student enrollments, lesson tracking, and student progress monitoring.

**Core Entities:** Class, Schedule Slots, Enrollments, Lessons, Student Progress

**Related Domains:** Classrooms, Students, Teachers, Subjects, Lessons

## Directory Structure

Uses **flow-based organization** (by route/page) for better navigability.

```
classes/
├── CLAUDE.md                    # This file (orientation)
├── classesSlice.ts              # Redux slice (dual-state pattern)
├── _shared/                     # Shared across all pages
│   ├── components/              # ClassLoading, ScheduleConflictPanel, ActiveFilterChips
│   ├── hooks/                   # useClasses, useScheduleConflictCheck, useStudentProgressData
│   └── utils/                   # scheduleUtils, classBreadcrumbs, scheduleValidationUtils
├── list-page/                   # /classes route
│   ├── ClassesPage.tsx          # Main list page
│   ├── components/              # ClassTable, ClassGrid, ClassFilters
│   └── dialogs/                 # CreateClassSheet, DisableClassDialog, EnableClassDialog
├── detail-page/                 # /classes/:id route
│   ├── useClassPage.ts          # Detail page state management
│   ├── useClassLessonContext.ts # Current/next lesson determination
│   ├── layout/                  # ClassPageHeader
│   ├── dialogs/                 # EditClassInfoDialog, EditClassDetailsSheet
│   ├── tabs/
│   │   ├── students/            # StudentsTab, StudentProgressTable, CapacityValidationPanel
│   │   ├── schedule/            # ScheduleTab, WeeklyScheduleGrid, ArchivedSchedulesSection
│   │   ├── lessons/             # LessonsTab
│   │   └── info/                # InfoTab, ReadOnly* components
│   └── teaching/                # TeachingModePage
├── form-page/                   # /classes/new, /classes/:id/edit routes
│   ├── ClassFormPage.tsx        # Form page container
│   ├── ClassFormContent.tsx     # Form layout
│   ├── useClassFormPage.ts      # Form state management
│   └── tabs/                    # BasicInfoTab, ScheduleEnrollmentTab, AdditionalDetailsTab
└── schemas/                     # Zod validation schemas
    └── classValidators.ts
```

## Key Files

| Purpose | Path |
|---------|------|
| Redux Slice | `classesSlice.ts` |
| Primary Hook | `_shared/hooks/useClasses.ts` |
| Detail Page Hook | `detail-page/useClassPage.ts` |
| Form Page Hook | `form-page/useClassFormPage.ts` |
| Student Data Hook | `_shared/hooks/useStudentProgressData.ts` |
| API Service | `../../services/classApiService.ts` |
| Types | `../../types/api/class.ts` |
| Validation | `schemas/classValidators.ts` |

## Key Conventions

### 1. Dual-State Redux Pattern
Maintain separate `classes` (full list) and `searchResults` arrays with `isSearchMode` toggle. Creating/updating/deleting must update BOTH arrays.

### 2. Lazy Loading Architecture
- **Page load:** Basic info only (fast)
- **Tab switch:** Schedule, additional details
- **Row expansion:** Student lesson details
- **Section expansion:** Archived schedules

### 3. Schedule Archival System
Schedules use soft-delete with `is_obsolete` flag. Never hard-delete schedules with associated lessons.

### 4. Enrollment Business Rules
- One active enrollment per student (no multi-class)
- Cannot exceed classroom capacity
- Cannot remove students with attendance records (use transfer)
- Transfer preserves historical data

### 5. Decentralized Data Loading
Dropdowns fetch their own data internally. Don't pass dropdown data from parent components.

### 6. Multi-Tab Unsaved Changes
Track unsaved changes across tabs with `registerTabUnsavedChanges()` to prevent data loss.

## Anti-Patterns (NEVER DO)

### State Management

| Wrong | Correct |
|-------|---------|
| Mix search results with all classes | Use `isSearchMode` to differentiate |
| Forget to update both arrays | Update both `classes` and `searchResults` |
| Use `useDispatch()` directly | Use `useAppDispatch()` from store/hooks.ts |

### Data Loading

| Wrong | Correct |
|-------|---------|
| Load all class data upfront | Lazy load per-tab/per-section |
| Pass dropdown data from parent | Let dropdowns fetch their own data |

### Form Handling

| Wrong | Correct |
|-------|---------|
| Allow schedule slot overlaps | Validate with `validateNoOverlaps` |
| Lose unsaved changes on tab switch | Track with `registerTabUnsavedChanges` |

## Common Tasks

| Task | Where to Start |
|------|----------------|
| Add new class field | Use `classes-domain-specialist` agent |
| Fix schedule conflict | `_shared/components/ScheduleConflictPanel.tsx`, `_shared/utils/scheduleValidationUtils.ts` |
| Update student progress display | `detail-page/tabs/students/StudentProgressTable.tsx` |
| Modify enrollment logic | Backend: `ManageEnrollmentsEndpoint.cs` |
| Add/edit form validation | `schemas/classValidators.ts` |
| Add schedule slot | `detail-page/tabs/schedule/dialogs/AddScheduleSlotSidebar.tsx` |

## Verification

```bash
# Frontend
npm run type-check
npm run lint

# Check for anti-patterns (should return nothing)
grep -r "useDispatch()" --include="*.tsx" src/domains/classes
grep -r ": any" --include="*.ts" src/domains/classes
```

## Related Documentation

- **Main UI Guide:** [../../CLAUDE.md](../../CLAUDE.md)
- **Root Project:** [../../../../CLAUDE.md](../../../../CLAUDE.md)
- **Architecture Patterns:** `.claude/skills/thinkienglish-conventions/SKILL.md`
- **UI/UX Design:** `.claude/skills/ui-ux-reference/SKILL.md`

---

*Last updated: 2025-12-30*
