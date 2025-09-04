# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start development server on port 8080 with IPv6 support
- `npm run build` - Build for production
- `npm run build:dev` - Build for development mode
- `npm run lint` - Run ESLint (must pass before task completion)
- `npm run preview` - Preview production build
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Quality Validation Requirements
This project enforces code quality through:
- **ESLint**: Must pass linting (warnings acceptable, errors must be fixed)
- **TypeScript**: Compilation must succeed
- **Prettier**: Code formatting must be consistent
- **Build Validation**: `npm run build` must succeed

**CRITICAL**: Always run `npm run lint` and `npm run build` after making changes. Never mark tasks complete unless ALL validation steps pass.

## Architecture Overview

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **State Management**: Redux Toolkit with domain-specific slices
- **Routing**: React Router DOM
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS with glass morphism design system
- **Form Handling**: React Hook Form with Zod validation
- **Data Fetching**: Transitioning from mock data to API integration
- **Notifications**: Sonner (toast notifications)

### Domain-Driven Architecture

The project follows a domain-driven design pattern with clear separation of concerns:

```
src/
├── domains/              # Business domains
│   ├── auth/            # Authentication
│   ├── students/        # Student management
│   ├── teachers/        # Teacher management
│   ├── classes/         # Class management
│   ├── classrooms/      # Classroom management
│   ├── attendance/      # Attendance tracking
│   ├── grades/          # Grade management
│   ├── finance/         # Financial obligations & payments
│   └── privateLessons/  # Private lesson management
├── components/          # Shared UI components
│   ├── common/         # Reusable business components
│   ├── ui/             # shadcn/ui components
│   └── layout/         # App layout components
├── pages/              # Top-level page components
├── data/               # Mock data service (being replaced)
├── services/           # API services
├── store/              # Redux store configuration
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

### Key Architectural Patterns

#### Data Management
- **API Integration**: Transitioning from localStorage/demo mode to REST API
- **Redux Slices**: Each domain has its own slice for state management
- **Custom Hooks**: Domain-specific hooks for data operations (e.g., `useStudentsData`, `useClassesData`)
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages

#### Component Organization
- **shadcn/ui**: Core UI components in `src/components/ui/`
- **Common Components**: Shared business components in `src/components/common/`
- **Domain Components**: Feature-specific components within each domain
- **Standardized Components**: `StandardInput`, `StandardAlertDialog`, `StandardToast`

#### Glass Morphism Design System
- **Consistent Styling**: All components use glass morphism with `bg-white/10` and `border-white/20`
- **Color Scheme**: White text with yellow accent (`yellow-400`) for focus states
- **Error States**: Red accent (`red-400`) with semi-transparent backgrounds

### Development Patterns

#### Path Aliases
- `@/*` maps to `src/*` for clean imports
- Configured in both `tsconfig.json` and `vite.config.ts`

#### Form Validation
- **Zod Schemas**: All forms use Zod for validation
- **Real-time Validation**: Field validation on blur and form submission
- **Standardized Components**: Consistent form patterns across domains

#### Component Conventions
- **Components**: PascalCase (e.g., `StudentForm.tsx`)
- **Hooks**: camelCase starting with `use` (e.g., `useStudentManagement.ts`)
- **Types**: PascalCase (e.g., `Student`, `PaymentObligation`)
- **Forward Refs**: Use `React.forwardRef` with proper `displayName`

### API Integration Status

The application is currently transitioning from demo/mock data to full API integration:
- **Mock Data**: Located in `src/data/mock/` with JSON files
- **API Services**: Individual service files in `src/services/` for each domain
- **Migration**: Domain hooks abstract data layer for easy API transition

### Important Development Notes

#### TypeScript Configuration
- Relaxed settings for rapid development: `noImplicitAny: false`, `strictNullChecks: false`
- Path aliases configured for clean imports
- Skip lib checks for faster compilation

#### Development Server
- Runs on port 8080 with IPv6 support (`host: '::'`)
- Uses SWC for fast React compilation
- Component tagger active in development mode

#### Quality Standards
Before marking any task complete:
1. `npm run lint` must pass (warnings acceptable, errors must be fixed)
2. `npm run build` must succeed without errors
3. Code must follow established patterns and conventions
4. Components must use glass morphism styling consistently
5. Forms must include proper Zod validation

### Domain-Specific Features

#### Student Management
- Comprehensive student profiles with tabbed forms
- Payment tracking and obligation management
- Class assignment and academic progress tracking

#### Financial Management
- Payment obligations assignment and tracking
- Payment recording against obligations
- Financial dashboards with metrics and visualizations

#### Class & Attendance Management
- Class scheduling and room assignments
- Real-time attendance tracking with homework completion
- Grade management and assessment tools

### Error Prevention

#### Common Issues & Solutions
- **Build failures**: Always run `npm run lint` to identify TypeScript/lint errors
- **Component not rendering**: Check `@/` alias usage in imports
- **Styling inconsistencies**: Ensure glass morphism classes are applied consistently
- **Form validation not working**: Verify Zod schema implementation
- **State not updating**: Check Redux slice export and store configuration

#### Recovery Workflow
1. **STOP** making additional changes
2. **IDENTIFY** specific error through lint/build output
3. **CONSULT** existing patterns in similar components
4. **FIX** minimal change to resolve specific error
5. **VALIDATE** through lint and build before continuing

IMPORTANT: This project has existing CLAUDE.md with detailed implementation patterns - reference it for specific coding conventions and architectural decisions.
