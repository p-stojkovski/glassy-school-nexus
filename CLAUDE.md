# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start development server on port 8080 with IPv6 support
- `npm run build` - Build for production
- `npm run build:dev` - Build for development mode
- `npm run lint` - Run ESLint (must pass before task completion)
- `npm run preview` - Preview production build
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Quality Validation
This project does not have tests configured. However, code quality is enforced through:
- **ESLint**: Must pass linting (warnings acceptable, errors must be fixed)
- **TypeScript**: Compilation must succeed
- **Prettier**: Code formatting must be consistent
- **Build Validation**: `npm run build` must succeed

## Architecture Overview

### Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS with Sass support
- **Form Handling**: React Hook Form with Zod validation
- **Notifications**: Sonner (toast notifications)
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Utilities**: Class Variance Authority, CLSX, date-fns, UUID
- **Authentication**: Demo mode (will be replaced with API endpoints)

### Project Structure

#### Domain-Driven Architecture
The project follows a domain-driven design pattern:

```
src/
├── domains/           # Business domains
│   ├── auth/         # Authentication
│   ├── students/     # Student management
│   ├── teachers/     # Teacher management
│   ├── classes/      # Class management
│   ├── classrooms/   # Classroom management
│   ├── attendance/   # Attendance tracking
│   ├── grades/       # Grade management
│   ├── finance/      # Financial obligations & payments
│   └── privateLessons/ # Private lesson management
├── components/       # Shared UI components
├── pages/           # Top-level page components
├── data/            # Data layer (mock service)
├── store/           # Redux store configuration
└── lib/             # Utility functions
```

#### Domain Structure
Each domain follows a consistent structure:
- `components/` - Domain-specific components
- `hooks/` - Domain-specific hooks
- `[domain]Slice.ts` - Redux slice for state management
- Organized by feature (filters, forms, layout, list, etc.)

### Key Architectural Patterns

#### Data Management
- **API Integration**: Will use actual API endpoints (localStorage/demo mode being phased out)
- **Domain Hooks**: Each domain has custom hooks for data operations (e.g., `useStudentsData`, `useTeachersData`)
- **Redux Slices**: Each domain has its own Redux slice for state management
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages

#### Component Organization
- **shadcn/ui**: Core UI components in `src/components/ui/` (Radix UI primitives)
- **Common Components**: Shared components in `src/components/common/` with standardized patterns
- **Domain Components**: Feature-specific components within each domain, organized by:
  - `components/filters/` - Filter and search components
  - `components/forms/` - Form components with validation
  - `components/layout/` - Layout and header components
  - `components/list/` - List and table components
  - `components/state/` - Loading and empty state components
- **Layout Components**: App structure components in `src/components/layout/`

#### Glass Morphism Design System
- **Consistent Styling**: All components use glass morphism with `bg-white/10` and `border-white/20`
- **Standardized Components**: `StandardInput`, `StandardAlertDialog`, `StandardToast`
- **Color Scheme**: White text with yellow accent (`yellow-400`) for focus states
- **Error States**: Red accent (`red-400`) with semi-transparent backgrounds

#### State Management
- **Redux Store**: Configured with domain-specific slices in `src/store/`
- **Typed Hooks**: `useAppSelector` and `useAppDispatch` for type safety
- **Domain Slices**: Each domain has its own slice (e.g., `studentsSlice.ts`)
- **UI State**: Separate `uiSlice` for global UI concerns
- **Local State**: React state for component-specific UI concerns

#### Form Management
- **React Hook Form**: All forms use React Hook Form for performance
- **Zod Validation**: Schema-based validation with Zod
- **Standardized Patterns**: Consistent form structure across domains
- **Error Handling**: Field-level and form-level error display
- **Form Components**: `StandardInput`, `FormButtons`, `FormSection`

### Code Patterns and Conventions

#### File and Component Naming
- **Components**: PascalCase (e.g., `StudentForm.tsx`, `PaymentTable.tsx`)
- **Hooks**: camelCase starting with `use` (e.g., `useStudentManagement.ts`)
- **Utilities**: camelCase (e.g., `studentClassUtils.ts`)
- **Types/Interfaces**: PascalCase (e.g., `Student`, `PaymentObligation`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_PAGE_SIZE`)

#### Import/Export Patterns
```typescript
// ✅ CORRECT - Use @ alias for clean imports
import { Student } from '@/domains/students/studentsSlice';
import { StandardInput } from '@/components/common/StandardInput';
import { useAppSelector } from '@/store/hooks';

// ✅ CORRECT - Export patterns
export default StudentForm;              // Default export for main component
export type { StudentFormData };        // Named export for types
export { useStudentManagement };        // Named export for hooks
```

#### Component Composition Patterns
```typescript
// ✅ CORRECT - Forward refs for DOM access
export const StandardInput = React.forwardRef<HTMLInputElement, StandardInputProps>(
  ({ className, label, error, ...props }, ref) => {
    // Component implementation
  }
);
StandardInput.displayName = 'StandardInput';

// ✅ CORRECT - Component with proper TypeScript
interface ComponentProps {
  student: Student;
  onSubmit: (data: StudentFormData) => void;
  onCancel: () => void;
}

const StudentForm: React.FC<ComponentProps> = ({ student, onSubmit, onCancel }) => {
  // Component implementation
};
```

#### Redux Patterns
```typescript
// ✅ CORRECT - Domain slice structure
const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    setStudents: (state, action: PayloadAction<Student[]>) => {
      state.students = action.payload;
    },
    addStudent: (state, action: PayloadAction<Student>) => {
      state.students.push(action.payload);
    },
    updateStudent: (state, action: PayloadAction<Student>) => {
      const index = state.students.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.students[index] = action.payload;
      }
    }
  }
});

// ✅ CORRECT - Typed selectors
export const selectStudents = (state: RootState) => state.students.students;
export const selectLoading = (state: RootState) => state.students.loading;
```

#### Custom Hook Patterns
```typescript
// ✅ CORRECT - Domain-specific hook structure
export const useStudentManagement = () => {
  const dispatch = useAppDispatch();
  const students = useAppSelector(selectStudents);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleAddStudent = useCallback(async (studentData: StudentFormData) => {
    setLoading(true);
    try {
      // API call will replace this
      const newStudent = { ...studentData, id: generateId() };
      dispatch(addStudent(newStudent));
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  }, [dispatch]);
  
  return {
    students,
    searchTerm,
    setSearchTerm,
    loading,
    handleAddStudent
  };
};
```

#### Form Validation Patterns
```typescript
// ✅ CORRECT - Zod schema definition
const studentFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(1, 'Phone is required'),
  classId: z.string().min(1, 'Class selection is required')
});

type StudentFormData = z.infer<typeof studentFormSchema>;

// ✅ CORRECT - Form implementation
const StudentForm: React.FC<StudentFormProps> = ({ student, onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: student || {}
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StandardInput
        label="Name"
        {...register('name')}
        error={errors.name?.message}
      />
      {/* More fields */}
    </form>
  );
};
```

#### Glass Morphism Styling Patterns
```typescript
// ✅ CORRECT - Consistent glass morphism classes
const glassCardClasses = "bg-white/10 border border-white/20 backdrop-blur-sm";
const glassInputClasses = "bg-white/10 border-white/20 text-white placeholder:text-white/60";
const focusClasses = "focus:border-yellow-400 focus:ring-yellow-400";
const errorClasses = "border-red-400 focus:border-red-400";

// ✅ CORRECT - Standardized color usage
const textClasses = "text-white";           // Primary text
const mutedTextClasses = "text-white/80";   // Secondary text
const placeholderClasses = "text-white/60"; // Placeholder text
const accentClasses = "text-yellow-400";    // Accent/highlight
const errorTextClasses = "text-red-300";    // Error messages
```

### Key Configuration

#### Path Aliases
- `@/*` maps to `src/*` for clean imports
- Configured in both `tsconfig.json` and `vite.config.ts`

#### TypeScript Settings
- Relaxed settings for rapid development: `noImplicitAny: false`, `strictNullChecks: false`
- Skip lib checks for faster compilation
- Path aliases configured: `@/*` maps to `src/*`

#### Development Server
- Runs on port 8080 with IPv6 support (`host: '::'`)
- Uses SWC for fast React compilation
- Hot module replacement enabled
- Component tagger active in development mode

### Data Flow Patterns

#### API Integration (In Progress)
- **Endpoints**: Will consume REST API from think-english-api backend
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Proper loading indicators for all async operations
- **Caching**: Intelligent caching strategies for performance

#### Domain Data Loading
- **Lazy Loading**: Each domain loads its own data when needed
- **Custom Hooks**: Domain-specific hooks handle data fetching and state
- **Error Boundaries**: Component-level error boundaries catch and handle errors
- **Toast Notifications**: User feedback via Sonner toast system

### Important Implementation Details

#### Student Selection Components
- **Single Selection**: `SingleStudentSelectionPanel` and `SingleStudentSelectionTrigger`
- **Multi Selection**: `StudentSelectionPanel` and `StudentSelectionTrigger`
- **Consistent UX**: Used across domains for unified experience
- **Search Functionality**: Built-in search and filtering capabilities

#### Authentication
- **Current**: Demo mode authentication (being replaced)
- **Future**: JWT-based authentication with API
- **Auth State**: Managed in Redux with `authSlice`
- **Route Protection**: Authentication-aware routing

#### Error Handling
- **Error Boundaries**: `ErrorBoundary` component catches React errors
- **User Notifications**: `StandardAlertDialog` for critical errors
- **Toast System**: Sonner for non-blocking notifications
- **Form Errors**: Field-level validation with immediate feedback
- **API Errors**: Centralized error handling for API responses

#### Form Validation Patterns
- **Schema-Based**: Zod schemas for all form validation
- **Real-Time**: Field validation on blur and form submission
- **User Experience**: Clear error messages with visual indicators
- **Standardized Components**: Consistent form components across domains
- **Accessibility**: Proper ARIA labels and error associations

### Development Workflow Requirements

#### Pre-Development Checklist
1. **Read existing code** using analysis tools before making changes
2. **Check patterns** in target domain for consistency
3. **Verify current state**: `npm run build` and `npm run lint` must pass
4. **Understand component structure** and existing patterns

#### Mandatory Validation Workflow
```bash
# After EVERY change
npm run lint        # Must pass (warnings acceptable, errors must be fixed)
npm run build       # Must succeed
npm run format      # Apply consistent formatting
```

**CRITICAL**: Never mark tasks complete unless ALL validation steps pass.

#### Working with This Codebase

##### Adding New Features
1. **Identify Domain**: Place in appropriate domain or create new one
2. **Follow Patterns**: Use existing component and hook patterns
3. **State Management**: Create Redux slice if cross-component state needed
4. **Data Layer**: Implement domain-specific hooks for API integration
5. **UI Consistency**: Use standardized components and glass morphism styles

##### Component Development
- **Use shadcn/ui**: Leverage existing Radix UI primitives
- **Glass Morphism**: Follow established styling patterns
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: Implement proper ARIA labels and keyboard navigation
- **Error States**: Handle loading, error, and empty states

##### State Management Patterns
- **Domain Slices**: Create Redux slices for each business domain
- **Typed Hooks**: Use `useAppSelector` and `useAppDispatch`
- **Local State**: Keep UI-only state in React components
- **Custom Hooks**: Abstract complex logic into reusable hooks

### Quality Standards

#### Definition of Done
- [ ] `npm run lint` passes (warnings acceptable, errors must be fixed)
- [ ] `npm run build` succeeds without errors
- [ ] Code follows established patterns and conventions
- [ ] Components use glass morphism styling consistently
- [ ] Forms include proper validation with Zod schemas
- [ ] Error handling implemented with boundaries and user feedback
- [ ] Responsive design implemented
- [ ] Accessibility considerations addressed

#### Code Quality Requirements
- **TypeScript**: Use proper typing (avoid `any` where possible)
- **Component Structure**: Follow domain organization patterns
- **Naming Conventions**: PascalCase for components, camelCase for functions/variables
- **Import Organization**: Use `@/` aliases for clean imports
- **Documentation**: Include JSDoc comments for complex functions
- **Error Prevention**: Handle all error states gracefully

#### Component Standards
- **Forward Refs**: Use `React.forwardRef` when exposing DOM elements
- **Display Names**: Set `displayName` for debugging
- **Props Interface**: Define clear TypeScript interfaces
- **Default Props**: Use default parameters instead of `defaultProps`
- **Composition**: Prefer composition over inheritance

### Domain Features

#### Student Management
- Comprehensive student profiles with tabbed forms
- Payment tracking and obligation management
- Class assignment and academic progress
- Parent/guardian contact information

#### Financial Management
- Payment obligations assignment and tracking
- Payment recording against obligations
- Financial dashboards with metrics and visualizations
- Comprehensive reporting capabilities

#### Class & Attendance Management
- Class scheduling and room assignments
- Real-time attendance tracking with homework completion
- Grade management and assessment tools
- Teacher assignment and management

### Error Prevention & Recovery

#### Common Issues & Solutions
| Issue | Cause | Solution |
|-------|-------|----------|
| Build failures | TypeScript/lint errors | Run `npm run lint` to identify issues |
| Component not rendering | Import path issues | Check `@/` alias usage |
| Styling inconsistencies | Missing glass morphism classes | Use standardized component patterns |
| Form validation not working | Missing Zod schema | Implement proper schema validation |
| State not updating | Redux slice misconfiguration | Check slice export and store configuration |

#### Recovery Workflow
1. **STOP** making additional changes
2. **IDENTIFY** specific error through lint/build output
3. **CONSULT** existing patterns in similar components
4. **FIX** minimal change to resolve specific error
5. **VALIDATE** through lint and build before continuing

IMPORTANT: Do not run lint or build commands. ASK the user to that for you and give you feedback!