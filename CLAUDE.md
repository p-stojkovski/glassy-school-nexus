# ThinkEnglish UI - Frontend Development Guide

> React + TypeScript + Redux Toolkit frontend for ThinkEnglish school management system

## Quick Reference

| Layer | Technology | Purpose |
|-------|------------|---------|
| **State Management** | Redux Toolkit | Global state with dual-state pattern |
| **UI Components** | ShadCN/Radix UI | Accessible primitives |
| **Forms** | react-hook-form + Zod | Type-safe validation |
| **Styling** | Tailwind CSS | Utility-first styling |
| **API Client** | Axios | HTTP with interceptors |
| **Routing** | React Router v6 | Client-side routing |

## Domain-Specific Documentation

**MANDATORY RULE: When working on any domain, FIRST read the domain's CLAUDE.md file.**

For detailed domain-specific patterns, components, and workflows, see:

- **[Class Management](src/domains/classes/CLAUDE.md)** - Classes, schedules, enrollment, student progress tracking

**When working in a domain:**
1. **FIRST STEP:** Read `src/domains/{domain}/CLAUDE.md` (if it exists)
2. Use domain-specific patterns, components, and workflows documented there
3. Follow domain-specific anti-patterns and validation rules
4. Reference domain-specific file paths and component structures

**When to consult domain docs:**
- Before implementing features in that domain
- When debugging domain-specific issues
- To understand entity relationships and business rules for that domain
- When you need detailed component references and workflow examples
- To see domain-specific anti-patterns and validation rules

**Pattern for future domains:**
Each major domain should have a `CLAUDE.md` file following the Class Management example, including:
- Domain overview and key entities
- State management patterns (Redux slices)
- API integration (service methods, types)
- Form validation (Zod schemas aligned with backend)
- Key components with file references
- Common workflows with code paths
- Design patterns unique to that domain
- Entity relationships and lifecycle

## Directory Structure

```
src/
├── domains/                        # Feature-based organization
│   ├── student/                   # Student management domain
│   │   ├── components/           # Domain-specific components
│   │   │   ├── StudentForm.tsx   # Form components
│   │   │   ├── StudentList.tsx   # List/table components
│   │   │   └── StudentDialog.tsx # Modal/dialog components
│   │   ├── hooks/                # Custom hooks for domain
│   │   │   └── useStudentForm.ts # Form logic abstraction
│   │   └── studentSlice.ts       # Redux slice
│   ├── class/                    # Class management
│   ├── teacher/                  # Teacher management
│   └── [domain]/                 # Other domains follow same pattern
├── components/                    # Shared components
│   ├── ui/                       # ShadCN primitives (DO NOT EDIT)
│   │   ├── button.tsx            # Generated from ShadCN CLI
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── layout/                   # Layout components
│   │   ├── AppLayout.tsx         # Main app layout
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   └── Header.tsx            # App header
│   └── shared/                   # Shared business components
│       ├── DataTable.tsx         # Reusable data table
│       └── LoadingSpinner.tsx    # Loading states
├── services/                      # API layer
│   ├── api.ts                    # Axios instance + interceptors
│   ├── studentService.ts         # Student API calls
│   ├── classService.ts           # Class API calls
│   └── [domain]Service.ts        # One service per domain
├── store/                         # Redux configuration
│   ├── index.ts                  # Store setup
│   ├── hooks.ts                  # Typed useAppDispatch/useAppSelector
│   └── rootReducer.ts            # Combined reducers
├── types/                         # TypeScript type definitions
│   ├── api/                      # API contract types
│   │   ├── student.ts            # Student DTOs
│   │   ├── class.ts              # Class DTOs
│   │   └── common.ts             # Shared types (PagedResult, etc.)
│   └── ui/                       # UI-only types
│       └── forms.ts              # Form-specific types
├── utils/                         # Utility functions
│   ├── validation/               # Zod schemas
│   │   ├── studentSchemas.ts     # Student validation
│   │   ├── classSchemas.ts       # Class validation
│   │   └── common.ts             # Shared validation rules
│   ├── formatters.ts             # Date, currency formatters
│   └── constants.ts              # App constants
├── hooks/                         # Global custom hooks
│   ├── useDebounce.ts            # Debounce hook
│   └── usePermissions.ts         # Authorization hook
├── App.tsx                        # Root component
├── main.tsx                       # Entry point
└── routes.tsx                     # Route configuration
```

## Redux Toolkit Patterns

### Dual-State Pattern

Every slice maintains TWO collections:

```typescript
interface DomainState {
  // 1. Full collection (from GetAll)
  items: Student[];
  itemsLoading: boolean;
  itemsError: string | null;

  // 2. Search results (from Search endpoint)
  searchResults: Student[];
  searchLoading: boolean;
  searchError: string | null;

  // Per-operation states
  createLoading: boolean;
  createError: string | null;
  updateLoading: boolean;
  updateError: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
}
```

### Slice Structure Template

```typescript
// studentSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as studentService from '@/services/studentService';

// Async thunks
export const fetchStudents = createAsyncThunk(
  'students/fetchAll',
  async () => await studentService.getAllStudents()
);

export const searchStudents = createAsyncThunk(
  'students/search',
  async (criteria: SearchCriteria) =>
    await studentService.searchStudents(criteria)
);

export const createStudent = createAsyncThunk(
  'students/create',
  async (data: CreateStudentRequest) =>
    await studentService.createStudent(data)
);

// Slice
const studentSlice = createSlice({
  name: 'students',
  initialState: {
    items: [],
    itemsLoading: false,
    itemsError: null,
    searchResults: [],
    searchLoading: false,
    searchError: null,
    createLoading: false,
    createError: null,
  } as StudentState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearErrors: (state) => {
      state.itemsError = null;
      state.searchError = null;
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder.addCase(fetchStudents.pending, (state) => {
      state.itemsLoading = true;
      state.itemsError = null;
    });
    builder.addCase(fetchStudents.fulfilled, (state, action) => {
      state.itemsLoading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchStudents.rejected, (state, action) => {
      state.itemsLoading = false;
      state.itemsError = action.error.message ?? 'Failed to fetch students';
    });

    // Search
    builder.addCase(searchStudents.pending, (state) => {
      state.searchLoading = true;
      state.searchError = null;
    });
    builder.addCase(searchStudents.fulfilled, (state, action) => {
      state.searchLoading = false;
      state.searchResults = action.payload;
    });
    builder.addCase(searchStudents.rejected, (state, action) => {
      state.searchLoading = false;
      state.searchError = action.error.message ?? 'Search failed';
    });

    // Create (optimistic update to items array)
    builder.addCase(createStudent.pending, (state) => {
      state.createLoading = true;
      state.createError = null;
    });
    builder.addCase(createStudent.fulfilled, (state, action) => {
      state.createLoading = false;
      state.items.push(action.payload);
    });
    builder.addCase(createStudent.rejected, (state, action) => {
      state.createLoading = false;
      state.createError = action.error.message ?? 'Failed to create student';
    });
  },
});

export const { clearSearchResults, clearErrors } = studentSlice.actions;
export default studentSlice.reducer;
```

### Typed Hooks (ALWAYS USE THESE)

```typescript
// WRONG - Never use these
import { useDispatch, useSelector } from 'react-redux';

// CORRECT - Always import from store/hooks.ts
import { useAppDispatch, useAppSelector } from '@/store/hooks';

// Usage
const dispatch = useAppDispatch();
const students = useAppSelector((state) => state.students.items);
const loading = useAppSelector((state) => state.students.itemsLoading);
```

## ShadCN Component Usage

### Component Composition Pattern

Build features by composing ShadCN primitives:

```tsx
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// ✅ CORRECT: Compose primitives into domain components
export function CreateStudentDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Student</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Student</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### UI Component Guidelines

| Rule | Description |
|------|-------------|
| **Never Edit** | Don't modify files in `components/ui/` - regenerate with ShadCN CLI |
| **Compose, Don't Wrap** | Use ShadCN components directly, avoid custom wrappers |
| **Variant Props** | Use built-in variants (`variant="destructive"`, `size="sm"`) |
| **asChild Pattern** | Use `asChild` prop to compose with custom components |

## Form Handling with Zod + react-hook-form

### Form Pattern (3 Files)

```typescript
// 1. utils/validation/studentSchemas.ts
import { z } from 'zod';

export const createStudentSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email format').optional(),
  dateOfBirth: z.date({ required_error: 'Date of birth is required' }),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
});

export type CreateStudentFormData = z.infer<typeof createStudentSchema>;

// 2. domains/student/components/StudentForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createStudentSchema, type CreateStudentFormData } from '@/utils/validation/studentSchemas';

interface StudentFormProps {
  onSubmit: (data: CreateStudentFormData) => void;
  loading?: boolean;
}

export function StudentForm({ onSubmit, loading }: StudentFormProps) {
  const form = useForm<CreateStudentFormData>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Student'}
        </Button>
      </form>
    </Form>
  );
}

// 3. domains/student/components/CreateStudentDialog.tsx
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createStudent } from '@/domains/student/studentSlice';
import { StudentForm } from './StudentForm';

export function CreateStudentDialog() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.students.createLoading);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (data: CreateStudentFormData) => {
    const result = await dispatch(createStudent(data)).unwrap();
    if (result) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Student</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Student</DialogTitle>
        </DialogHeader>
        <StudentForm onSubmit={handleSubmit} loading={loading} />
      </DialogContent>
    </Dialog>
  );
}
```

### Validation Rule Alignment

Zod schemas MUST match backend FluentValidation rules:

```csharp
// Backend: CreateStudentRequestValidator.cs
RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrEmpty(x.Email));
```

```typescript
// Frontend: studentSchemas.ts
firstName: z.string().min(1, 'First name is required').max(100);
email: z.string().email('Invalid email format').optional();
```

## API Service Layer

### Service Pattern

```typescript
// services/api.ts (base instance)
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// services/studentService.ts
import { api } from './api';
import type { Student, CreateStudentRequest, UpdateStudentRequest, PagedResult } from '@/types/api/student';

export async function getAllStudents(): Promise<Student[]> {
  const response = await api.get<Student[]>('/api/students');
  return response.data;
}

export async function getStudentById(id: number): Promise<Student> {
  const response = await api.get<Student>(`/api/students/${id}`);
  return response.data;
}

export async function searchStudents(criteria: SearchCriteria): Promise<PagedResult<Student>> {
  const response = await api.post<PagedResult<Student>>('/api/students/search', criteria);
  return response.data;
}

export async function createStudent(data: CreateStudentRequest): Promise<Student> {
  const response = await api.post<Student>('/api/students', data);
  return response.data;
}

export async function updateStudent(id: number, data: UpdateStudentRequest): Promise<Student> {
  const response = await api.put<Student>(`/api/students/${id}`, data);
  return response.data;
}

export async function deleteStudent(id: number): Promise<void> {
  await api.delete(`/api/students/${id}`);
}
```

## TypeScript Conventions

### Type Definitions

```typescript
// types/api/student.ts (matches backend DTOs)
export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  dateOfBirth: string; // ISO 8601 date string
  phoneNumber?: string;
  enrollmentDate: string;
  isActive: boolean;
}

export interface CreateStudentRequest {
  firstName: string;
  lastName: string;
  email?: string;
  dateOfBirth: string;
  phoneNumber?: string;
}

export interface UpdateStudentRequest {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  dateOfBirth: string;
  phoneNumber?: string;
  isActive: boolean;
}

// types/api/common.ts
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
```

### TypeScript Rules

| Rule | Description |
|------|-------------|
| **No `any`** | Use `unknown` if type is truly unknown, then narrow with type guards |
| **Strict Mode** | `tsconfig.json` has `strict: true` - never disable |
| **Explicit Returns** | Always type function returns: `function foo(): ReturnType` |
| **Interface vs Type** | Use `interface` for objects, `type` for unions/intersections |
| **Optional Chaining** | Use `?.` for potentially undefined properties |
| **Nullish Coalescing** | Use `??` instead of `||` for default values |

## Loading and Error States

### Pattern for All Async Operations

```tsx
export function StudentList() {
  const dispatch = useAppDispatch();
  const students = useAppSelector((state) => state.students.items);
  const loading = useAppSelector((state) => state.students.itemsLoading);
  const error = useAppSelector((state) => state.students.itemsError);

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (students.length === 0) {
    return <EmptyState message="No students found" />;
  }

  return (
    <div>
      {students.map((student) => (
        <StudentCard key={student.id} student={student} />
      ))}
    </div>
  );
}
```

## Anti-Patterns (NEVER DO)

### State Management

| ❌ WRONG | ✅ CORRECT |
|---------|-----------|
| `import { useDispatch } from 'react-redux'` | `import { useAppDispatch } from '@/store/hooks'` |
| React Query / SWR | Redux Toolkit async thunks |
| Direct state mutation | Redux reducers (Immer enabled) |
| Global useState for server data | Redux slices |

### Component Patterns

| ❌ WRONG | ✅ CORRECT |
|---------|-----------|
| Custom button wrapper | Use `<Button>` from ShadCN |
| Editing `components/ui/button.tsx` | Regenerate with `npx shadcn-ui@latest add button` |
| `<CustomDialog>` wrapper | Compose `<Dialog>` primitives |
| Inline Tailwind in JS | Use `className` prop with Tailwind |

### TypeScript

| ❌ WRONG | ✅ CORRECT |
|---------|-----------|
| `: any` | `: unknown` + type guard OR proper type |
| `as any` | Proper type assertion OR refactor |
| `@ts-ignore` | Fix the type error |
| `|| false` for boolean defaults | `?? false` (nullish coalescing) |

### Forms

| ❌ WRONG | ✅ CORRECT |
|---------|-----------|
| Manual validation with useState | Zod schema + react-hook-form |
| Different validation rules than backend | Match FluentValidation rules exactly |
| Uncontrolled forms | react-hook-form controlled |
| Inline validation logic | Zod schemas in `utils/validation/` |

### API Calls

| ❌ WRONG | ✅ CORRECT |
|---------|-----------|
| `fetch()` directly in components | Service functions + Redux thunks |
| No error handling | Try-catch + error state |
| Hardcoded API URLs | `import.meta.env.VITE_API_BASE_URL` |
| Different types than backend DTOs | Match backend Response/Request types |

## Quick Verification Commands

```bash
# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Tests
npm run test
npm run test:watch
npm run test:coverage

# Build
npm run build

# Development
npm run dev
```

## Common Workflows

### Adding a New Domain

```bash
# 1. Create directory structure
mkdir -p src/domains/newdomain/components
mkdir -p src/domains/newdomain/hooks

# 2. Create files
touch src/domains/newdomain/newdomainSlice.ts
touch src/types/api/newdomain.ts
touch src/services/newdomainService.ts
touch src/utils/validation/newdomainSchemas.ts

# 3. Implement in order:
# - types/api/newdomain.ts (DTOs matching backend)
# - services/newdomainService.ts (API calls)
# - utils/validation/newdomainSchemas.ts (Zod schemas)
# - domains/newdomain/newdomainSlice.ts (Redux slice)
# - domains/newdomain/components/ (UI components)
```

### Adding a New ShadCN Component

```bash
# Use ShadCN CLI (adds to components/ui/)
npx shadcn-ui@latest add [component-name]

# Example
npx shadcn-ui@latest add alert-dialog
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add calendar
```

### Debugging Redux State

```tsx
// Temporary debugging (remove after)
const wholeState = useAppSelector((state) => state);
console.log('Redux State:', wholeState);

// Use Redux DevTools browser extension for better debugging
```

### Handling Form Errors from Backend

```typescript
// Backend returns validation errors
interface ApiValidationError {
  message: string;
  errors?: Record<string, string[]>; // { "firstName": ["Required"], ... }
}

// Set form errors from API response
const handleSubmit = async (data: FormData) => {
  try {
    await dispatch(createStudent(data)).unwrap();
  } catch (error: any) {
    if (error.response?.data?.errors) {
      const apiErrors = error.response.data.errors;
      Object.keys(apiErrors).forEach((field) => {
        form.setError(field as any, {
          message: apiErrors[field][0],
        });
      });
    }
  }
};
```

## Integration with Backend

### Type Alignment Checklist

When backend changes a DTO:

- [ ] Update `types/api/` interface to match
- [ ] Update Zod schema to match validation rules
- [ ] Update service function signatures
- [ ] Update Redux slice state if needed
- [ ] Update components using the changed type
- [ ] Run `npm run type-check` to catch errors

### API Contract Example

```csharp
// Backend: CreateStudentResponse.cs
public record CreateStudentResponse(
    int Id,
    string FirstName,
    string LastName,
    string? Email,
    DateOnly DateOfBirth
);
```

```typescript
// Frontend: types/api/student.ts
export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  dateOfBirth: string; // DateOnly serializes to ISO string
}
```

## Performance Tips

| Technique | Use Case |
|-----------|----------|
| `React.memo()` | Expensive components that receive same props |
| `useMemo()` | Expensive computations in render |
| `useCallback()` | Callbacks passed to memoized children |
| Virtualization | Large lists (100+ items) - use `react-virtual` |
| Code Splitting | Route-based with `React.lazy()` |

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/store/hooks.ts` | Typed Redux hooks (ALWAYS import from here) |
| `src/services/api.ts` | Axios instance + interceptors |
| `src/types/api/common.ts` | Shared API types (PagedResult, ApiError) |
| `src/utils/validation/common.ts` | Shared Zod schemas (email, phone, etc.) |
| `src/components/ui/` | ShadCN primitives (regenerate, don't edit) |

---

*For monorepo overview and backend details, see [root CLAUDE.md](../CLAUDE.md)*
*For architecture patterns, see `.claude/skills/thinkienglish-conventions/SKILL.md`*
*For UI/UX design system, see `.claude/skills/ui-ux-reference/SKILL.md`*
