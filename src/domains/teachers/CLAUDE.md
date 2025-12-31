# Teachers Management Domain - ThinkEnglish

> Orientation guide for the Teachers domain. Refactoring to parity with Students/Classes domains is ~85% complete.

## Quick Reference

| Resource | Purpose |
|----------|---------|
| **Agent:** `backend-specialist` | Backend investigation (no dedicated teacher agent yet) |
| **Backend:** `think-english-api/src/Api/Features/Teachers/` | 11 endpoints + 8 shared contract files |

## Domain Purpose

Manages teacher profiles, subject assignments, and class associations.

**Core Entities:** Teacher, Subject

**Related Domains:** Classes (via teacher assignments), Lessons, Attendance

## Directory Structure

Uses **flow-based organization** (by route/page) for better navigability.

```
teachers/
├── CLAUDE.md                    # This file (orientation)
├── teachersSlice.ts             # Redux slice (dual-state pattern)
├── index.ts                     # Domain exports
├── _shared/                     # Shared across all pages
│   ├── components/              # TeacherLoading
│   │   ├── TeacherLoading.tsx
│   │   └── index.ts
│   ├── hooks/                   # useTeachers, useTeacherManagement
│   │   ├── useTeachers.ts
│   │   ├── useTeacherManagement.ts
│   │   └── index.ts
│   └── index.ts
├── list-page/                   # /teachers route
│   ├── TeacherTable.tsx         # Table view
│   ├── TeacherCard.tsx          # Card view
│   ├── components/              # TeacherFilters
│   │   ├── TeacherFilters.tsx
│   │   └── index.ts
│   ├── dialogs/                 # CreateTeacherSheet
│   │   ├── CreateTeacherSheet.tsx
│   │   └── index.ts
│   └── index.ts
├── detail-page/                 # /teachers/:id route
│   ├── TeacherProfilePage.tsx   # Main profile page with tabs
│   ├── useTeacherProfile.ts     # Profile data hook
│   ├── layout/                  # TeacherProfileHeader, TeacherBasicInfo
│   │   ├── TeacherProfileHeader.tsx
│   │   ├── TeacherBasicInfo.tsx
│   │   └── index.ts
│   ├── dialogs/                 # EditTeacherSheet
│   │   ├── EditTeacherSheet.tsx
│   │   └── index.ts
│   ├── tabs/
│   │   ├── overview/            # 3 profile cards (Classes, Students, Schedule)
│   │   │   ├── TeacherOverview.tsx
│   │   │   ├── ClassesCard.tsx
│   │   │   ├── StudentsCard.tsx
│   │   │   ├── ScheduleCard.tsx
│   │   │   └── index.ts
│   │   ├── details/             # Personal info, bio sections
│   │   │   ├── TeacherDetailsTab.tsx
│   │   │   ├── sections/
│   │   │   ├── hooks/
│   │   │   └── index.ts
│   │   ├── classes/             # Assigned classes with filters
│   │   │   ├── TeacherClassesTab.tsx
│   │   │   ├── useTeacherClasses.ts
│   │   │   └── index.ts
│   │   ├── schedule/            # Weekly schedule grid
│   │   │   ├── TeacherScheduleTab.tsx
│   │   │   ├── TeacherScheduleGrid.tsx
│   │   │   ├── ScheduleStatsBar.tsx
│   │   │   ├── useTeacherSchedule.ts
│   │   │   └── index.ts
│   │   └── students/            # All students taught
│   │       ├── TeacherStudentsTab.tsx
│   │       ├── TeacherStudentsTable.tsx
│   │       ├── useTeacherStudents.ts
│   │       └── index.ts
│   └── index.ts
└── form-page/                   # Create/edit teacher forms
    ├── forms/
    │   ├── TabbedTeacherFormContent.tsx
    │   ├── tabs/
    │   │   ├── PersonalInformationTab.tsx
    │   │   ├── ProfessionalInformationTab.tsx
    │   │   └── index.ts
    │   └── index.ts
    ├── hooks/
    │   ├── useTeacherForm.ts
    │   ├── useTeacherFormPage.ts
    │   └── index.ts
    └── index.ts
```

## Key Files

| Purpose | Path |
|---------|------|
| Redux Slice | `teachersSlice.ts` |
| Primary Hook | `_shared/hooks/useTeachers.ts` |
| Management Hook | `_shared/hooks/useTeacherManagement.ts` |
| Profile Page | `detail-page/TeacherProfilePage.tsx` |
| Profile Hook | `detail-page/useTeacherProfile.ts` |
| API Service | `../../services/teacherApiService.ts` |
| Types | `../../types/api/teacher.ts` |
| Validation | `../../utils/validation/teacherValidators.ts` |

## Key Conventions

### 1. Dual-State Redux Pattern
Maintain separate `teachers` (full list) and `searchResults` arrays with `isSearchMode` toggle. Creating/updating/deleting must update BOTH arrays.

### 2. Subject Association
Each teacher is associated with a subject. Subjects are loaded separately and used for filtering and display.

### 3. Email Availability Check
Form includes real-time email availability checking with debounced API calls.

### 4. Lazy Loading
All detail page tabs use lazy loading - data is fetched only when a tab is activated:
- Overview: Loaded via `useTeacherProfile`
- Classes: `useTeacherClasses`
- Schedule: `useTeacherSchedule`
- Students: `useTeacherStudents`

## Anti-Patterns (NEVER DO)

### State Management

| Wrong | Correct |
|-------|---------|
| Mix search results with all teachers | Use `isSearchMode` to differentiate |
| Forget to update both arrays | Update both `teachers` and `searchResults` |
| Use `useDispatch()` directly | Use `useAppDispatch()` from store/hooks.ts |

### Imports

| Wrong | Correct |
|-------|---------|
| Import from old `/components/` paths | Import from flow-based paths (`_shared/`, `list-page/`, etc.) |
| Import types from random locations | Import from `teachersSlice.ts` or `types/api/teacher.ts` |

## Common Tasks

| Task | Where to Start |
|------|----------------|
| Update list table | `list-page/TeacherTable.tsx` |
| Update filters | `list-page/components/TeacherFilters.tsx` |
| Modify create form | `form-page/forms/TabbedTeacherFormContent.tsx` |
| Update form validation | `utils/validation/teacherValidators.ts` |
| Add new Redux action | `teachersSlice.ts` |
| Modify profile page | `detail-page/TeacherProfilePage.tsx` |
| Update overview cards | `detail-page/tabs/overview/` |
| Update classes tab | `detail-page/tabs/classes/` |
| Update schedule tab | `detail-page/tabs/schedule/` |
| Update students tab | `detail-page/tabs/students/` |

## API Endpoints (11 Total)

**CRUD:**
- `POST /api/teachers` - Create teacher
- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/{id}` - Get by ID
- `PUT /api/teachers/{id}` - Update teacher
- `DELETE /api/teachers/{id}` - Delete teacher
- `GET /api/teachers/search` - Search with filters

**Utilities:**
- `GET /api/teachers/email-available` - Check email availability

**Profile Tabs (Lazy Loading):**
- `GET /api/teachers/{id}/overview` - Overview metrics (classes, students, schedule stats)
- `GET /api/teachers/{id}/classes` - Assigned classes with schedule slots
- `GET /api/teachers/{id}/schedule` - Weekly teaching schedule
- `GET /api/teachers/{id}/students` - All students taught

## Refactoring Status

This domain has been refactored to achieve parity with Students (76 files) and Classes (74 files).

| Phase | Description | Status |
|-------|-------------|--------|
| 3.1 | Foundation - Flow-based structure | ✅ COMPLETE |
| 3.2 | Detail Page Foundation | ✅ COMPLETE |
| 3.3 | Overview Tab + Profile Cards | ✅ COMPLETE |
| 3.4 | Details Tab | ✅ COMPLETE |
| 3.5 | Classes Tab | ✅ COMPLETE |
| 3.6 | Schedule Tab | ✅ COMPLETE |
| 3.7 | Students Tab | ✅ COMPLETE |
| 3.8 | Form Enhancements | ✅ COMPLETE |
| 3.9 | Polish & Testing | ⏳ PENDING |

**Current Status:** ~85% complete (58 frontend files, 20 backend files)

See `TEACHER_REFACTORING_PLAN.md` in project root for full details.

## Verification

```bash
# Frontend
cd think-english-ui
npm run build  # or: npx tsc --noEmit

# Check for anti-patterns (should return nothing)
grep -r "useDispatch()" --include="*.tsx" src/domains/teachers
grep -r ": any" --include="*.ts" src/domains/teachers
```

## Related Documentation

- **Main UI Guide:** [../../CLAUDE.md](../../CLAUDE.md)
- **Root Project:** [../../../../CLAUDE.md](../../../../CLAUDE.md)
- **Students Domain (reference):** [../students/CLAUDE.md](../students/CLAUDE.md)
- **Classes Domain (reference):** [../classes/CLAUDE.md](../classes/CLAUDE.md)
- **Refactoring Plan:** [../../../../TEACHER_REFACTORING_PLAN.md](../../../../TEACHER_REFACTORING_PLAN.md)

---

*Last updated: 2025-12-31 - Phases 3.1-3.8 Complete*
