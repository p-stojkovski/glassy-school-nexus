# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this monorepo.

## Project Structure

This is a monorepo containing both frontend and backend applications:

```
glassy-school-nexus/
├── frontend/                 # React + TypeScript frontend
├── backend/                  # .NET Core API backend
├── docs/                     # Shared documentation
├── package.json              # Monorepo workspace configuration
└── README.md                 # Project overview
```

## Development Commands

### Monorepo Commands (run from root)

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both applications
- `npm run test` - Run all tests (frontend and backend)
- `npm run lint` - Lint all code
- `npm run clean` - Clean all build artifacts
- `npm install` - Install root dependencies
- `npm run install:all` - Install all dependencies (root + frontend)

### Frontend Commands

- `npm run dev:frontend` - Start frontend development server (port 8080)
- `npm run build:frontend` - Build frontend for production
- `npm run lint:frontend` - Lint frontend code

### Backend Commands

- `npm run dev:backend` - Start backend development server
- `npm run build:backend` - Build backend
- `npm run lint:backend` - Lint backend code (when configured)

## Architecture Overview

### Frontend (React + TypeScript)
- **Location**: `/frontend`
- **Tech Stack**: React 18, TypeScript, Vite, Redux Toolkit, shadcn/ui
- **Port**: 8080 (development)
- **Architecture**: Domain-driven design with vertical slices
- **Documentation**: See `/frontend/README.md`

### Backend (.NET Core API)
- **Location**: `/backend`
- **Tech Stack**: .NET 8, ASP.NET Core Minimal APIs, Dapper, PostgreSQL
- **Architecture**: Vertical slice architecture following DDD principles
- **Documentation**: See `/backend/rules.md`

## Development Workflow

### Getting Started

1. **Clone and install dependencies**:
   ```bash
   git clone <repo-url>
   cd glassy-school-nexus
   npm run install:all
   ```

2. **Start development servers**:
   ```bash
   npm run dev
   ```
   This starts both frontend (http://localhost:8080) and backend

3. **Or start individually**:
   ```bash
   npm run dev:frontend  # Frontend only
   npm run dev:backend   # Backend only
   ```

### Frontend Development

- Navigate to `/frontend` for frontend-specific work
- Follow the domain-driven architecture patterns
- Use existing UI components from shadcn/ui
- State management with Redux Toolkit
- See `/frontend/CLAUDE.md` for detailed frontend guidance

### Backend Development

- Navigate to `/backend` for backend-specific work
- Follow vertical slice architecture principles
- Adhere to the coding rules in `/backend/rules.md`
- Use Dapper for data access with PostgreSQL
- Implement features as self-contained slices

### Testing

- Frontend: Tests not yet configured (use frontend package.json when added)
- Backend: Use `dotnet test` commands from backend directory
- Run all tests: `npm run test` from root

### Code Standards

- **Frontend**: Follow TypeScript and React best practices
- **Backend**: Strictly follow the rules defined in `/backend/rules.md`
- **Shared**: Use consistent naming and documentation practices

## Integration Points

### API Communication
- Frontend communicates with backend via REST API
- CORS configured for development (localhost:8080)
- API endpoints follow RESTful conventions

### Database
- PostgreSQL database for backend
- Connection string in backend appsettings.json
- Migrations managed via Entity Framework (when configured)

### Development Tools

#### VS Code Configuration
- Workspace settings in `.vscode/settings.json`
- Tasks configured for common operations
- Launch configurations for debugging

#### Available Tasks (Ctrl+Shift+P → Tasks: Run Task)
- Start Frontend
- Start Backend  
- Start Both (Dev)
- Build All
- Test All
- Clean All

## Important Notes

- **Monorepo Structure**: Each part (frontend/backend) maintains its own dependencies
- **Development**: Both servers can run simultaneously for full-stack development
- **Production**: Build both applications separately for deployment
- **Documentation**: Update relevant README files when making changes
- **Architecture**: Maintain separation between frontend and backend concerns

## Backend Rules

The backend follows strict architectural principles defined in `/backend/rules.md`:
- Vertical slice architecture
- Domain-driven design where appropriate
- Result pattern for error handling
- Dapper for data access
- Minimal APIs
- Strong typing with value objects

## Frontend Architecture

The frontend uses domain-driven design:
- Domain modules for business logic
- Redux Toolkit for state management
- shadcn/ui for consistent UI components
- TypeScript for type safety
- Responsive design with Tailwind CSS

## Quick Reference

- **Frontend Dev Server**: http://localhost:8080
- **Backend API**: http://localhost:5000 (when running)
- **Documentation**: `/docs` directory
- **Frontend Docs**: `/frontend/README.md`
- **Backend Rules**: `/backend/rules.md`