# Class Management Domain - ThinkEnglish

> Comprehensive reference for class management features (classes, schedules, enrollment, student progress)

## Domain Overview

**Purpose:** Manages classes, their schedules, student enrollments, lesson tracking, and student progress monitoring.

**Core Entities:**
- **Class** - A course instance with subject, teacher, classroom, and schedule
- **Schedule Slots** - Day/time pairs defining when class meets
- **Enrollments** - Student memberships in classes
- **Lessons** - Generated from schedule slots with attendance/homework tracking
- **Student Progress** - Attendance, homework, and payment summaries per student

**Related Domains:**
- **Classrooms** ([classrooms/](../classrooms/)) - Physical room management (capacity, location)
- **Students** ([students/](../students/)) - Student roster and details
- **Teachers** ([teachers/](../teachers/)) - Teacher assignments
- **Subjects** ([subjects/](../subjects/)) - Course/subject catalog
- **Lessons** ([lessons/](../lessons/)) - Lesson conduct, attendance, homework

---

## Directory Structure

```
classes/
├── CLAUDE.md                           # This file
├── classesSlice.ts                     # Primary Redux slice (dual-state pattern, API-driven)
├── hooks/
│   ├── useClasses.ts                   # Primary hook for Redux integration
│   ├── useClassPage.ts                 # Class detail page state management
│   ├── useClassFormPage.ts             # Class create/edit form page
│   └── useClassLessonContext.ts        # Lesson context (current/next lesson)
├── components/
│   ├── list/                           # List view components
│   │   ├── ClassTable.tsx              # Table view of classes
│   │   └── ClassGrid.tsx               # Grid/card view of classes
│   ├── forms/                          # Form components
│   │   ├── ClassFormContent.tsx        # Main tabbed form (create/edit)
│   │   └── tabs/
│   │       ├── BasicClassInfoTab.tsx   # Name, subject, teacher, classroom
│   │       ├── ScheduleEnrollmentTab.tsx  # Schedule slots + student selection
│   │       └── AdditionalDetailsTab.tsx   # Requirements, objectives, materials
│   ├── tabs/                           # Detail page tabs
│   │   ├── ClassInfoTab.tsx            # View/edit basic info
│   │   ├── ClassScheduleTab.tsx        # Schedule grid + archived schedules
│   │   └── ClassStudentsTab.tsx        # Student progress + enrollment management
│   ├── detail/
│   │   └── ClassLessonsTab.tsx         # Lesson list with actions
│   ├── hero/
│   │   └── ClassHeroSection.tsx        # Progress circle + lesson CTA
│   ├── unified/
│   │   ├── ClassPageHeader.tsx         # Detail page header
│   │   └── CreateClassHeader.tsx       # Create mode header
│   ├── schedule/
│   │   ├── WeeklyScheduleGrid.tsx      # Visual calendar grid (Mon-Sun)
│   │   ├── AddScheduleSlotDialog.tsx   # Add slot with conflict checking
│   │   ├── EditScheduleSlotDialog.tsx  # Edit existing slot
│   │   ├── ScheduleConflictPanel.tsx   # Conflict display
│   │   ├── AddScheduleSlotSidebar.tsx  # Sidebar interface for adding
│   │   └── ArchivedSchedulesSection.tsx  # Obsolete schedules display
│   ├── sections/
│   │   ├── StudentProgressTable.tsx    # Main progress table with expandable rows
│   │   ├── StudentLessonDetailsRow.tsx # Expanded lesson details
│   │   ├── StudentProgressChips.tsx    # Visual attendance/homework chips
│   │   ├── StudentRowActionsMenu.tsx   # Student row actions
│   │   ├── PrivacyIndicator.tsx        # Discount/payment indicators
│   │   └── ClassScheduleSection.tsx    # Standalone schedule section
│   ├── dialogs/
│   │   ├── CreateClassSheet.tsx        # Side drawer for creating class
│   │   ├── EditClassInfoDialog.tsx     # Quick edit basic info
│   │   ├── DisableClassDialog.tsx      # Confirmation with impact summary
│   │   ├── EnableClassDialog.tsx       # Re-enable confirmation
│   │   └── TransferStudentDialog.tsx   # Transfer student to another class
│   ├── filters/
│   │   └── ClassFilters.tsx            # Search bar + filter dropdowns
│   ├── state/
│   │   └── ClassLoading.tsx            # Loading skeleton
│   └── students/
│       └── CapacityValidationPanel.tsx # Classroom capacity validation
└── utils/
    ├── scheduleUtils.ts                # sortSchedulesByDay()
    ├── scheduleValidationUtils.ts      # Schedule validation helpers
    └── classBreadcrumbs.ts             # buildClassBreadcrumbs()

classrooms/ (physical classroom management)
└── classroomsSlice.ts                  # Classroom Redux slice with name availability
```

---

## State Management

### Primary Slice: `classesSlice.ts`

**State Shape:**
```typescript
classes: {
  // Data collections
  classes: ClassResponse[],              // All classes from GetAll
  searchResults: ClassResponse[],        // Search results (when isSearchMode = true)
  selectedClass: ClassResponse | null,   // Currently selected class

  // Loading states (per operation)
  loading: {
    fetching: boolean,
    creating: boolean,
    updating: boolean,
    deleting: boolean,
    searching: boolean
  },

  // Error states (per operation)
  errors: {
    fetch: string | null,
    create: string | null,
    update: string | null,
    delete: string | null,
    search: string | null
  },

  // Search/filter
  searchQuery: string,
  searchParams: ClassSearchParams,
  isSearchMode: boolean  // True when search results visible
}
```

**Key Actions:**
- `setClasses(classes)` - Set all classes
- `addClass(class)` - Add new class (to both arrays if in search mode)
- `updateClass(class)` - Update class (in both arrays + selectedClass)
- `disableClass(id)` - Mark class as disabled
- `enableClass(id)` - Re-enable disabled class
- `deleteClass(id)` - Remove class from both arrays
- `setSelectedClass(class)` - Set selected class
- `setLoadingState(operation, loading)` - Set loading flag
- `setError(operation, error)` / `clearError(operation)` / `clearAllErrors()` - Error management
- `setSearchResults(results)` / `setSearchMode(isSearchMode)` - Search mode toggle
- `resetClassesState()` - Reset entire state

**Dual-State Pattern:**
- Maintains separate `classes` (full list) and `searchResults` collections
- `isSearchMode` determines which is displayed to UI
- Creating: adds to both if in search mode
- Updating: updates both arrays and selectedClass if applicable
- Deleting: removes from both arrays

---

## API Integration

### Service: [classApiService.ts](../../services/classApiService.ts)

**Singleton Instance:**
```typescript
export const classApiService = new ClassApiService();
```

**Core Methods:**

| Method | Signature | Returns |
|--------|-----------|---------|
| `getAllClasses()` | `() => Promise<ClassResponse[]>` | All classes (summary) |
| `getClassById(id)` | `(id: string) => Promise<ClassBasicInfoResponse>` | Basic info only |
| `searchClasses(params)` | `(params: ClassSearchParams) => Promise<ClassResponse[]>` | Search results |
| `createClass(request)` | `(request: CreateClassRequest) => Promise<ClassCreatedResponse>` | `{ id }` |
| `updateClass(id, request)` | `(id: string, request: UpdateClassRequest) => Promise<ClassResponse>` | Updated class |
| `deleteClass(id)` | `(id: string) => Promise<void>` | - |
| `disableClass(id)` | `(id: string) => Promise<DisableClassResponse>` | Impact summary |
| `enableClass(id)` | `(id: string) => Promise<EnableClassResponse>` | - |
| `getClassSchedule(id)` | `(id: string) => Promise<ScheduleSlotDto[]>` | Active schedule slots |
| `getArchivedSchedules(id)` | `(id: string) => Promise<ArchivedScheduleSlotResponse[]>` | Obsolete schedules |
| `getClassStudentsSummary(classId)` | `(classId: string) => Promise<StudentLessonSummary[]>` | Student progress summaries |
| `getClassStudentLessons(classId, studentId)` | `(classId: string, studentId: string) => Promise<StudentLessonDetail[]>` | Individual lesson details |
| `addStudentsToClass(classId, request)` | `(classId: string, request: ManageEnrollmentsRequest) => Promise<ManageEnrollmentsResponse>` | Added students |
| `removeStudentFromClass(classId, studentId)` | `(classId: string, studentId: string) => Promise<void>` | - |
| `transferStudent(classId, studentId, request)` | `(classId: string, studentId: string, request: TransferStudentRequest) => Promise<TransferStudentResponse>` | Transfer result |

**Error Handling:**
- Status-specific error messages (400, 404, 409, 500)
- Response normalization for array responses
- Conflict errors (409) handled specially

---

## TypeScript Types

### Location: [types/api/class.ts](../../types/api/class.ts)

**Request Types:**
- `CreateClassRequest` - Create new class
- `UpdateClassRequest` - Update class details
- `UpdateBasicInfoRequest` - Update name/description only
- `UpdateAdditionalDetailsRequest` - Update requirements/objectives/materials
- `ManageEnrollmentsRequest` - Add/remove students (`{ studentIds }`)
- `TransferStudentRequest` - Transfer student (`{ targetClassId, reason? }`)
- `CreateScheduleSlotRequest` - Add schedule slot

**Response Types:**
- `ClassResponse` - Full class summary (used in lists)
- `ClassBasicInfoResponse` - Basic info (name, subject, teacher, classroom)
- `ClassScheduleResponse` - Schedule slots only
- `ClassAdditionalDetailsResponse` - Requirements, objectives, materials
- `DisableClassResponse` - Impact summary (lessons deleted, enrollments inactive)
- `EnableClassResponse` - Re-enable confirmation
- `ManageEnrollmentsResponse` - Added/removed students
- `TransferStudentResponse` - Transfer confirmation
- `ArchivedScheduleSlotResponse` - Obsolete schedule with lesson counts

**Sub-Types:**
- `ScheduleSlotDto` - `{ dayOfWeek, startTime, endTime, isObsolete }`
- `LessonSummaryDto` - Lesson counts (total, scheduled, conducted, cancelled, makeup, noshow)
- `StudentLessonSummary` - Student progress summary
- `StudentLessonDetail` - Individual lesson details
- `StudentDiscountInfo` - Discount information (privacy-respecting)
- `StudentPaymentObligationInfo` - Payment obligation (privacy-respecting)
- `AttendanceSummary` - `{ present, absent, late, excused }`
- `HomeworkSummary` - `{ complete, partial, missing }`

**Search Parameters:**
```typescript
interface ClassSearchParams {
  searchTerm?: string;
  subjectId?: string;
  teacherId?: string;
  academicYearId?: string;
  onlyWithAvailableSlots?: boolean;
  includeDisabled?: boolean;
  includeAllYears?: boolean;
}
```

**API Paths:**
```typescript
ClassApiPaths = {
  BASE: '/api/classes',
  BY_ID: (id) => `/api/classes/${id}`,
  SEARCH: '/api/classes/search',
  DISABLE: (id) => `/api/classes/${id}/disable`,
  ENABLE: (id) => `/api/classes/${id}/enable`,
  ARCHIVED_SCHEDULES: (id) => `/api/classes/${id}/archived-schedules`,
  ENROLLMENTS: (id) => `/api/classes/${id}/enrollments`,
  BASIC_INFO: (id) => `/api/classes/${id}/basic-info`,
  ADDITIONAL_DETAILS: (id) => `/api/classes/${id}/additional-details`,
  SCHEDULE: (id) => `/api/classes/${id}/schedule`,
}
```

**Validation Rules:**
```typescript
ClassValidationRules = {
  NAME: { MAX_LENGTH: 100 },
  GUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  TIME_24H: /^([01]\d|2[0-3]):([0-5]\d)$/,
  ALLOWED_DAYS: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
}
```

---

## Form Validation

### Zod Schemas: [utils/validation/classValidators.ts](../../utils/validation/classValidators.ts)

**Schemas:**
```typescript
createClassSchema = z.object({
  name: z.string().min(1, 'Required').max(100),
  subjectId: z.string().uuid('Invalid subject'),
  teacherId: z.string().uuid('Invalid teacher'),
  classroomId: z.string().uuid('Invalid classroom'),
  description: z.string().optional(),
  requirements: z.string().optional(),
  objectives: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  schedule: z.array(z.object({
    dayOfWeek: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
    startTime: z.string().regex(TIME_24H, 'Invalid time format (HH:mm)'),
    endTime: z.string().regex(TIME_24H, 'Invalid time format (HH:mm)')
  })).refine(validateNoDuplicateSlots, 'Duplicate schedule slots')
    .refine(validateNoOverlaps, 'Schedule slots overlap on same day')
    .refine(validateEndAfterStart, 'End time must be after start time'),
  studentIds: z.array(z.string().uuid()).optional()
});

updateClassSchema = createClassSchema; // Identical
```

**Helper Functions:**
- `sanitizeClassData(data)` - Clean form data for API
- `createClassRequest(data)` - Transform to CreateClassRequest
- `createUpdateClassRequest(data)` - Transform to UpdateClassRequest
- `validateAndPrepareClassData(data)` - Validate + prepare for submission

**Validation Alignment with Backend:**

| Field | Frontend (Zod) | Backend (FluentValidation) |
|-------|----------------|----------------------------|
| name | `min(1).max(100)` | `NotEmpty().MaximumLength(100)` |
| subjectId | `uuid()` | `NotEmpty().Must(BeValidGuid)` |
| teacherId | `uuid()` | `NotEmpty().Must(BeValidGuid)` |
| classroomId | `uuid()` | `NotEmpty().Must(BeValidGuid)` |
| startTime | `regex(TIME_24H)` | `Must(BeValid24HourTime)` |
| endTime | `regex(TIME_24H)`, > startTime | `Must(BeValid24HourTime).Must(BeAfterStartTime)` |
| dayOfWeek | `enum(Mon-Sun)` | `Must(BeValidDayOfWeek)` |
| schedule | No duplicates, no overlaps | Backend conflict checking |
| studentIds | `array(uuid())` | `Each().Must(BeValidGuid)` |

---

## Key Hooks

### Primary Hook: [useClasses.ts](hooks/useClasses.ts)

```typescript
const useClasses = () => {
  // Methods
  loadClasses()                        // Fetch all classes
  search(params: ClassSearchParams)    // Search with filters
  create(data: CreateClassRequest)     // Create new class
  update(id, data: UpdateClassRequest) // Update class
  remove(id)                           // Delete class
  disable(id)                          // Disable class (soft delete)
  enable(id)                           // Re-enable class

  // Selectors
  classes                              // Filtered by search mode
  all                                  // All classes (always)
  selectedClass                        // Currently selected
  loading                              // Loading states object
  errors                               // Error states object
  isSearchMode                         // Search mode flag
  searchQuery                          // Current search query
  searchParams                         // Current search params
};
```

### Page Hooks

#### [useClassPage.ts](hooks/useClassPage.ts)

Manages class detail page state and lifecycle.

```typescript
interface ClassPageState {
  mode: 'view' | 'edit';
  classData: ClassResponse | null;
  editData: ClassResponse | null;
  activeTab: string;
  hasUnsavedChanges: boolean;
  tabsWithUnsavedChanges: Set<string>;
  archivedSchedulesExpanded: boolean;
}

const useClassPage = (classId: string) => {
  // Methods
  enterEditMode()                      // Switch to edit mode
  cancelEdit()                         // Cancel edit, revert changes
  updateField(field, value)            // Update single field
  updateNestedField(path, value)       // Update nested field
  saveChanges()                        // Save all changes
  setActiveTab(tab)                    // Switch tab
  registerTabUnsavedChanges(tabId, hasChanges)  // Register tab changes
  canSwitchTab()                       // Check if can switch tab (no unsaved changes)
  hasAnyUnsavedChanges()               // Check if any tab has changes
  loadArchivedSchedules()              // Lazy load archived schedules
  toggleArchivedSchedules()            // Expand/collapse archived section
  refreshArchivedSchedules()           // Refresh archived schedules
};
```

**Key Features:**
- Multi-tab unsaved changes tracking
- Lazy loading for archived schedules
- Prevents accidental navigation loss

#### [useClassFormPage.ts](hooks/useClassFormPage.ts)

Manages class create/edit form page.

```typescript
const useClassFormPage = (classId?: string) => {
  // State
  loading: boolean
  error: string | null
  classItem: ClassResponse | null

  // Methods
  handleSubmit(data)   // Create or update
  handleCancel()       // Navigate back
};
```

**Note:** Delegates data loading to dropdown components (no global loading of teachers/classrooms).

#### [useClassLessonContext.ts](hooks/useClassLessonContext.ts)

Determines lesson context for class (current/next lesson, state).

```typescript
type LessonState = 'active' | 'upcoming_today' | 'upcoming_future' | 'completed' | 'none';

const useClassLessonContext = (classId: string) => {
  currentLesson: Lesson | null
  nextLesson: Lesson | null
  lessonState: LessonState
};
```

**Usage:** Used by [ClassHeroSection.tsx](components/hero/ClassHeroSection.tsx) for CTA display.

---

## Key Components

### Pages

#### [Classes.tsx](../../pages/Classes.tsx)

Class list page with search/filter and view toggle.

**Features:**
- Search bar with [ClassFilters.tsx](components/filters/ClassFilters.tsx)
- View toggle (table/grid) via ClassViewMode
- Displays [ClassTable.tsx](components/list/ClassTable.tsx) or [ClassGrid.tsx](components/list/ClassGrid.tsx)
- Filters: searchTerm, academicYear, subject, teacher, availability, status

**File Reference:** [think-english-ui/src/pages/Classes.tsx](../../pages/Classes.tsx)

#### [ClassPage.tsx](../../pages/ClassPage.tsx)

Class detail page with four tabs.

**Tabs:**
1. **Lessons** - [ClassLessonsTab.tsx](components/detail/ClassLessonsTab.tsx)
2. **Info** - [ClassInfoTab.tsx](components/tabs/ClassInfoTab.tsx)
3. **Schedule** - [ClassScheduleTab.tsx](components/tabs/ClassScheduleTab.tsx)
4. **Students** - [ClassStudentsTab.tsx](components/tabs/ClassStudentsTab.tsx)

**Features:**
- Hero section with lesson progress and quick actions
- Full edit mode for class details
- Unsaved changes tracking across tabs
- Modal integration for lesson actions (conduct, cancel, reschedule)

**File Reference:** [think-english-ui/src/pages/ClassPage.tsx](../../pages/ClassPage.tsx)

#### [ClassFormPage.tsx](../../pages/ClassFormPage.tsx)

Class create/edit form page.

**Features:**
- Wraps [ClassFormContent.tsx](components/forms/ClassFormContent.tsx) with form ref
- Navigation with unsaved changes warning
- Breadcrumb navigation

**File Reference:** [think-english-ui/src/pages/ClassFormPage.tsx](../../pages/ClassFormPage.tsx)

---

### Form Components

#### [ClassFormContent.tsx](components/forms/ClassFormContent.tsx)

Main tabbed form for creating/editing classes.

**Tabs:**
1. **Basic Information** - [BasicClassInfoTab.tsx](components/forms/tabs/BasicClassInfoTab.tsx)
2. **Schedule & Enrollment** - [ScheduleEnrollmentTab.tsx](components/forms/tabs/ScheduleEnrollmentTab.tsx)
3. **Additional Details** - [AdditionalDetailsTab.tsx](components/forms/tabs/AdditionalDetailsTab.tsx)

**Features:**
- react-hook-form with Zod validation
- Tab indicators for data/errors
- Auto-navigate to tab with errors on submit
- Ref-exposed methods: `submitForm()`, `getFormData()`

**File Reference:** [think-english-ui/src/domains/classes/components/forms/ClassFormContent.tsx](components/forms/ClassFormContent.tsx)

---

### Detail Page Components

#### [ClassHeroSection.tsx](components/hero/ClassHeroSection.tsx)

Hero section with lesson progress visualization and quick actions.

**Features:**
- Lesson progress circle (conducted lessons %)
- Current/next lesson info with status indicator (In Progress / Today / Scheduled / Complete)
- Dropdown menu for lesson actions (Start Teaching, Mark as Conducted, Cancel Lesson)
- Integrates [useClassLessonContext](hooks/useClassLessonContext.ts) and `useQuickLessonActions`

**File Reference:** [think-english-ui/src/domains/classes/components/hero/ClassHeroSection.tsx](components/hero/ClassHeroSection.tsx)

#### [StudentProgressTable.tsx](components/sections/StudentProgressTable.tsx)

Main student progress display with expandable rows.

**Features:**
- Lazy loads lesson details on row expansion
- Shows: attendance summary, homework summary, comments count
- Student discount and payment obligation indicators (privacy-respecting)
- Action menu: add students, remove student, transfer student

**File Reference:** [think-english-ui/src/domains/classes/components/sections/StudentProgressTable.tsx](components/sections/StudentProgressTable.tsx)

#### [WeeklyScheduleGrid.tsx](components/schedule/WeeklyScheduleGrid.tsx)

Visual calendar grid for class schedules.

**Features:**
- Mon-Sun columns, 7am-10pm rows (dynamic range based on class schedule)
- Schedule slot rendering with time positioning
- Click handlers for slot selection
- Filters out obsolete schedules by default

**File Reference:** [think-english-ui/src/domains/classes/components/schedule/WeeklyScheduleGrid.tsx](components/schedule/WeeklyScheduleGrid.tsx)

---

## Design Patterns

### 1. Dual-State Pattern (Redux)

Maintains separate `classes` and `searchResults` collections with `isSearchMode` toggle.

**When to use which:**
- Display: Use `isSearchMode ? searchResults : classes`
- Create: Add to both if `isSearchMode === true`
- Update: Update both arrays and `selectedClass`
- Delete: Remove from both arrays

**File Reference:** [think-english-ui/src/domains/classes/classesSlice.ts:85-120](classesSlice.ts#L85-L120)

### 2. Lazy Loading Strategy

Load data progressively to minimize initial load time.

**Load Order:**
1. **Page load** - `ClassBasicInfoResponse` (fast)
2. **Per-tab** - `ClassScheduleResponse`, `ClassAdditionalDetailsResponse`
3. **On row expansion** - `StudentLessonDetail[]`
4. **On section expansion** - `ArchivedScheduleSlotResponse[]`

**File Reference:** [think-english-ui/src/domains/classes/hooks/useClassPage.ts:142-158](hooks/useClassPage.ts#L142-L158)

### 3. Multi-Tab Unsaved Changes Tracking

Track unsaved changes across multiple tabs to prevent data loss.

**Pattern:**
```typescript
const [tabsWithUnsavedChanges, setTabsWithUnsavedChanges] = useState<Set<string>>(new Set());

const registerTabUnsavedChanges = (tabId: string, hasChanges: boolean) => {
  setTabsWithUnsavedChanges(prev => {
    const next = new Set(prev);
    hasChanges ? next.add(tabId) : next.delete(tabId);
    return next;
  });
};

const canSwitchTab = () => tabsWithUnsavedChanges.size === 0;
```

**File Reference:** [think-english-ui/src/domains/classes/hooks/useClassPage.ts:72-89](hooks/useClassPage.ts#L72-L89)

### 4. Decentralized Data Loading (Dropdowns)

Dropdowns fetch their own data instead of parent passing data.

**Pattern:**
```typescript
// ❌ WRONG - Parent fetches and passes
<SubjectsDropdown subjects={subjects} />

// ✅ CORRECT - Component fetches internally
<SubjectsDropdown value={field.value} onValueChange={field.onChange} />
```

**Rationale:** Reduces coupling, allows reuse, improves performance.

**File Reference:** [think-english-ui/src/domains/classes/components/forms/tabs/BasicClassInfoTab.tsx:45-52](components/forms/tabs/BasicClassInfoTab.tsx#L45-L52)

### 5. Hero Section Pattern

Display class progress with intelligent lesson context.

**Features:**
- Circular progress indicator (conducted lessons %)
- Current/next lesson status with color-coded badge
- Dropdown menu for lesson quick actions
- State-aware CTAs (Start Teaching / Mark as Conducted / Cancel Lesson)

**File Reference:** [think-english-ui/src/domains/classes/components/hero/ClassHeroSection.tsx](components/hero/ClassHeroSection.tsx)

### 6. Privacy-Respecting Indicators

Display sensitive information (discounts, payment obligations) with privacy controls.

**Components:**
- [DiscountIndicator](components/sections/PrivacyIndicator.tsx) - Shows discount with tooltip
- [PaymentObligationIndicator](components/sections/PrivacyIndicator.tsx) - Shows payment status

**File Reference:** [think-english-ui/src/domains/classes/components/sections/PrivacyIndicator.tsx](components/sections/PrivacyIndicator.tsx)

---

## Common Workflows

### 1. Create a New Class

**User Flow:**
1. Navigate to `/classes`, click "Add Class" button
2. Opens [CreateClassSheet.tsx](components/dialogs/CreateClassSheet.tsx) (side drawer)
3. Three-tab form appears: Basic Information, Schedule & Enrollment, Additional Details
4. User fills: name, subject, teacher, classroom, schedule, students
5. Click "Add Class" → validates with Zod schema
6. Success → API call → Redux dispatch → toast → sheet closes
7. Class appears in list (optimistic update)

**Code Path:**
```
CreateClassSheet
  → ClassFormContent
    → useForm (with zodResolver)
    → handleSubmit
      → validateAndPrepareClassData
      → useClasses.create()
        → classApiService.createClass()
        → dispatch(addClass())
        → showSuccessMessage()
```

**File Reference:** [think-english-ui/src/domains/classes/components/dialogs/CreateClassSheet.tsx](components/dialogs/CreateClassSheet.tsx)

### 2. Edit Class Schedule

**User Flow:**
1. Viewing [ClassPage.tsx](../../pages/ClassPage.tsx) → Click Schedule tab
2. [WeeklyScheduleGrid.tsx](components/schedule/WeeklyScheduleGrid.tsx) displays current slots
3. Click existing slot → [EditScheduleSlotDialog.tsx](components/schedule/EditScheduleSlotDialog.tsx) opens
4. Modify day/time with conflict checking
5. Click Save → API updates → Redux updates → grid re-renders
6. Conflicts show inline [ScheduleConflictPanel.tsx](components/schedule/ScheduleConflictPanel.tsx)

**Code Path:**
```
WeeklyScheduleGrid
  → onClick(slot)
    → EditScheduleSlotDialog
      → validateScheduleSlot (no conflicts)
      → classApiService.updateSchedule()
      → dispatch(updateClass())
```

**File Reference:** [think-english-ui/src/domains/classes/components/tabs/ClassScheduleTab.tsx](components/tabs/ClassScheduleTab.tsx)

### 3. Add Students to Class

**User Flow:**
1. Viewing [ClassPage.tsx](../../pages/ClassPage.tsx) → Click Students tab (view mode)
2. Click "Add Students" button
3. StudentSelectionPanel opens (filters out already-enrolled students)
4. Select multiple students → click "Add"
5. API call to `addStudentsToClass` with `selectedStudentIds`
6. Student progress table refreshes
7. Toast shows "2 students added"

**Code Path:**
```
ClassStudentsTab
  → StudentSelectionPanel
    → onStudentsSelected(studentIds)
      → classApiService.addStudentsToClass(classId, { studentIds })
      → dispatch(updateClass())
      → showSuccessMessage()
      → refreshStudentProgressTable()
```

**File Reference:** [think-english-ui/src/domains/classes/components/tabs/ClassStudentsTab.tsx](components/tabs/ClassStudentsTab.tsx)

### 4. Disable a Class

**User Flow:**
1. View class in Classes list → click actions menu
2. Click "Disable Class"
3. [DisableClassDialog.tsx](components/dialogs/DisableClassDialog.tsx) shows impact:
   - X lessons deleted
   - Y enrollments marked inactive
   - Z schedules archived
4. Click "Disable" → API call → class marked inactive in list
5. Can view disabled classes with filter toggle
6. Can re-enable later with [EnableClassDialog.tsx](components/dialogs/EnableClassDialog.tsx)

**Code Path:**
```
ClassTable
  → Actions menu
    → DisableClassDialog
      → classApiService.disableClass(id)
      → dispatch(disableClass(id))
      → showSuccessMessage()
```

**File Reference:** [think-english-ui/src/domains/classes/components/dialogs/DisableClassDialog.tsx](components/dialogs/DisableClassDialog.tsx)

---

## Entity Relationships

```
Class
├── Subject (reference via subjectId)
├── Teacher (reference via teacherId)
├── Classroom (reference via classroomId)
├── AcademicYear (reference via academicYearId)
├── ScheduleSlots[] (array of day/time tuples)
│   └── Lessons[] (generated from ScheduleSlots)
│       ├── Status (Scheduled/Conducted/Cancelled/Make Up/No Show)
│       ├── ScheduledDate, StartTime, EndTime
│       └── Attendance/Homework for each Student
└── Students[] (via enrollments, reference via studentIds)
    ├── Attendance per Lesson (present/absent/late/excused)
    ├── Homework per Lesson (complete/partial/missing)
    ├── Comments per Lesson
    ├── Discount Info (privacy-respecting)
    └── Payment Obligations (privacy-respecting)
```

**Class Lifecycle:**
1. **Create** → Active class with schedule + students
2. **Update** → Modify details, schedule, enrollments
3. **Disable** → Soft delete (future lessons deleted, enrollments inactive, schedules archived)
4. **Enable** → Re-activate (ready for new activity)
5. **Delete** → Hard delete (rarely used)

**Student Enrollment Lifecycle:**
1. **Add Students** → `addStudentsToClass(classId, { studentIds })`
2. **Remove Student** → `removeStudentFromClass(classId, studentId)` (with attendance check)
3. **Transfer Student** → `transferStudent(classId, studentId, { targetClassId, reason? })`

---

## Anti-Patterns (NEVER DO)

### State Management

| ❌ WRONG | ✅ CORRECT |
|---------|-----------|
| Use localStorage-based state | Use API-driven `classesSlice.ts` |
| Mutate `classes` array directly | Dispatch Redux actions |
| Mix search results with all classes | Use `isSearchMode` to differentiate |
| Forget to update both arrays | Update both `classes` and `searchResults` |

### Data Loading

| ❌ WRONG | ✅ CORRECT |
|---------|-----------|
| Load all class data upfront | Lazy load per-tab/per-section |
| Pass dropdown data from parent | Let dropdowns fetch their own data |
| Re-fetch on every tab switch | Cache loaded data in component state |

### Form Handling

| ❌ WRONG | ✅ CORRECT |
|---------|-----------|
| Allow schedule slot overlaps | Validate with `validateNoOverlaps` |
| Allow duplicate slots | Validate with `validateNoDuplicateSlots` |
| Lose unsaved changes on tab switch | Track with `registerTabUnsavedChanges` |
| Different validation than backend | Match FluentValidation rules exactly |

### Component Patterns

| ❌ WRONG | ✅ CORRECT |
|---------|-----------|
| Fetch lesson context in multiple places | Use `useClassLessonContext` hook |
| Hard-code lesson actions | Use dropdown menu with state-aware CTAs |
| Show sensitive info without privacy controls | Use `DiscountIndicator` / `PaymentObligationIndicator` |

---

## Quick Reference

### File Paths (for linking)

**Primary Files:**
- Redux Slice: [classesSlice.ts](classesSlice.ts)
- Primary Hook: [useClasses.ts](hooks/useClasses.ts)
- API Service: [classApiService.ts](../../services/classApiService.ts)
- Types: [types/api/class.ts](../../types/api/class.ts)
- Validation: [utils/validation/classValidators.ts](../../utils/validation/classValidators.ts)

**Pages:**
- Class List: [pages/Classes.tsx](../../pages/Classes.tsx)
- Class Detail: [pages/ClassPage.tsx](../../pages/ClassPage.tsx)
- Class Form: [pages/ClassFormPage.tsx](../../pages/ClassFormPage.tsx)

**Key Components:**
- List Views: [ClassTable.tsx](components/list/ClassTable.tsx), [ClassGrid.tsx](components/list/ClassGrid.tsx)
- Form: [ClassFormContent.tsx](components/forms/ClassFormContent.tsx)
- Hero: [ClassHeroSection.tsx](components/hero/ClassHeroSection.tsx)
- Schedule Grid: [WeeklyScheduleGrid.tsx](components/schedule/WeeklyScheduleGrid.tsx)
- Student Progress: [StudentProgressTable.tsx](components/sections/StudentProgressTable.tsx)

### Verification Commands

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Check for untyped dispatch (should return nothing)
grep -r "useDispatch()" --include="*.tsx" think-english-ui/src/domains/classes

# Check for any types (should return nothing)
grep -r ": any" --include="*.ts" think-english-ui/src/domains/classes
```

---

## Related Documentation

- **Main UI Guide:** [think-english-ui/CLAUDE.md](../../CLAUDE.md)
- **Root Project Guide:** [CLAUDE.md](../../../CLAUDE.md)
- **Backend Class Endpoints:** `think-english-api/src/Api/Features/Classes/`
- **Architecture Patterns:** [.claude/skills/thinkienglish-conventions/SKILL.md](../../../.claude/skills/thinkienglish-conventions/SKILL.md)
- **UI/UX Design System:** [.claude/skills/ui-ux-reference/SKILL.md](../../../.claude/skills/ui-ux-reference/SKILL.md)
- **API Contract Reference:** [.claude/skills/api-contract-reference/SKILL.md](../../../.claude/skills/api-contract-reference/SKILL.md)
- **Component Patterns:** [.claude/skills/component-patterns/SKILL.md](../../../.claude/skills/component-patterns/SKILL.md)
- **Domain Entities:** [.claude/skills/domain-entities/SKILL.md](../../../.claude/skills/domain-entities/SKILL.md)

---

*Last updated: 2025-12-16*
*This is a living document - update as the Class Management domain evolves.*
