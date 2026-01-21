# Students Management Domain - ThinkEnglish

> Orientation guide and navigator for the Students domain. Each subfolder has its own detailed CLAUDE.md.

## Quick Reference

| Resource | Purpose |
|----------|---------|
| **Agent:** `students-domain-specialist` | Full-stack investigation, troubleshooting, implementation |
| **Skill:** `students-domain-reference` | Auto-injected quick reference during active work |
| **Architecture:** `.claude/skills/students-domain-reference/ARCHITECTURE.md` | Deep architecture reference |
| **Backend:** `think-english-api/src/Api/Features/Students/` | 9 endpoints + 16 shared contract files |

## Domain Purpose

Manages student profiles, enrollment tracking, guardian information, discount management, and academic progress monitoring.

**Core Entities:** Student, Guardian (embedded), Financial Info (embedded), Discounts (via discount_types), Enrollments (via class_enrollments)

**Related Domains:**
- Classes (via `class_enrollments` table)
- Lessons (via `lesson_student_records` table)
- Discounts (via `discount_types` reference table)
- Payments (TODO - not implemented)
- Grades (TODO - not implemented)

## Directory Structure

Uses **flow-based organization** (by route/page) for better navigability (~70 files).

```
students/
├── CLAUDE.md                         # This file (overview + navigator)
├── studentsSlice.ts                  # Redux slice (dual-state pattern)
│
├── _shared/                          # Shared across all pages
│   ├── CLAUDE.md                     # Shared components, hooks docs
│   ├── components/
│   │   ├── StudentLoading.tsx        # Loading skeleton
│   │   └── StudentEmptyState.tsx     # Empty state
│   └── hooks/
│       ├── useStudents.ts            # Primary Redux state + API hook
│       ├── useStudentFilters.ts      # Client-side filtering logic
│       ├── useStudentFilterState.ts  # Filter UI state management
│       ├── useInitializeStudents.ts  # Lazy loading initialization
│       ├── useEmailAvailability.ts   # Email uniqueness validation
│       └── useUnsavedChangesWarning.ts # Navigation protection
│
├── list-page/                        # /students route
│   ├── CLAUDE.md                     # List page documentation
│   ├── StudentTable.tsx              # DataTable with sortable columns
│   ├── components/
│   │   ├── StudentFilters.tsx        # Search + filter dropdowns
│   │   ├── StudentPageHeader.tsx     # Title, view toggle, add button
│   │   └── ClassNameCell.tsx         # Class name display in table
│   ├── dialogs/
│   │   └── CreateStudentSheet.tsx    # Side panel (512px, 3 tabs)
│   └── hooks/
│       └── useStudentsListPage.ts    # List page initialization
│
├── detail-page/                      # /students/:id route
│   ├── CLAUDE.md                     # Detail page documentation
│   ├── StudentProfilePage.tsx        # Main profile page with tabs
│   ├── layout/
│   │   ├── StudentHeader.tsx         # Page header with breadcrumbs
│   │   ├── StudentProfileHeader.tsx  # Profile card header
│   │   └── StudentBasicInfo.tsx      # Basic info summary card
│   ├── dialogs/
│   │   └── EditStudentSheet.tsx      # Edit side panel (512px, 3 tabs)
│   └── tabs/
│       ├── overview/                 # 5 profile cards + HorizontalStatusBar
│       │   ├── StudentOverview.tsx
│       │   ├── ProfileContactsCard.tsx
│       │   ├── AttendanceCard.tsx
│       │   ├── HomeworkCard.tsx
│       │   ├── PerformanceCard.tsx
│       │   └── BillingCard.tsx
│       ├── details/                  # Section-based editing (unique to Students)
│       │   ├── StudentDetailsTab.tsx
│       │   ├── sections/
│       │   │   ├── EditableSectionWrapper.tsx
│       │   │   ├── StudentInfoSection.tsx
│       │   │   ├── GuardianInfoSection.tsx
│       │   │   └── FinancialInfoSection.tsx
│       │   └── hooks/
│       │       └── useSectionEdit.ts
│       ├── classes/                  # Class enrollment history
│       │   └── StudentClassesTab.tsx
│       ├── payments/                 # Payment history (TODO)
│       │   └── StudentPaymentsTab.tsx
│       ├── attendance/               # Attendance records (TODO)
│       │   └── StudentAttendanceTab.tsx
│       └── grades/                   # Grade records (TODO)
│           └── StudentGradesTab.tsx
│
├── form-page/                        # /students/new, /students/:id/edit routes
│   ├── CLAUDE.md                     # Form page documentation
│   ├── CreateStudentHeader.tsx       # Form page header
│   └── forms/
│       ├── TabbedStudentFormContent.tsx  # Main tabbed form
│       └── tabs/
│           ├── StudentInformationTab.tsx
│           ├── ParentGuardianTab.tsx
│           └── FinancialInformationTab.tsx
│
└── schemas/
    ├── CLAUDE.md                     # Validation documentation
    └── studentValidators.ts          # Re-export from utils/validation/
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
| Validation (centralized) | `../../utils/validation/studentValidators.ts` |
| Validation (re-export) | `schemas/studentValidators.ts` |

## Key Conventions

### 1. Dual-State Redux Pattern
```typescript
interface StudentsState {
  students: Student[];              // Full list from GetAll
  searchResults: Student[];         // Results when isSearchMode = true
  discountTypes: DiscountTypeDto[]; // Cached discount types
  isSearchMode: boolean;            // Toggle display source
  loading: { fetching, creating, updating, deleting, searching, fetchingDiscountTypes };
  errors: { fetch, create, update, delete, search, fetchDiscountTypes };
}
```
**Critical:** Creating/updating/deleting must update BOTH `students` and `searchResults` arrays.

### 2. Two-Tier Lazy Loading
- **Tier 1 (Page load):** Basic student info via `GET /students/:id`
- **Tier 2 (Tab switch):** Overview cards via `GET /students/:id/overview`, Classes via `GET /students/:id/classes`

**Note:** Unlike Classes (4-tier), Students uses simpler 2-tier loading.

### 3. Section-Based Editing (Unique to Students)
Profile details organized into three editable sections using `EditableSectionWrapper` + `useSectionEdit`:

| Section | Component | Fields |
|---------|-----------|--------|
| Personal Info | `StudentInfoSection` | firstName, lastName, email, phone, dateOfBirth, placeOfBirth |
| Guardian Info | `GuardianInfoSection` | parentContact, parentEmail |
| Financial Info | `FinancialInfoSection` | hasDiscount, discountTypeId, discountAmount, notes |

```typescript
const { isEditing, editedData, startEdit, cancelEdit, saveEdit, hasUnsavedChanges } = useSectionEdit(...);
```

### 4. Profile Overview Cards (5 Cards)
The Overview tab displays five summary cards from `GET /students/:id/overview`:

| Card | Key Metrics | Status Indicators |
|------|-------------|-------------------|
| ProfileContactsCard | Email, phone, parent contact | - |
| AttendanceCard | Total sessions, rate, trend | OnTrack/Warning/Critical |
| HomeworkCard | Completion rate, missing count | Ok/MissingWork |
| PerformanceCard | Student avg, class avg | OnTrack/NeedsSupport/NotAvailable |
| BillingCard | Total paid, balance, discount | Clear/Owes/NotImplemented |

### 5. Unsaved Changes Warning
`useUnsavedChangesWarning` hook prevents navigation when sections have unsaved edits. `UnsavedChangesDialog` prompts before losing changes.

### 6. Email Availability Validation
`useEmailAvailability` hook checks email uniqueness via `GET /students/email-available?email={email}&excludeStudentId={id}`.

## API Endpoints Summary

**CRUD (6):**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/students` | POST | Create student |
| `/api/students` | GET | Get all students |
| `/api/students/{id}` | GET | Get student by ID |
| `/api/students/{id}` | PUT | Update student |
| `/api/students/{id}` | DELETE | Delete student |
| `/api/students/search` | GET | Search with filters |

**Lazy Loading (2):**
| Endpoint | Purpose | Response |
|----------|---------|----------|
| `/api/students/{id}/overview` | Overview metrics | AttendanceOverview, HomeworkOverview, GradesOverview, BillingOverview |
| `/api/students/{id}/classes` | Class history | StudentClassEnrollment[] with per-class progress |

**Utilities (1):**
| Endpoint | Purpose |
|----------|---------|
| `/api/students/email-available` | Email uniqueness check |

## Anti-Patterns (NEVER DO)

| Wrong | Correct |
|-------|---------|
| Mix search results with all students | Use `isSearchMode` to differentiate |
| Forget to update both arrays | Update both `students` and `searchResults` |
| Use `useDispatch()` directly | Use `useAppDispatch()` from store/hooks.ts |
| Import from old paths | Import from flow-based paths (`_shared/`, `list-page/`, etc.) |
| Inline Zod schemas in components | Import from `schemas/studentValidators.ts` |
| Skip email availability check | Use `useEmailAvailability` before form submit |
| Create custom section editing | Use `useSectionEdit` + `EditableSectionWrapper` |

## Verification

```bash
# Frontend
cd think-english-ui
npm run type-check
npm run lint

# Check for anti-patterns (should return nothing)
grep -r "useDispatch()" --include="*.tsx" src/domains/students
grep -r ": any" --include="*.ts" src/domains/students
grep -r "z.object({" --include="*.tsx" src/domains/students  # No inline schemas
```

## Related Documentation

- **Main UI Guide:** [../../CLAUDE.md](../../CLAUDE.md)
- **Root Project:** [../../../../CLAUDE.md](../../../../CLAUDE.md)
- **Architecture Patterns:** `.claude/skills/thinkienglish-conventions/SKILL.md`
- **UI/UX Design:** `.claude/skills/ui-ux-reference/SKILL.md`
- **Students Skill:** `.claude/skills/students-domain-reference/SKILL.md`
- **Students Architecture:** `.claude/skills/students-domain-reference/ARCHITECTURE.md`
- **Teachers Domain (reference):** [../teachers/CLAUDE.md](../teachers/CLAUDE.md)
- **Classes Domain (reference):** [../classes/CLAUDE.md](../classes/CLAUDE.md)

---

*Last updated: 2026-01-21*
