# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start development server on port 8080
- `npm run build` - Build for production
- `npm run build:dev` - Build for development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Testing
This project does not have tests configured. When adding testing, check the package.json for test scripts.

## Architecture Overview

### Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Authentication**: Local state management (demo mode)

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
- **Mock Data Service**: Centralized data management via `MockDataService` singleton
- **Local Storage**: Data persistence using localStorage with validation
- **Domain Hooks**: Each domain has custom hooks for data operations (e.g., `useStudentsData`, `useTeachersData`)
- **Redux Slices**: Each domain has its own Redux slice for state management

#### Component Organization
- **shadcn/ui**: Core UI components in `src/components/ui/`
- **Common Components**: Shared components in `src/components/common/`
- **Domain Components**: Feature-specific components within each domain
- **Layout Components**: App structure components in `src/components/layout/`

#### State Management
- **Redux Store**: Configured with domain-specific slices
- **Typed Hooks**: `useAppSelector` and `useAppDispatch` for type safety
- **Async Actions**: RTK Query patterns for data fetching
- **Local State**: React state for UI-only concerns

### Key Configuration

#### Path Aliases
- `@/*` maps to `src/*` for clean imports
- Configured in both `tsconfig.json` and `vite.config.ts`

#### TypeScript Settings
- Relaxed settings for rapid development: `noImplicitAny: false`, `strictNullChecks: false`
- Skip lib checks for faster compilation

#### Development Server
- Runs on port 8080 with IPv6 support (`host: '::'`)
- Uses SWC for fast React compilation

### Data Flow Patterns

#### Demo Mode
- All data is stored in localStorage
- `MockDataService` provides CRUD operations
- `DemoManager` component handles data reset functionality
- Demo notices appear throughout the app

#### Domain Data Loading
- Lazy loading: Each domain loads its own data when needed
- Caching: Data is cached in MockDataService for performance
- Fallback: Defaults to JSON files if localStorage is empty
- Validation: Data structure validation before save/load

### Important Implementation Details

#### Student Selection
- Single student selection: `SingleStudentSelectionPanel` and `SingleStudentSelectionTrigger`
- Multi-student selection: `StudentSelectionPanel` and `StudentSelectionTrigger`
- Used across domains for consistent UX

#### Authentication
- Demo mode authentication (no real auth)
- Auto-login after initial setup
- Auth state managed in Redux

#### Error Handling
- `ErrorBoundary` for component error catching
- `StandardAlertDialog` for user-facing errors
- Toast notifications via Sonner

#### Form Management
- React Hook Form with Zod validation
- Standardized form components (`StandardInput`, `FormButtons`)
- Consistent form patterns across domains

### Working with This Codebase

#### Adding New Features
1. Identify the appropriate domain or create a new one
2. Follow the domain structure pattern
3. Create Redux slice if state management is needed
4. Implement data hooks following existing patterns
5. Use existing UI components and patterns

#### Data Operations
- Use `mockDataService` for all data operations
- Create domain-specific hooks for complex operations
- Always handle localStorage errors gracefully
- Use the caching mechanisms for performance

#### UI Development
- Leverage shadcn/ui components
- Follow Tailwind CSS patterns
- Use consistent spacing and color schemes
- Implement responsive design patterns

#### State Management
- Create domain-specific Redux slices
- Use RTK patterns for async operations
- Keep UI state local when possible
- Use typed hooks for type safety

### Financial Management
The application includes comprehensive financial management features:
- Payment obligations assignment and tracking
- Payment recording against obligations
- Financial dashboards with metrics and visualizations
- Data export capabilities
- All financial data stored in localStorage for demo purposes

Refer to the Financial Management documentation in the `docs/` directory for detailed implementation guidance.