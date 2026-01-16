# Class Management Domain - ThinkEnglish

> Orientation guide and navigator for the Classes domain. Each subfolder has its own detailed CLAUDE.md.

## Quick Reference

| Resource | Purpose |
|----------|---------|
| **Agent:** `classes-domain-specialist` | Full-stack investigation, troubleshooting, implementation |
| **Skill:** `classes-domain-reference` | Auto-injected quick reference during active work |
| **Backend:** `think-english-api/src/Api/Features/Classes/` | 26 endpoints + shared contract files |

## Domain Purpose

Manages classes, schedules, student enrollments, lesson tracking, and student progress monitoring.

**Core Entities:** Class, Schedule Slots, Enrollments, Lessons, Student Progress

**Related Domains:** Classrooms, Students, Teachers, Subjects, Lessons

## Directory Structure

Uses **flow-based organization** (by route/page) for better navigability.

```
classes/
├── CLAUDE.md                         # This file (overview + navigator)
├── classesSlice.ts                   # Redux slice (dual-state pattern)
├── index.ts                          # Domain exports
│
├── _shared/                          # Shared across all pages
│   ├── CLAUDE.md                     # Shared components, hooks, types docs
│   ├── components/                   # ClassLoading, ScheduleConflictPanel, ActiveFilterChips
│   ├── hooks/                        # useClasses, useScheduleConflictCheck, useStudentProgressData
│   ├── types/                        # salaryRule.types.ts
│   └── utils/                        # scheduleUtils, classBreadcrumbs, scheduleValidationUtils
│
├── list-page/                        # /classes route
│   ├── CLAUDE.md                     # List page documentation
│   ├── ClassesPage.tsx               # Main list page
│   ├── components/                   # ClassTable, ClassGrid, ClassFilters
│   └── dialogs/                      # CreateClassSheet, DisableClassDialog, EnableClassDialog
│
├── detail-page/                      # /classes/:id route
│   ├── CLAUDE.md                     # Detail page documentation
│   ├── useClassPage.ts               # Detail page state management
│   ├── useClassLessonContext.ts      # Current/next lesson determination
│   ├── layout/                       # ClassPageHeader
│   ├── dialogs/                      # EditClassInfoDialog, EditClassDetailsSheet
│   ├── hooks/                        # useSalaryRules
│   ├── tabs/
│   │   ├── students/                 # StudentsTab, StudentProgressTable, CapacityValidationPanel
│   │   ├── schedule/                 # ScheduleTab, WeeklyScheduleGrid, ArchivedSchedulesSection
│   │   ├── lessons/                  # LessonsTab
│   │   ├── salary-rules/             # SalaryRulesTab, ClassSalaryPreviewCard, CRUD dialogs
│   │   └── info/                     # InfoTab, ReadOnly* components
│   └── teaching/                     # TeachingModePage
│
├── form-page/                        # /classes/new, /classes/:id/edit routes
│   ├── CLAUDE.md                     # Form page documentation
│   ├── ClassFormPage.tsx             # Form page container
│   ├── ClassFormContent.tsx          # Form layout
│   ├── useClassFormPage.ts           # Form state management
│   └── tabs/                         # BasicInfoTab, ScheduleEnrollmentTab, AdditionalDetailsTab
│
└── schemas/                          # Validation schemas
    ├── CLAUDE.md                     # Schema documentation
    └── classValidators.ts            # Zod schemas and validation functions
```

## Subfolder Documentation

| Folder | CLAUDE.md | Description |
|--------|-----------|-------------|
| `_shared/` | [_shared/CLAUDE.md](_shared/CLAUDE.md) | Shared hooks, components, types, utilities |
| `list-page/` | [list-page/CLAUDE.md](list-page/CLAUDE.md) | Class list with filters, table/grid views |
| `detail-page/` | [detail-page/CLAUDE.md](detail-page/CLAUDE.md) | Detail page with 5 tabs |
| `form-page/` | [form-page/CLAUDE.md](form-page/CLAUDE.md) | Create/edit class forms |
| `schemas/` | [schemas/CLAUDE.md](schemas/CLAUDE.md) | Zod validation schemas |

## Key Files (Root Level)

| Purpose | Path |
|---------|------|
| Redux Slice | `classesSlice.ts` |
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

## API Endpoints Summary (26 Total)

**CRUD (8):** Create, Get, GetAll, Search, Update, UpdateBasicInfo, UpdateAdditionalDetails, Delete

**Lazy Loading (4):** GetSchedule, GetAdditionalDetails, GetStudentsSummary, GetStudentLessons

**Schedule (6):** CreateSlot, UpdateSlot, DeleteSlot, ValidateChanges, GetArchived, SuggestSlots

**Enrollment (1):** ManageEnrollments

**Status (2):** Disable, Enable

**Salary Rules (5):** GetSalaryRules, CreateSalaryRule, UpdateSalaryRule, DeleteSalaryRule, GetSalaryPreview

## Anti-Patterns (NEVER DO)

| Wrong | Correct |
|-------|---------|
| Mix search results with all classes | Use `isSearchMode` to differentiate |
| Forget to update both arrays | Update both `classes` and `searchResults` |
| Use `useDispatch()` directly | Use `useAppDispatch()` from store/hooks.ts |
| Import from old paths | Import from flow-based paths (`_shared/`, `list-page/`, etc.) |

## Verification

```bash
# Frontend
cd think-english-ui
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
- **Teachers Domain (reference):** [../teachers/CLAUDE.md](../teachers/CLAUDE.md)
- **Students Domain (reference):** [../students/CLAUDE.md](../students/CLAUDE.md)

---

*Last updated: 2026-01-15*
