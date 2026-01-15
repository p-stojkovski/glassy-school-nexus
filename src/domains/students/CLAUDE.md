# Students Management Domain - ThinkEnglish

> Orientation guide and navigator for the Students domain. Each subfolder has its own detailed CLAUDE.md.

## Quick Reference

| Resource | Purpose |
|----------|---------|
| **Agent:** `students-domain-specialist` | Full-stack investigation, troubleshooting, implementation |
| **Skill:** `students-domain-reference` | Auto-injected quick reference during active work |
| **Backend:** `think-english-api/src/Api/Features/Students/` | 9 endpoints + 11 shared contract files |

## Domain Purpose

Manages student profiles, enrollment tracking, guardian information, discount management, and academic progress monitoring.

**Core Entities:** Student, Guardian, Financial Info, Discounts, Enrollments

**Related Domains:** Classes (via enrollments), Payments, Attendance, Lessons, Grades

## Directory Structure

Uses **flow-based organization** (by route/page) for better navigability.

```
students/
├── CLAUDE.md                         # This file (overview + navigator)
├── studentsSlice.ts                  # Redux slice (dual-state pattern)
│
├── _shared/                          # Shared across all pages
│   ├── CLAUDE.md                     # Shared components, hooks docs
│   ├── components/                   # StudentLoading, StudentEmptyState
│   ├── hooks/                        # useStudents, useStudentFilters, useInitializeStudents
│   └── utils/                        # Student utilities
│
├── list-page/                        # /students route
│   ├── CLAUDE.md                     # List page documentation
│   ├── StudentTable.tsx              # Table view
│   ├── StudentCard.tsx               # Card view
│   ├── components/                   # StudentFilters, StudentPageHeader
│   ├── dialogs/                      # CreateStudentSheet
│   └── hooks/                        # useStudentsListPage
│
├── detail-page/                      # /students/:id route
│   ├── CLAUDE.md                     # Detail page documentation
│   ├── StudentProfilePage.tsx        # Main profile page with tabs
│   ├── useStudentPage.ts             # Detail page state
│   ├── useStudentProfile.ts          # Profile data hook
│   ├── layout/                       # StudentHeader, StudentProfileHeader, StudentBasicInfo
│   ├── dialogs/                      # EditStudentSheet
│   └── tabs/
│       ├── overview/                 # 5 profile cards
│       ├── details/                  # Section-based editing (unique to Students)
│       ├── classes/                  # Class enrollment history
│       ├── payments/                 # Payment history
│       ├── attendance/               # Attendance records
│       └── grades/                   # Grade records
│
├── form-page/                        # /students/new, /students/:id/edit routes
│   ├── CLAUDE.md                     # Form page documentation
│   ├── CreateStudentHeader.tsx       # Form page header
│   ├── forms/                        # TabbedStudentFormContent
│   │   └── tabs/                     # StudentInformationTab, ParentGuardianTab, FinancialInformationTab
│   └── hooks/                        # useStudentForm, useStudentFormPage
│
└── schemas/                          # Zod validation schemas
    ├── CLAUDE.md                     # Validation documentation
    └── studentValidators.ts
```

## Subfolder Documentation

| Folder | CLAUDE.md | Description |
|--------|-----------|-------------|
| `_shared/` | [_shared/CLAUDE.md](_shared/CLAUDE.md) | Shared hooks, components, utilities |
| `list-page/` | [list-page/CLAUDE.md](list-page/CLAUDE.md) | Student list with filters, table/card views |
| `detail-page/` | [detail-page/CLAUDE.md](detail-page/CLAUDE.md) | Profile page with 6 tabs + section editing |
| `form-page/` | [form-page/CLAUDE.md](form-page/CLAUDE.md) | Create/edit student forms |
| `schemas/` | [schemas/CLAUDE.md](schemas/CLAUDE.md) | Zod validation schemas |

## Key Files (Root Level)

| Purpose | Path |
|---------|------|
| Redux Slice | `studentsSlice.ts` |
| API Service | `../../services/studentApiService.ts` |
| Types | `../../types/api/student.ts` |
| Validation | `schemas/studentValidators.ts` |

## Key Conventions

### 1. Dual-State Redux Pattern
Maintain separate `students` (full list) and `searchResults` arrays with `isSearchMode` toggle. Creating/updating/deleting must update BOTH arrays.

### 2. Two-Tier Lazy Loading
- **Page load:** Basic student info (fast)
- **Tab switch:** Overview cards, detailed sections

**Note:** Unlike Classes (4-tier), Students uses simpler 2-tier loading.

### 3. Section-Based Editing (Unique to Students)
Profile details are organized into three editable sections:
- **Personal Info:** Name, DOB, contact, school info
- **Guardian Info:** Parent/guardian details, emergency contacts
- **Financial Info:** Discounts, payment preferences

Each section uses `EditableSectionWrapper` with `useSectionEdit` hook for inline editing.

### 4. Profile Overview Cards (5 Cards)
The Overview tab displays five summary cards:
1. **ProfileContactsCard** - Contact information
2. **AttendanceCard** - Attendance summary
3. **PerformanceCard** - Academic performance
4. **BillingCard** - Payment status
5. **HomeworkCard** - Homework completion

### 5. Unsaved Changes Warning
`useUnsavedChangesWarning` hook prevents navigation when sections have unsaved edits. `UnsavedChangesDialog` prompts before losing changes.

## API Endpoints Summary

**CRUD (6):** Create, GetAll, GetById, Update, Delete, Search

**Lazy Loading (2):** GetOverview, GetClasses

**Utilities (1):** CheckEmailAvailable

## Anti-Patterns (NEVER DO)

| Wrong | Correct |
|-------|---------|
| Mix search results with all students | Use `isSearchMode` to differentiate |
| Forget to update both arrays | Update both `students` and `searchResults` |
| Use `useDispatch()` directly | Use `useAppDispatch()` from store/hooks.ts |
| Import from old paths | Import from flow-based paths (`_shared/`, `list-page/`, etc.) |

## Verification

```bash
# Frontend
cd think-english-ui
npm run type-check
npm run lint

# Check for anti-patterns (should return nothing)
grep -r "useDispatch()" --include="*.tsx" src/domains/students
grep -r ": any" --include="*.ts" src/domains/students
```

## Related Documentation

- **Main UI Guide:** [../../CLAUDE.md](../../CLAUDE.md)
- **Root Project:** [../../../../CLAUDE.md](../../../../CLAUDE.md)
- **Architecture Patterns:** `.claude/skills/thinkienglish-conventions/SKILL.md`
- **UI/UX Design:** `.claude/skills/ui-ux-reference/SKILL.md`
- **Teachers Domain (reference):** [../teachers/CLAUDE.md](../teachers/CLAUDE.md)
- **Classes Domain (reference):** [../classes/CLAUDE.md](../classes/CLAUDE.md)

---

*Last updated: 2026-01-12*
