# Students Domain - Detail Page (detail-page/)

> The `/students/:id` route displaying a student's profile with tabbed sections and inline editing.

**Parent:** [../CLAUDE.md](../CLAUDE.md)

## Directory Structure

```
detail-page/
├── CLAUDE.md                           # This file
├── index.ts                            # Barrel exports
├── StudentProfilePage.tsx              # Main page component with tabs
├── useStudentPage.ts                   # Detail page state management
├── useStudentProfile.ts                # Profile data hook
├── layout/
│   ├── index.ts
│   ├── StudentHeader.tsx               # Page header with breadcrumbs
│   ├── StudentProfileHeader.tsx        # Profile card header
│   └── StudentBasicInfo.tsx            # Basic info display card
├── dialogs/
│   ├── index.ts
│   └── EditStudentSheet.tsx            # Edit student side sheet
└── tabs/
    ├── index.ts
    ├── overview/                       # Overview tab - 5 summary cards
    ├── details/                        # Details tab - section-based editing
    ├── classes/                        # Classes tab - enrollment history
    ├── payments/                       # Payments tab - payment history
    ├── attendance/                     # Attendance tab - records
    └── grades/                         # Grades tab - academic records
```

## Tabs Overview

| Tab | Route | Description | Key Component |
|-----|-------|-------------|---------------|
| Overview | `/students/:id` (default) | 5 summary cards | `StudentOverview` |
| Details | `/students/:id?tab=details` | Section-based editing | `StudentDetailsTab` |
| Classes | `/students/:id?tab=classes` | Enrollment history | `StudentClassesTab` |
| Payments | `/students/:id?tab=payments` | Payment history | `StudentPaymentsTab` |
| Attendance | `/students/:id?tab=attendance` | Attendance records | `StudentAttendanceTab` |
| Grades | `/students/:id?tab=grades` | Academic grades | `StudentGradesTab` |

## Key Hooks

### useStudentPage

Primary hook for the detail page - manages student data and tab state.

```typescript
const {
  student,              // Current student data
  isLoading,            // Initial load state
  error,                // Fetch error
  activeTab,            // Current tab
  setActiveTab,         // Tab change handler
  isEditSheetOpen,      // Edit sheet visibility
  openEditSheet,
  closeEditSheet,
} = useStudentPage();
```

### useStudentProfile

Manages profile data and overview loading.

```typescript
const {
  student,
  overviewData,         // Overview card data
  overviewLoading,      // Overview loading state
  refreshProfile,
} = useStudentProfile(studentId);
```

## Tab: Overview (`tabs/overview/`)

Displays 5 summary cards with student information.

```
overview/
├── index.ts
├── StudentOverview.tsx           # Main container
├── ProfileContactsCard.tsx       # Contact information
├── AttendanceCard.tsx            # Attendance summary
├── PerformanceCard.tsx           # Academic performance
├── BillingCard.tsx               # Payment status
├── HomeworkCard.tsx              # Homework completion
└── HorizontalStatusBar.tsx       # Status bar component
```

### Overview Cards

| Card | Data Source | Content |
|------|-------------|---------|
| `ProfileContactsCard` | Student record | Email, phone, guardian info |
| `AttendanceCard` | Overview endpoint | Attendance rate, recent records |
| `PerformanceCard` | Overview endpoint | Grades, progress metrics |
| `BillingCard` | Overview endpoint | Payment status, balance |
| `HomeworkCard` | Overview endpoint | Completion rate, pending |

## Tab: Details (`tabs/details/`) - Section-Based Editing

**This is a unique pattern in the Students domain.** Profile details are divided into editable sections.

```
details/
├── index.ts
├── StudentDetailsTab.tsx         # Main tab with sections
├── sections/
│   ├── index.ts
│   ├── EditableSectionWrapper.tsx    # Reusable section container
│   ├── StudentInfoSection.tsx        # Personal information
│   ├── GuardianInfoSection.tsx       # Guardian details
│   ├── FinancialInfoSection.tsx      # Financial & discount info
│   └── UnsavedChangesDialog.tsx      # Navigation warning
└── hooks/
    ├── index.ts
    └── useSectionEdit.ts             # Section edit state
```

### Section-Based Editing Pattern

Each section uses `EditableSectionWrapper` for inline edit mode:

```typescript
// EditableSectionWrapper provides view/edit toggle
<EditableSectionWrapper
  title="Personal Information"
  isEditing={isEditing}
  onEdit={startEdit}
  onSave={saveEdit}
  onCancel={cancelEdit}
  isSaving={isSaving}
>
  {isEditing ? <EditForm /> : <ViewContent />}
</EditableSectionWrapper>
```

### useSectionEdit Hook

```typescript
const {
  isEditing,            // Edit mode active
  editedData,           // Current edit state
  startEdit,            // Enter edit mode
  cancelEdit,           // Discard changes
  saveEdit,             // Save changes (async)
  updateField,          // Update single field
  isSaving,             // Save in progress
  hasUnsavedChanges,    // Dirty state
} = useSectionEdit({
  studentId,
  sectionType: 'personal' | 'guardian' | 'financial',
  initialData,
});
```

### Three Editable Sections

| Section | Component | Fields |
|---------|-----------|--------|
| Personal Info | `StudentInfoSection` | Name, DOB, email, phone, school info |
| Guardian Info | `GuardianInfoSection` | Guardian name, relationship, contact |
| Financial Info | `FinancialInfoSection` | Discounts, payment preferences |

## Tab: Classes (`tabs/classes/`)

```
classes/
├── index.ts
└── StudentClassesTab.tsx         # Class enrollment history
```

Displays class enrollment history with:
- Current class assignment
- Historical enrollments
- Status per enrollment

## Tab: Payments (`tabs/payments/`)

```
payments/
├── index.ts
└── StudentPaymentsTab.tsx        # Payment history
```

Shows payment history with:
- Payment records
- Outstanding obligations
- Payment status

## Tab: Attendance (`tabs/attendance/`)

```
attendance/
├── index.ts
└── StudentAttendanceTab.tsx      # Attendance records
```

## Tab: Grades (`tabs/grades/`)

```
grades/
├── index.ts
└── StudentGradesTab.tsx          # Grade records
```

## Data Loading Pattern

Two-tier lazy loading:

```typescript
// Tier 1: Page load - basic student info
useEffect(() => {
  loadStudent(studentId);
}, [studentId]);

// Tier 2: Tab activation - overview data
useEffect(() => {
  if (activeTab === 'overview') {
    loadOverviewData(studentId);
  }
}, [activeTab, studentId]);
```

## Layout Components

| Component | Purpose |
|-----------|---------|
| `StudentHeader` | Page header with breadcrumbs, actions |
| `StudentProfileHeader` | Profile card with avatar, name |
| `StudentBasicInfo` | Basic info summary card |

## Anti-Patterns

| Wrong | Correct |
|-------|---------|
| Load all tab data upfront | Lazy load per-tab |
| Create custom section editing | Use `EditableSectionWrapper` + `useSectionEdit` |
| Allow navigation with unsaved changes | Use `useUnsavedChangesWarning` |
| Skip overview card loading state | Show loading spinner per card |
| Direct API calls in tabs | Use hooks that dispatch to Redux |

## Related Documentation

- **Domain Overview:** [../CLAUDE.md](../CLAUDE.md)
- **Shared Hooks:** [../_shared/CLAUDE.md](../_shared/CLAUDE.md)
- **List Page:** [../list-page/CLAUDE.md](../list-page/CLAUDE.md)
- **Form Page:** [../form-page/CLAUDE.md](../form-page/CLAUDE.md)
- **Validation Schemas:** [../schemas/CLAUDE.md](../schemas/CLAUDE.md)
