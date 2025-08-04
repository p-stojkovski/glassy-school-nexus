# Glassy School Nexus

A comprehensive school management system built with modern technologies, featuring a React frontend and .NET Core backend in a monorepo structure.

## 🏗️ Architecture

This is a monorepo containing:

- **Frontend**: React 18 + TypeScript + Vite + shadcn/ui
- **Backend**: .NET Core API with vertical slice architecture
- **Database**: PostgreSQL (planned)
- **Documentation**: Comprehensive guides and specifications

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- .NET 8+ SDK (for backend development)
- PostgreSQL (for production database)

### Installation

```bash
# Install all dependencies
npm run install:all

# Or install root dependencies and frontend separately
npm install
cd frontend && npm install
```

### Development

```bash
# Start both frontend and backend in development mode
npm run dev

# Or start individually
npm run dev:frontend
npm run dev:backend
```

### Building

```bash
# Build both frontend and backend
npm run build

# Or build individually
npm run build:frontend
npm run build:backend
```

## 📁 Project Structure

```
glassy-school-nexus/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── domains/         # Domain-driven feature modules
│   │   ├── components/      # Shared UI components
│   │   ├── pages/          # Top-level pages
│   │   └── ...
│   ├── package.json
│   └── README.md
├── backend/                 # .NET Core API
│   ├── src/
│   │   ├── Api/
│   │   │   ├── Features/   # Vertical slice features
│   │   │   └── Shared/     # Cross-cutting concerns
│   │   └── ...
│   └── rules.md            # Backend coding standards
├── docs/                   # Project documentation
├── package.json            # Monorepo configuration
└── README.md              # This file
```

## 🔧 Available Scripts

### Root Level Commands

- `npm run dev` - Start both frontend and backend
- `npm run build` - Build both applications
- `npm run test` - Run all tests
- `npm run lint` - Lint all code
- `npm run clean` - Clean build artifacts

### Frontend Specific

- `npm run dev:frontend` - Start frontend dev server
- `npm run build:frontend` - Build frontend for production
- `npm run lint:frontend` - Lint frontend code

### Backend Specific

- `npm run dev:backend` - Start backend dev server
- `npm run build:backend` - Build backend
- `npm run lint:backend` - Lint backend code

## 🏛️ Frontend Architecture

The frontend follows a **domain-driven design** pattern with:

- **Domain Modules**: Each business domain (students, teachers, classes, etc.) is self-contained
- **Redux Toolkit**: State management with RTK Query for API calls
- **shadcn/ui**: Modern UI components built on Radix UI
- **TypeScript**: Full type safety throughout the application
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Key Features

- Student management with comprehensive profiles
- Teacher and staff management
- Class scheduling and management
- Attendance tracking with homework completion
- Grade management and reporting
- Financial obligations and payment tracking
- Private lesson scheduling
- Classroom resource management

## 🏗️ Backend Architecture

The backend follows **vertical slice architecture** principles:

- **Feature-First Organization**: Each feature is self-contained
- **Domain-Driven Design**: Strategic DDD where complexity warrants
- **Result Pattern**: Explicit success/failure handling
- **Dapper + PostgreSQL**: Lightweight, performant data access
- **Minimal APIs**: Clean, focused endpoint definitions

### Core Principles

- No shared DTOs between features
- Explicit validation and error handling
- Strong typing with value objects
- Comprehensive documentation and testing
- Security-first approach

## 📚 Documentation

- [Frontend Development Guide](./frontend/README.md)
- [Backend Coding Rules](./backend/rules.md)
- [API Endpoints Specification](./docs/api-endpoints-specification.md)
- [Database Schema Design](./docs/database-schema-design.md)
- [Backend Integration Analysis](./docs/backend-integration-analysis.md)

## 🔧 Development Workflow

1. **Fork and Clone**: Create your own fork and clone the repository
2. **Install Dependencies**: Run `npm run install:all`
3. **Create Feature Branch**: `git checkout -b feature/your-feature-name`
4. **Develop**: Make your changes following the coding standards
5. **Test**: Ensure all tests pass with `npm run test`
6. **Lint**: Clean up code with `npm run lint`
7. **Submit PR**: Create a pull request with detailed description

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and dev server
- **Redux Toolkit** - Predictable state management
- **TanStack Query** - Server state management
- **shadcn/ui** - High-quality UI components
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

### Backend (Planned)
- **.NET 8** - Modern C# and .NET platform
- **ASP.NET Core** - Web API framework
- **Dapper** - Lightweight ORM
- **PostgreSQL** - Robust relational database
- **FluentValidation** - Input validation
- **Serilog** - Structured logging

## 📝 Contributing

Please read our contributing guidelines and follow the established coding standards:

- Frontend: Follow the patterns established in the domain modules
- Backend: Adhere to the rules defined in `backend/rules.md`
- Tests: Include tests for new features and bug fixes
- Documentation: Update relevant documentation with your changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Follows domain-driven design principles
- Implements vertical slice architecture for maintainability
- Uses industry-standard tools and frameworks