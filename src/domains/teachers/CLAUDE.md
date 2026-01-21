# Teachers Management Domain - ThinkEnglish

> Orientation guide and navigator for the Teachers domain. Each subfolder has its own detailed CLAUDE.md.

## Quick Reference

| Resource | Purpose |
|----------|---------|
| **Agent:** `teachers-domain-specialist` | Full-stack investigation, troubleshooting, implementation |
| **Skill:** `teachers-domain-reference` | Auto-injected quick reference during active work |
| **Backend:** `think-english-api/src/Api/Features/Teachers/` | 21+ endpoints + shared contract files |

## Domain Purpose

Manages teacher profiles, subject assignments, class associations, schedules, and **salary calculations** (variable pay based on lessons taught).

**Core Entities:** Teacher, Subject, SalaryCalculation, SalaryRules

**Related Domains:** Classes (via assignments), Lessons, Attendance, Payments

## Directory Structure

Uses **flow-based organization** (by route/page) for better navigability.

```
teachers/
├── CLAUDE.md                         # This file (overview + navigator)
├── teachersSlice.ts                  # Redux slice (dual-state + salary state)
├── index.ts                          # Domain exports
│
├── _shared/                          # Shared across all pages
│   ├── CLAUDE.md                     # Shared components, hooks, types docs
│   ├── components/                   # TeacherLoading
│   ├── hooks/                        # useTeachers, useTeacherCRUD, useTeacherManagement
│   ├── types/                        # salaryCalculation.types.ts
│   └── utils/                        # teacherBreadcrumbs
│
├── list-page/                        # /teachers route
│   ├── CLAUDE.md                     # List page documentation
│   ├── TeacherTable.tsx              # Table view
│   ├── TeacherCard.tsx               # Card view
│   ├── components/                   # TeacherFilters, TeacherHeader, TeacherEmptyState
│   └── dialogs/                      # CreateTeacherSheet
│
├── detail-page/                      # /teachers/:id route
│   ├── CLAUDE.md                     # Detail page documentation
│   ├── TeacherProfilePage.tsx        # Main profile page with tabs
│   ├── useTeacherProfile.ts          # Profile data hook
│   ├── layout/                       # TeacherProfileHeader, TeacherBasicInfo, AcademicYearSelector
│   ├── dialogs/                      # EditTeacherSheet
│   ├── hooks/                        # useTeacherAcademicYear, salary hooks
│   └── tabs/
│       ├── classes/                  # Classes + schedule + payments
│       ├── lessons/                  # Lessons tab with filters
│       ├── schedule/                 # Calendar view (weekly/monthly)
│       ├── salary/                   # Salary overview + setup
│       └── salary-calculations/      # Monthly salary calculations
│
├── form-page/                        # /teachers/new, /teachers/:id/edit routes
│   ├── CLAUDE.md                     # Form page documentation
│   ├── forms/                        # TabbedTeacherFormContent
│   │   └── tabs/                     # PersonalInformationTab, ProfessionalInformationTab
│   └── hooks/                        # useTeacherForm, useTeacherFormPage
│
└── salary-calculation-detail-page/   # /teachers/:id/salary-calculations/:calcId route
    ├── CLAUDE.md                     # Salary calculation detail docs
    ├── SalaryCalculationDetailPage.tsx
    ├── components/                   # Header, Summary, Breakdown, AuditLog
    └── hooks/                        # useTeacherSalaryCalculationDetailPage, useAuditLog
```

## Subfolder Documentation

| Folder | CLAUDE.md | Description |
|--------|-----------|-------------|
| `_shared/` | [_shared/CLAUDE.md](_shared/CLAUDE.md) | Shared hooks, components, types, utilities |
| `list-page/` | [list-page/CLAUDE.md](list-page/CLAUDE.md) | Teacher list with filters, table/card views |
| `detail-page/` | [detail-page/CLAUDE.md](detail-page/CLAUDE.md) | Profile page with 5 tabs |
| `form-page/` | [form-page/CLAUDE.md](form-page/CLAUDE.md) | Create/edit teacher forms |
| `salary-calculation-detail-page/` | [salary-calculation-detail-page/CLAUDE.md](salary-calculation-detail-page/CLAUDE.md) | Individual salary calculation details |

## Key Files (Root Level)

| Purpose | Path |
|---------|------|
| Redux Slice | `teachersSlice.ts` |
| API Service | `../../services/teacherApiService.ts` |
| Types | `../../types/api/teacher.ts` |
| Validation | `../../utils/validation/teacherValidators.ts` |

## Key Conventions

### 1. Dual-State Redux Pattern
Maintain separate `teachers` (full list) and `searchResults` arrays with `isSearchMode` toggle. Creating/updating/deleting must update BOTH arrays.

### 2. Salary State Management
The slice also manages salary-related state:
- `salaryCalculations.items` - List of salary calculations
- `salaryCalculationDetail` - Current calculation detail
- `salaryPreview` - Preview before generation
- `salaryAuditLogs` - Audit trail

### 3. Academic Year Context
Detail page uses `useTeacherAcademicYear` to filter data by academic year. The selector in the header controls which year's data is displayed.

### 4. Lazy Loading by Tab
Each detail page tab loads its own data independently to optimize performance.

## API Endpoints Summary

**CRUD (6):** Create, GetAll, GetById, Update, Delete, CheckEmailAvailable

**Profile Tabs (5):** Overview, Classes, ClassesPaymentSummary, Schedule, Students

**Employment & Base Salary (4):** GetEmploymentSettings, GetBaseSalary, GetBaseSalaryHistory, SetBaseSalary

**Salary Config (3):** GetSalaryConfig, SetSalaryConfig, UpdateSalaryConfig

**Salary Preview (2):** GetTeacherSalary, GetTeacherSalaryPreview

**Teacher Lessons (1):** GetTeacherLessons

**Salary Calculations (5, in TeacherSalaries feature):** GetCalculations, GenerateCalculation, GetCalculationDetail, ApproveCalculation, ReopenCalculation

## Anti-Patterns (NEVER DO)

| Wrong | Correct |
|-------|---------|
| Mix search results with all teachers | Use `isSearchMode` to differentiate |
| Forget to update both arrays | Update both `teachers` and `searchResults` |
| Use `useDispatch()` directly | Use `useAppDispatch()` from store/hooks.ts |
| Import from old paths | Import from flow-based paths (`_shared/`, `list-page/`, etc.) |

## Verification

```bash
# Frontend
cd think-english-ui
npm run type-check
npm run lint

# Check for anti-patterns (should return nothing)
grep -r "useDispatch()" --include="*.tsx" src/domains/teachers
grep -r ": any" --include="*.ts" src/domains/teachers
```

## Related Documentation

- **Main UI Guide:** [../../CLAUDE.md](../../CLAUDE.md)
- **Root Project:** [../../../../CLAUDE.md](../../../../CLAUDE.md)
- **Architecture Patterns:** `.claude/skills/thinkienglish-conventions/SKILL.md`
- **UI/UX Design:** `.claude/skills/ui-ux-reference/SKILL.md`
- **Students Domain (reference):** [../students/CLAUDE.md](../students/CLAUDE.md)
- **Classes Domain (reference):** [../classes/CLAUDE.md](../classes/CLAUDE.md)

---

*Last updated: 2026-01-21*
