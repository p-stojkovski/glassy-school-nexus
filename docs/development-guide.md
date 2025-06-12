# Glassy School Nexus - Development Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [UI Design System](#ui-design-system)
5. [Coding Standards](#coding-standards)
6. [Component Patterns](#component-patterns)
7. [State Management](#state-management)
8. [Routing & Navigation](#routing--navigation)
9. [Data Persistence](#data-persistence)
10. [Development Workflow](#development-workflow)

## Project Overview

**Glassy School Nexus** is a comprehensive school management system built with React, TypeScript, and modern web technologies. The application features a glassmorphism design with a gradient background and provides functionality for managing students, teachers, classes, attendance, finances, and grades.

### Key Features
- **Student Management**: CRUD operations for student records
- **Teacher Management**: Teacher profiles and assignments
- **Class Management**: Class creation, scheduling, and student assignments
- **Attendance Tracking**: Mark and track student attendance
- **Financial Management**: Payment obligations and tracking
- **Grades & Assessments**: Grade management and academic records
- **Classroom Management**: Physical classroom resources
- **Scheduling**: Class scheduling and calendar management

## Architecture

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── attendance/      # Attendance-specific components
│   ├── auth/           # Authentication components
│   ├── classes/        # Class management components
│   ├── classrooms/     # Classroom management components
│   ├── common/         # Shared components
│   ├── finance/        # Financial management components
│   ├── grades/         # Grades and assessments components
│   ├── layout/         # Layout components (Sidebar, TopBar, etc.)
│   ├── scheduling/     # Scheduling components
│   ├── students/       # Student management components
│   ├── teachers/       # Teacher management components
│   └── ui/            # Base UI components (shadcn/ui)
├── hooks/              # Custom React hooks
├── lib/               # Utility functions
├── pages/             # Page components (route handlers)
├── services/          # API services and external integrations
├── store/             # Redux store configuration
│   └── slices/        # Redux slices for state management
└── types/             # TypeScript type definitions
```

### Component Hierarchy
```
App
├── AuthenticationGate (LoginForm vs AppLayout)
└── AppLayout
    ├── Sidebar (Navigation)
    ├── TopBar (Dashboard only)
    └── MainContent (Route-based pages)
```

## Tech Stack

### Core Dependencies
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library

### UI Components
- **Radix UI** - Headless UI primitives
- **shadcn/ui** - Component library built on Radix
- **Lucide React** - Icon library
- **Recharts** - Charts and data visualization

### State Management
- **Redux Toolkit** - State management
- **React Redux** - React bindings for Redux

### Form Handling
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **@hookform/resolvers** - Form validation integration

### Additional Libraries
- **React Router DOM** - Client-side routing
- **date-fns** - Date manipulation
- **clsx** & **tailwind-merge** - CSS class utilities
- **class-variance-authority** - Component variant system

## UI Design System

### Design Philosophy
The application uses a **glassmorphism** design approach with:
- Translucent glass-like surfaces
- Backdrop blur effects
- Gradient backgrounds
- Soft shadows and borders

### Color Scheme

#### Primary Colors
- **Yellow/Amber System**: Primary action buttons
  - `bg-yellow-500 hover:bg-yellow-600 text-black font-semibold` - Standard primary buttons
- **Glass Background**: Main surface color
  - `bg-white/5` - Glass card backgrounds
  - `bg-white/10` - Input backgrounds
  - `border-white/10` - Glass borders

#### Status Colors
```css
/* Status indicators */
.status-active { @apply bg-green-500/20 text-green-300 border-green-500/30; }
.status-inactive { @apply bg-red-500/20 text-red-300 border-red-500/30; }
.status-pending { @apply bg-yellow-500/20 text-yellow-300 border-yellow-500/30; }
.status-maintenance { @apply bg-yellow-500/20 text-yellow-300 border-yellow-500/30; }

/* Payment statuses */
.payment-paid { @apply bg-green-500/20 text-green-300 border-green-500/30; }
.payment-pending { @apply bg-yellow-500/20 text-yellow-300 border-yellow-500/30; }
.payment-overdue { @apply bg-red-500/20 text-red-300 border-red-500/30; }
.payment-partial { @apply bg-blue-500/20 text-blue-300 border-blue-500/30; }

/* Attendance statuses */
.attendance-present { @apply bg-green-500/20 text-green-300; }
.attendance-absent { @apply bg-red-500/20 text-red-300; }
.attendance-late { @apply bg-yellow-500/20 text-yellow-300; }
```

#### Background Gradient
```css
/* Main app background */
.app-background {
  background: linear-gradient(to bottom right,
    rgb(30, 64, 175), /* blue-800 */
    rgb(107, 33, 168), /* purple-800 */
    rgb(4, 120, 87)    /* green-700 */
  );
}
```

### SCSS Modules

Tailwind utilities can be grouped into SCSS modules to keep JSX readable.
Component-level `.module.scss` files use `@apply` to compose utilities, and
global styles live in `src/styles/globals.scss` (imported in `main.tsx`).
Example:

```scss
.glassCard {
  @apply backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl shadow-xl;
}
.hoverable {
  @apply hover:bg-white/8 hover:shadow-2xl transition-all duration-300 cursor-pointer;
}
```

### Typography
- **Font**: System font stack (default)
- **Text Colors**:
  - Primary text: `text-white`
  - Secondary text: `text-white/70`
  - Muted text: `text-white/60`

### Component Styling Standards

#### Buttons
```tsx
// Primary action buttons (standardized yellow)
<Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
  Add Item
</Button>

// Secondary/Ghost buttons
<Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
  Cancel
</Button>

// Destructive actions
<Button className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
  Delete
</Button>
```

#### Form Elements
```tsx
// Input fields
<Input className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400" />

// Select components
<SelectTrigger className="bg-white/10 border-white/20 text-white">
```

#### Cards and Containers
```tsx
// Main glass card component
<GlassCard className="p-6">
  {/* Content */}
</GlassCard>

// With hover effects
<GlassCard className="p-6 hover:bg-white/5 transition-all duration-300">
```

## Coding Standards

### TypeScript Guidelines

#### Interface Naming
```typescript
// Component props interfaces
interface ComponentNameProps {
  // props
}

// Data model interfaces
interface Student {
  id: string;
  name: string;
  // ...
}

// State interfaces
interface StudentsState {
  students: Student[];
  loading: boolean;
  error: string | null;
}
```

#### Type Definitions
```typescript
// Use union types for status fields
type StudentStatus = 'active' | 'inactive';
type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'partial';

// Use strict typing for function parameters
const handleSubmit = (data: FormData): void => {
  // implementation
};
```

### React Component Guidelines

#### Component Structure
```tsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
// ... other imports

interface ComponentProps {
  // prop definitions
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Hooks
  const dispatch = useDispatch();
  const state = useSelector((state: RootState) => state.slice);
  
  // Event handlers
  const handleEvent = () => {
    // implementation
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default Component;
```

#### Naming Conventions
- **Components**: PascalCase (`StudentCard`, `AttendanceMarker`)
- **Files**: PascalCase for components (`StudentCard.tsx`)
- **Hooks**: camelCase starting with "use" (`useStudentManagement`)
- **Functions**: camelCase (`handleSubmit`, `fetchStudents`)
- **Variables**: camelCase (`studentData`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `DEFAULT_PAGE_SIZE`)

### File Organization
```
components/
├── domain/              # Domain-specific components
│   ├── ComponentName.tsx
│   └── index.ts        # Re-export components
├── common/             # Shared components
└── ui/                 # Base UI components
```

## Component Patterns

### 1. Shared Components

#### GlassCard
The primary container component with glassmorphism effects:
```tsx
<GlassCard className="p-6" hover onClick={handleClick}>
  {children}
</GlassCard>
```

#### StudentSelectionPanel
Reusable component for selecting students:
```tsx
<StudentSelectionPanel
  students={students}
  selectedStudentIds={selectedIds}
  onSelectionChange={setSelectedIds}
  allowMultiple={true}
  maxSelections={10}
/>
```

### 2. Form Patterns

#### Standard Form Structure
```tsx
const ComponentForm: React.FC<Props> = ({ onSubmit, onCancel }) => {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Form fields */}
        
        <div className="flex gap-4 pt-6 border-t border-white/20">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
};
```

### 3. Data Display Patterns

#### Card Layout
```tsx
const DataCard: React.FC<Props> = ({ data, onEdit, onDelete }) => {
  return (
    <GlassCard className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white">{data.title}</h3>
          {/* Additional info */}
        </div>
        
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
      
      {/* Card content */}
    </GlassCard>
  );
};
```

#### Table Layout
```tsx
<GlassCard className="p-6">
  <Table className="text-white">
    <TableHeader>
      <TableRow className="hover:bg-white/5 border-white/20">
        <TableHead className="text-white/70">Column 1</TableHead>
        {/* More headers */}
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((item) => (
        <TableRow key={item.id} className="hover:bg-white/5 border-white/10">
          <TableCell>{item.field}</TableCell>
          {/* More cells */}
        </TableRow>
      ))}
    </TableBody>
  </Table>
</GlassCard>
```

## State Management

### Redux Store Structure
```typescript
// store/index.ts
export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentsReducer,
    teachers: teachersReducer,
    classes: classesReducer,
    classrooms: classroomsReducer,
    attendance: attendanceReducer,
    finance: financeReducer,
    scheduling: schedulingReducer,
    grades: gradesReducer,
    ui: uiReducer,
  },
});
```

### Slice Pattern
```typescript
// store/slices/entitySlice.ts
interface EntityState {
  entities: Entity[];
  loading: boolean;
  error: string | null;
}

const entitySlice = createSlice({
  name: 'entity',
  initialState,
  reducers: {
    setEntities: (state, action: PayloadAction<Entity[]>) => {
      state.entities = action.payload;
      // Auto-save to localStorage
      localStorage.setItem('entities', JSON.stringify(action.payload));
    },
    addEntity: (state, action: PayloadAction<Entity>) => {
      state.entities.push(action.payload);
      // Auto-save to localStorage
    },
    updateEntity: (state, action: PayloadAction<Entity>) => {
      const index = state.entities.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        state.entities[index] = action.payload;
      }
      // Auto-save to localStorage
    },
    deleteEntity: (state, action: PayloadAction<string>) => {
      state.entities = state.entities.filter(e => e.id !== action.payload);
      // Auto-save to localStorage
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});
```

### Usage in Components
```typescript
const Component: React.FC = () => {
  const dispatch = useDispatch();
  const { entities, loading, error } = useSelector((state: RootState) => state.entity);
  
  useEffect(() => {
    dispatch(setLoading(true));
    // Load data logic
    dispatch(setLoading(false));
  }, [dispatch]);
  
  const handleAdd = (data: EntityFormData) => {
    const newEntity: Entity = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    dispatch(addEntity(newEntity));
  };
};
```

## Routing & Navigation

### Route Structure
```typescript
// App.tsx
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/students" element={<StudentManagement />} />
  <Route path="/students/:studentId" element={<StudentProfile />} />
  <Route path="/teachers" element={<Teachers />} />
  <Route path="/classes" element={<ClassManagement />} />
  <Route path="/classes/new" element={<ClassForm />} />
  <Route path="/classrooms" element={<ClassroomManagement />} />
  <Route path="/attendance" element={<AttendanceManagement />} />
  <Route path="/grades" element={<GradesManagement />} />
  <Route path="/finance" element={<FinancialManagement />} />
  <Route path="/scheduling" element={<Scheduling />} />
  <Route path="/scheduling/new" element={<ScheduleForm />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

### Navigation Patterns
```typescript
// Using useNavigate hook
const navigate = useNavigate();

const handleEdit = (id: string) => {
  navigate(`/students/${id}`);
};

const handleBack = () => {
  navigate(-1); // Go back
  // or
  navigate('/students'); // Go to specific route
};
```

## Data Persistence

### LocalStorage Strategy
The application uses localStorage for data persistence in demo mode:

```typescript
// Auto-save pattern in Redux slices
const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
};

// Load from localStorage on app initialization
const loadFromLocalStorage = (key: string) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error);
    return null;
  }
};
```

### Data Models

#### Student Model
```typescript
interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  classId: string;
  status: 'active' | 'inactive';
  joinDate: string;
  parentContact: string;
  paymentDue?: boolean;
  lastPayment?: string;
}
```

#### Teacher Model
```typescript
interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  subject: string;
  status: 'active' | 'inactive';
  joinDate: string;
  classIds: string[];
}
```

## Development Workflow

### Getting Started
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Code Quality
- **ESLint**: Code linting with React-specific rules
- **TypeScript**: Strict type checking
- **Prettier**: Code formatting (configure as needed)

### Best Practices

#### Performance
- Use `React.memo()` for expensive components
- Implement proper dependency arrays in `useEffect`
- Use `useCallback` and `useMemo` for expensive calculations
- Optimize re-renders with proper state structure

#### Accessibility
- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure keyboard navigation works
- Maintain color contrast ratios

#### Error Handling
```typescript
// Component-level error handling
const [error, setError] = useState<string | null>(null);

const handleOperation = async () => {
  try {
    setError(null);
    // Operation logic
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
  }
};

// Display errors to users
{error && (
  <div className="text-red-400 text-sm mt-2">{error}</div>
)}
```

### Testing Strategy
While not currently implemented, consider adding:
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Testing component interactions
- **E2E Tests**: Cypress or Playwright for full user flows

### Contributing Guidelines

1. **Branch Naming**: Use descriptive names (`feature/student-search`, `fix/attendance-bug`)
2. **Commit Messages**: Follow conventional commits format
3. **Code Review**: Ensure all changes are reviewed
4. **Documentation**: Update docs when adding new features

### Common Patterns to Follow

#### Loading States
```typescript
if (loading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
    </div>
  );
}
```

#### Empty States
```typescript
{items.length === 0 ? (
  <GlassCard className="p-12 text-center">
    <Icon className="w-16 h-16 text-white/40 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-white mb-2">No Items Found</h3>
    <p className="text-white/60 mb-6">Get started by adding your first item.</p>
    <Button onClick={handleAdd} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
      Add First Item
    </Button>
  </GlassCard>
) : (
  <ItemsList items={items} />
)}
```

#### Form Validation
```typescript
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;
```

## Advanced Best Practices & Modern React Standards

### React 18+ Best Practices

#### Component Design Principles

##### 1. Single Responsibility Principle
Each component should have one clear purpose:
```tsx
// ❌ Avoid: Component doing too many things
const StudentManagerWithForm = () => {
  // Managing students, forms, validation, API calls, UI state...
};

// ✅ Better: Separate concerns
const StudentManager = () => {
  // Only manages student list display and actions
};

const StudentForm = () => {
  // Only handles form logic
};

const StudentFormValidation = () => {
  // Only handles validation logic
};
```

##### 2. Composition Over Inheritance
Prefer composition patterns for reusable logic:
```tsx
// ✅ Good: Composition with render props or children
const DataFetcher = ({ children, url }) => {
  const [data, loading, error] = useFetch(url);
  return children({ data, loading, error });
};

// Usage
<DataFetcher url="/api/students">
  {({ data, loading, error }) => (
    <StudentList students={data} loading={loading} error={error} />
  )}
</DataFetcher>
```

##### 3. Props Interface Design
Design props interfaces with extensibility in mind:
```tsx
// ✅ Good: Extensible and type-safe
interface StudentCardProps {
  student: Student;
  variant?: 'default' | 'compact' | 'detailed';
  actions?: {
    onEdit?: (student: Student) => void;
    onDelete?: (student: Student) => void;
    onView?: (student: Student) => void;
  };
  className?: string;
  children?: React.ReactNode;
}

// Allow for future customization
const StudentCard: React.FC<StudentCardProps> = ({
  student,
  variant = 'default',
  actions,
  className,
  children,
  ...restProps
}) => {
  return (
    <GlassCard className={cn("p-6", className)} {...restProps}>
      {/* Implementation */}
      {children}
    </GlassCard>
  );
};
```

#### Modern React Hooks Patterns

##### 1. Custom Hooks for Business Logic
Extract business logic into reusable custom hooks:
```tsx
// ✅ Custom hook for student management
const useStudentManagement = () => {
  const dispatch = useDispatch();
  const students = useSelector(selectStudents);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  const handleAddStudent = useCallback((data: StudentFormData) => {
    const newStudent: Student = {
      id: crypto.randomUUID(), // Modern ID generation
      ...data,
      createdAt: new Date().toISOString(),
    };
    dispatch(addStudent(newStudent));
  }, [dispatch]);
  
  const handleUpdateStudent = useCallback((id: string, data: Partial<Student>) => {
    dispatch(updateStudent({ id, changes: data }));
  }, [dispatch]);
  
  const handleDeleteStudent = useCallback((id: string) => {
    dispatch(deleteStudent(id));
  }, [dispatch]);
  
  return {
    students,
    selectedStudent,
    setSelectedStudent,
    handleAddStudent,
    handleUpdateStudent,
    handleDeleteStudent,
  };
};
```

##### 2. useEffect Best Practices
Follow modern useEffect patterns:
```tsx
// ✅ Good: Proper dependency management
const StudentProfile = ({ studentId }: { studentId: string }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef<AbortController>();
  
  useEffect(() => {
    const fetchStudent = async () => {
      // Cancel previous request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      
      setLoading(true);
      try {
        const response = await fetch(`/api/students/${studentId}`, {
          signal: abortControllerRef.current.signal,
        });
        const studentData = await response.json();
        setStudent(studentData);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed to fetch student:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (studentId) {
      fetchStudent();
    }
    
    // Cleanup function
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [studentId]); // Only depend on what actually changes
  
  // ... rest of component
};
```

##### 3. Performance Optimization Patterns
```tsx
// ✅ Memoization best practices
const StudentList = memo(({ students, onEdit, onDelete }: StudentListProps) => {
  // Memoize expensive computations
  const sortedStudents = useMemo(() => {
    return students.sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);
  
  // Memoize callback functions
  const handleEdit = useCallback((student: Student) => {
    onEdit(student);
  }, [onEdit]);
  
  const handleDelete = useCallback((student: Student) => {
    onDelete(student);
  }, [onDelete]);
  
  return (
    <div>
      {sortedStudents.map((student) => (
        <StudentCard
          key={student.id}
          student={student}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
});
```

### TypeScript Advanced Patterns

#### 1. Generic Types for Reusability
```typescript
// ✅ Generic types for API responses
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Usage
type StudentsResponse = PaginatedResponse<Student>;
type TeachersResponse = PaginatedResponse<Teacher>;
```

#### 2. Discriminated Unions for State Management
```typescript
// ✅ Better state modeling with discriminated unions
type LoadingState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Student[] }
  | { status: 'error'; error: string };

const StudentComponent = () => {
  const [state, setState] = useState<LoadingState>({ status: 'idle' });
  
  // TypeScript ensures exhaustive checking
  switch (state.status) {
    case 'idle':
      return <div>Click to load students</div>;
    case 'loading':
      return <LoadingSpinner />;
    case 'success':
      return <StudentList students={state.data} />; // TypeScript knows data exists
    case 'error':
      return <ErrorMessage error={state.error} />; // TypeScript knows error exists
  }
};
```

#### 3. Utility Types for Props
```typescript
// ✅ Advanced prop type patterns
type BaseProps<T> = {
  id: string;
  className?: string;
  'data-testid'?: string;
} & T;

type ActionProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
};

type StudentCardProps = BaseProps<{
  student: Student;
  variant?: 'default' | 'compact';
}> & ActionProps;

// Extract types from existing interfaces
type StudentFormFields = Pick<Student, 'name' | 'email' | 'phone' | 'parentContact'>;
type StudentSearchFields = Pick<Student, 'name' | 'email' | 'status'>;
```

### Code Quality & Validation

#### 1. Runtime Validation with Zod
```typescript
// ✅ Comprehensive validation schemas
const StudentSchema = z.object({
  id: z.string().uuid('Invalid student ID format'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string()
    .email('Invalid email format')
    .toLowerCase(),
  phone: z.string()
    .regex(/^\+?[\d\s-()]+$/, 'Invalid phone format')
    .optional(),
  status: z.enum(['active', 'inactive']),
  joinDate: z.string().datetime('Invalid date format'),
  parentContact: z.string().min(1, 'Parent contact is required'),
});

// Form validation with detailed error handling
const StudentForm = () => {
  const form = useForm<StudentFormData>({
    resolver: zodResolver(StudentSchema),
    mode: 'onBlur', // Validate on blur for better UX
    defaultValues: {
      status: 'active',
      joinDate: new Date().toISOString(),
    },
  });
  
  const onSubmit = async (data: StudentFormData) => {
    try {
      // Additional business logic validation
      const validatedData = StudentSchema.parse(data);
      await submitStudent(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        error.errors.forEach((err) => {
          form.setError(err.path.join('.') as keyof StudentFormData, {
            message: err.message,
          });
        });
      }
    }
  };
};
```

#### 2. Error Boundaries & Error Handling
```tsx
// ✅ Comprehensive error boundary
class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ComponentType<{ error: Error }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error tracking service (e.g., Sentry)
  }
  
  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }
    
    return this.props.children;
  }
}

// Error handling hook
const useErrorHandler = () => {
  const [error, setError] = useState<string | null>(null);
  
  const handleError = useCallback((error: unknown) => {
    if (error instanceof Error) {
      setError(error.message);
    } else if (typeof error === 'string') {
      setError(error);
    } else {
      setError('An unexpected error occurred');
    }
  }, []);
  
  const clearError = useCallback(() => setError(null), []);
  
  return { error, handleError, clearError };
};
```

### Performance Optimization

#### 1. Bundle Optimization
```typescript
// ✅ Lazy loading with proper error boundaries
const LazyStudentManagement = lazy(() => 
  import('./pages/StudentManagement').catch(() => ({
    default: () => <div>Failed to load Student Management</div>
  }))
);

const LazyTeacherManagement = lazy(() => 
  import('./pages/Teachers').catch(() => ({
    default: () => <div>Failed to load Teacher Management</div>
  }))
);

// App routing with suspense
<Router>
  <Routes>
    <Route path="/students" element={
      <Suspense fallback={<LoadingSpinner />}>
        <LazyStudentManagement />
      </Suspense>
    } />
  </Routes>
</Router>
```

#### 2. State Optimization
```typescript
// ✅ Optimized Redux selectors with reselect
import { createSelector } from '@reduxjs/toolkit';

const selectStudents = (state: RootState) => state.students.students;
const selectStudentFilter = (state: RootState) => state.students.filter;

const selectFilteredStudents = createSelector(
  [selectStudents, selectStudentFilter],
  (students, filter) => {
    if (!filter) return students;
    
    return students.filter(student => 
      student.name.toLowerCase().includes(filter.toLowerCase()) ||
      student.email.toLowerCase().includes(filter.toLowerCase())
    );
  }
);

// Memoized component for expensive renders
const StudentTable = memo(({ students }: { students: Student[] }) => {
  return (
    <Table>
      {students.map(student => (
        <StudentRow key={student.id} student={student} />
      ))}
    </Table>
  );
});
```

### Security Best Practices

#### 1. Input Sanitization
```typescript
// ✅ Sanitize and validate all inputs
import DOMPurify from 'dompurify';

const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input.trim());
};

const StudentForm = () => {
  const handleSubmit = (data: StudentFormData) => {
    const sanitizedData = {
      ...data,
      name: sanitizeInput(data.name),
      email: sanitizeInput(data.email),
      parentContact: sanitizeInput(data.parentContact),
    };
    
    // Proceed with sanitized data
  };
};
```

#### 2. Secure Data Handling
```typescript
// ✅ Safe localStorage operations
const secureStorage = {
  setItem: (key: string, value: any): boolean => {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  },
  
  getItem: <T>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return fallback;
    }
  },
  
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
      return false;
    }
  },
};
```

### Testing Strategies

#### 1. Component Testing
```tsx
// ✅ Comprehensive component tests
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

describe('StudentForm', () => {
  const renderWithProvider = (initialState = {}) => {
    const store = configureStore({
      reducer: { students: studentsReducer },
      preloadedState: initialState,
    });
    
    return render(
      <Provider store={store}>
        <StudentForm onSubmit={jest.fn()} onCancel={jest.fn()} />
      </Provider>
    );
  };
  
  it('should validate required fields', async () => {
    renderWithProvider();
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });
  
  it('should submit valid data', async () => {
    const onSubmit = jest.fn();
    render(<StudentForm onSubmit={onSubmit} onCancel={jest.fn()} />);
    
    await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        // ... other expected data
      });
    });
  });
});
```

#### 2. Custom Hook Testing
```tsx
// ✅ Testing custom hooks
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useStudentManagement } from '../hooks/useStudentManagement';

describe('useStudentManagement', () => {
  const wrapper = ({ children }) => (
    <Provider store={mockStore}>{children}</Provider>
  );
  
  it('should add student correctly', () => {
    const { result } = renderHook(() => useStudentManagement(), { wrapper });
    
    act(() => {
      result.current.handleAddStudent({
        name: 'John Doe',
        email: 'john@example.com',
        // ... other data
      });
    });
    
    expect(result.current.students).toHaveLength(1);
    expect(result.current.students[0].name).toBe('John Doe');
  });
});
```

### Accessibility (a11y) Standards

#### 1. Semantic HTML & ARIA
```tsx
// ✅ Proper accessibility implementation
const StudentCard = ({ student, onEdit, onDelete }: StudentCardProps) => {
  return (
    <article 
      className="glass-card"
      role="article"
      aria-labelledby={`student-${student.id}-name`}
    >
      <header>
        <h3 id={`student-${student.id}-name`} className="text-white">
          {student.name}
        </h3>
        <span 
          className={`status-badge ${student.status}`}
          aria-label={`Status: ${student.status}`}
        >
          {student.status}
        </span>
      </header>
      
      <div className="actions" role="group" aria-label="Student actions">
        <Button
          onClick={() => onEdit(student)}
          aria-label={`Edit ${student.name}`}
          className="text-white/70 hover:text-white"
        >
          <Edit aria-hidden="true" />
          Edit
        </Button>
        
        <Button
          onClick={() => onDelete(student)}
          aria-label={`Delete ${student.name}`}
          className="text-red-400 hover:text-red-300"
        >
          <Trash2 aria-hidden="true" />
          Delete
        </Button>
      </div>
    </article>
  );
};
```

#### 2. Keyboard Navigation
```tsx
// ✅ Keyboard accessibility
const StudentTable = ({ students }: StudentTableProps) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  
  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = Math.min(index + 1, students.length - 1);
        setFocusedIndex(nextIndex);
        rowRefs.current[nextIndex]?.focus();
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = Math.max(index - 1, 0);
        setFocusedIndex(prevIndex);
        rowRefs.current[prevIndex]?.focus();
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        // Trigger row action
        break;
    }
  };
  
  return (
    <table role="table" aria-label="Students list">
      <tbody>
        {students.map((student, index) => (
          <tr
            key={student.id}
            ref={(el) => (rowRefs.current[index] = el)}
            tabIndex={index === focusedIndex ? 0 : -1}
            onKeyDown={(e) => handleKeyDown(e, index)}
            aria-rowindex={index + 1}
          >
            {/* Table cells */}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

### Code Review Checklist

Before submitting any code, ensure you've checked:

#### ✅ React Best Practices
- [ ] Components follow single responsibility principle
- [ ] Proper use of hooks (no hooks in conditionals/loops)
- [ ] Memoization used appropriately (not overused)
- [ ] Event handlers are properly memoized
- [ ] useEffect has correct dependencies
- [ ] No memory leaks (cleanup functions provided)

#### ✅ TypeScript Quality
- [ ] All props and state have proper types
- [ ] No use of `any` type (use `unknown` if needed)
- [ ] Interfaces are properly named and documented
- [ ] Generic types used where appropriate
- [ ] Proper error type handling

#### ✅ Performance
- [ ] No unnecessary re-renders
- [ ] Heavy computations are memoized
- [ ] Large lists use virtualization if needed
- [ ] Images are optimized and lazy-loaded
- [ ] Bundle size impact considered

#### ✅ Accessibility
- [ ] Proper semantic HTML used
- [ ] ARIA labels provided where needed
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG standards
- [ ] Screen reader compatible

#### ✅ Security
- [ ] All user inputs are validated and sanitized
- [ ] No direct DOM manipulation with user input
- [ ] API calls use proper error handling
- [ ] Sensitive data is not logged

This guide provides the foundation for understanding and contributing to the Glassy School Nexus project. Follow these patterns and conventions to maintain consistency and code quality across the application.
