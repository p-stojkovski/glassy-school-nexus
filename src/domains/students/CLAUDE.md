# Students Management Domain - ThinkEnglish

> Orientation guide for the Students domain. For deep dives, see the specialist agent and skill.

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
├── CLAUDE.md                    # This file (orientation)
├── studentsSlice.ts             # Redux slice (dual-state pattern)
├── _shared/                     # Shared across all pages
│   ├── components/              # StudentLoading, StudentEmptyState
│   ├── hooks/                   # useStudents, useStudentFilters, useInitializeStudents
│   └── utils/                   # Student utilities
├── list-page/                   # /students route
│   ├── StudentTable.tsx         # Table view
│   ├── StudentCard.tsx          # Card view
│   ├── components/              # StudentFilters, StudentPageHeader, ClassNameCell
│   ├── dialogs/                 # CreateStudentSheet
│   └── hooks/                   # useStudentsListPage
├── detail-page/                 # /students/:id route
│   ├── StudentProfilePage.tsx   # Main detail page
│   ├── useStudentPage.ts        # Detail page state management
│   ├── useStudentProfile.ts     # Profile data management
│   ├── layout/                  # StudentHeader, StudentBasicInfo, StudentProfileHeader
│   ├── dialogs/                 # EditStudentSheet
│   └── tabs/
│       ├── overview/            # 5 profile cards (Contacts, Attendance, Performance, Billing, Homework)
│       ├── details/             # Section-based editing (Personal, Guardian, Financial)
│       │   ├── sections/        # EditableSectionWrapper, StudentInfoSection, GuardianInfoSection, FinancialInfoSection
│       │   └── hooks/           # useSectionEdit
│       ├── classes/             # StudentClassesTab
│       ├── payments/            # StudentPaymentsTab
│       ├── attendance/          # StudentAttendanceTab
│       └── grades/              # StudentGradesTab
├── form-page/                   # /students/new, /students/:id/edit routes
│   ├── CreateStudentHeader.tsx  # Form page header
│   ├── forms/                   # StudentForm, StudentFormContent, TabbedStudentFormContent
│   │   └── tabs/                # StudentInformationTab, ParentGuardianTab, FinancialInformationTab
│   └── hooks/                   # useStudentForm, useStudentFormPage
└── schemas/                     # Zod validation schemas
    └── studentValidators.ts
```

## Key Files

| Purpose | Path |
|---------|------|
| Redux Slice | `studentsSlice.ts` |
| Primary Hook | `_shared/hooks/useStudents.ts` |
| Detail Page Hook | `detail-page/useStudentPage.ts` |
| Form Page Hook | `form-page/hooks/useStudentFormPage.ts` |
| Section Edit Hook | `detail-page/tabs/details/hooks/useSectionEdit.ts` |
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

### 5. Discount Management Integration
Students can have discounts assigned through `FinancialInfoSection`. Discount types are loaded via `loadDiscountTypes()` in `useStudents`.

### 6. Unsaved Changes Warning
`useUnsavedChangesWarning` hook prevents navigation when sections have unsaved edits. `UnsavedChangesDialog` prompts before losing changes.

## Anti-Patterns (NEVER DO)

### State Management

| Wrong | Correct |
|-------|---------|
| Mix search results with all students | Use `isSearchMode` to differentiate |
| Forget to update both arrays | Update both `students` and `searchResults` |
| Use `useDispatch()` directly | Use `useAppDispatch()` from store/hooks.ts |

### Data Loading

| Wrong | Correct |
|-------|---------|
| Load all student data upfront | Lazy load per-tab |
| Pass dropdown data from parent | Let components fetch their own data |

### Section Editing

| Wrong | Correct |
|-------|---------|
| Allow navigation with unsaved changes | Use `useUnsavedChangesWarning` |
| Create new section component types | Reuse `EditableSectionWrapper` pattern |

## Common Tasks

| Task | Where to Start |
|------|----------------|
| Add new student field | Use `students-domain-specialist` agent |
| Fix section editing issue | `detail-page/tabs/details/hooks/useSectionEdit.ts` |
| Update overview card | `detail-page/tabs/overview/` |
| Modify form validation | `schemas/studentValidators.ts` |
| Add filter option | `list-page/components/StudentFilters.tsx` |
| Update discount handling | `detail-page/tabs/details/sections/FinancialInfoSection.tsx` |

## API Endpoints (9 Total)

**CRUD:**
- `POST /api/students` - Create student
- `GET /api/students` - Get all students
- `GET /api/students/{id}` - Get by ID
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student
- `GET /api/students/search` - Search with filters

**Lazy Loading:**
- `GET /api/students/{id}/overview` - Overview card data
- `GET /api/students/{id}/classes` - Class enrollment history

**Utilities:**
- `GET /api/students/email-available` - Check email availability

## Verification

```bash
# Frontend
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

---

*Last updated: 2025-12-30*
