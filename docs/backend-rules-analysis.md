# Backend Rules Analysis: Comprehensive Report

**Document Version**: 1.0  
**Last Updated**: 2025-01-04  
**Status**: Active Reference Document  
**Purpose**: Comprehensive analysis of backend architectural rules and implementation guidance

---

## 🎯 Executive Summary

The `backend/rules.md` file defines a **rigorous architectural framework** for a .NET backend centered on **Domain-First Vertical Slice Architecture**. This is not typical enterprise guidance—it's a **comprehensive engineering philosophy** with 948 lines of detailed requirements using RFC-2119 normative keywords.

**Core Philosophy**: "Code is a solution to a human problem. Until you understand the human, you are not ready to code."

**Key Architectural Pillars:**
- **Domain-First Approach**: "Understand the domain first" (Rule 0)
- **Vertical Slice Architecture**: Isolated, cohesive feature boundaries
- **Result Pattern**: Explicit success/failure contracts
- **No-Code Mandate**: Prefer simpler solutions over complex implementations
- **Security by Default**: All endpoints require authentication unless explicitly reviewed

---

## 🚫 Non-Negotiable Requirements (MUST)

*These are merge-blocking violations that prevent code from being merged.*

### 🏗️ Architecture & Design
- **MUST** follow Vertical Slice principles - no cross-slice references (§18)
- **MUST** return `Result<T>` from all feature logic (§13)
- **MUST** implement Request Flow Contract: Endpoint → Validation → Command/Query → DB → Result → HTTP (§18)
- **MUST** answer 4 no-code questions before adding any code (§3)
- **MUST** capture domain discovery in mini-ADR format (§2.2)
- **MUST** represent domain concepts with strongly-typed primitives (§12.1)
- **MUST** implement Value Objects as immutable sealed records (§12.1)
- **MUST** validate in Value Object constructors (§12.1)

### 💾 Data Access & Persistence
- **MUST** use Dapper exclusively (EF Core forbidden) (§25)
- **MUST** parameterize all SQL via Dapper anonymous objects (§25.2)
- **MUST** define SQL as const string or embedded resource (§25.1)
- **MUST** implement Dapper TypeHandlers for persisted Value Objects (§12.2)

### 🔒 Security (Non-Negotiable)
- **MUST** require authentication on all endpoints unless explicitly marked public and reviewed (§27.1)
- **MUST** store secrets in environment variables + Azure Key Vault (§27.3)
- **MUST** use HTTPS only with HTTP→HTTPS redirects (§27.4)
- **MUST** never log passwords, tokens, or full PII (§27.6)
- **MUST** require security review for PRs touching auth, crypto, or external exposure (§27.8)

### 📝 Documentation & API
- **MUST** include feature README.md in same PR as code changes (§8.2)
- **MUST** update documentation with behavior changes (§8.3)
- **MUST** generate OpenAPI v3 specification via Swashbuckle (§23.1)
- **MUST** use XML summary comments on public models & properties (§23.1)
- **MUST** implement RFC 9457 Problem Details format (§21.2)

### ⚙️ Background Processing
- **MUST** implement Outbox pattern for reliable messaging (§14.2.1)
- **MUST** make background job dispatchers idempotent (§14.2.1)
- **MUST** flow all state changes through State Machine (§14.2.2)
- **MUST NOT** starve primary request path with background processing (§30.1)

### ✅ Validation & Error Handling
- **MUST NOT** call business logic if validation fails (§19.3)
- **MUST** implement validation before Command/Query execution (§19)
- **MUST** map `Result<T>` failures to appropriate HTTP status codes (§21)

---

## ⚠️ Strong Recommendations (SHOULD)

*Deviations require justification in PR description.*

### Performance
- **SHOULD** complete interactive API calls < 300ms P50, < 500ms P95 (§30.1)
- **SHOULD** define at least one business KPI metric per slice (§28.2)

### Testing
- **SHOULD** follow test pyramid ratios: 60% unit, 30% integration, 10% E2E (§29.1)
- **SHOULD** use test containers for slice integration tests (§29.2)

### Background Processing
- **SHOULD** use Quartz.NET for durable background jobs (§20.2)

### Cloud Integration
- **SHOULD** use Azure Service Bus for reliable messaging (§15.1)
- **SHOULD** prefer external identity providers (Azure AD/Entra ID) (§27.1)

---

## ✅ Optional Practices (MAY)

*Use professional judgment.*

- **MAY** extract reusable patterns after ≥2 production occurrences (§5.1)
- **MAY** use Azure Functions for lightweight event-driven tasks (§15.3)
- **MAY** implement column-level encryption for sensitive data (§27.5)

---

## 🏛️ Core Architectural Patterns

### 1. Vertical Slice Architecture (Mandatory)

**Principle**: Each feature is a self-contained vertical slice with all artifacts collocated.

**Structure**:
```
Features/
├── [Entity][Action]/
│   ├── [Action]Endpoint.cs         # HTTP boundary
│   ├── [Action]Command.cs          # Write operations
│   ├── [Action]Query.cs            # Read operations  
│   ├── [Action]Request.cs          # Input contracts
│   ├── [Action]Response.cs         # Output contracts
│   ├── [Action]Validator.cs        # Validation logic
│   └── README.md                   # Feature documentation
```

**Isolation Rules**:
- No direct references between feature folders
- No shared request/response models across slices
- Shared project contains only cross-cutting infrastructure

### 2. Result Pattern (Mandatory)

**Purpose**: Explicit success/failure contracts replacing exceptions for expected outcomes.

**Implementation**:
```csharp
public sealed record Error(string Code, string Description);

public sealed record Result<T>
{
    public T? Value { get; }
    public Error? Error { get; }
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    
    public static Result<T> Success(T value) => new(value);
    public static Result<T> Failure(Error error) => new(error);
}
```

**Usage**: All Commands/Queries return `Task<Result<T>>`

### 3. Domain-Driven Design (Strategic Application)

**When to Apply**: Complex domain rules, invariants, and state transitions (not for simple CRUD)

**Core Patterns**:
- **Aggregate**: Consistency boundary, external access via Aggregate Root only
- **Entity**: Identity-based objects with behavior methods (no naked setters)
- **Value Object**: Immutable objects with equality by value
- **Domain Events**: Raised on meaningful state changes, dispatched via Outbox

### 4. Outbox Pattern (Mandatory for Reliable Messaging)

**When Required**: Transaction must both change DB state AND publish external message atomically.

**Implementation Steps**:
1. Create `outbox_messages` table
2. Write business data + outbox entry in same transaction
3. Background dispatcher reads unprocessed rows
4. Publish to message broker (Azure Service Bus)
5. Mark as processed
6. Handle poison messages after N retries

### 5. State Machine Pattern (Mandatory for Complex Lifecycles)

**When Required**: Entity has ≥3 states with non-trivial transition rules.

**Implementation**:
- Persist state in dedicated column
- Create sealed `[Entity]StateMachine` class
- Provide `CanTransition` + `Transition` APIs
- Raise domain events on meaningful transitions

---

## 🛠️ Technology Stack Requirements

### Mandatory Technologies

| Technology | Purpose | Notes |
|------------|---------|-------|
| **Dapper** | Data Access | EF Core explicitly forbidden |
| **PostgreSQL** | Database | snake_case naming convention |
| **.NET Minimal APIs** | HTTP Layer | Built-in DI, extension methods for grouping |
| **FluentValidation** | Input Validation | Per-slice validators |
| **OpenTelemetry** | Distributed Tracing | Inbound HTTP, outbound DB, queue operations |
| **Serilog** | Structured Logging | Contextual enrichers required |

### Recommended Technologies

| Technology | Purpose | Alternative |
|------------|---------|-------------|
| **Quartz.NET** | Background Jobs | In-memory queue for dev/test |
| **Azure Service Bus** | Reliable Messaging | Azure Event Hubs for telemetry |
| **Azure Functions** | Event-driven Tasks | Background services |
| **Azure Key Vault** | Secrets Management | Environment variables |

### Azure Services Integration

- **Azure Service Bus**: Business event fan-out via Outbox pattern
- **Azure Event Hubs**: High-throughput telemetry ingestion
- **Azure Functions**: Cross-service workflows, transformations
- **Azure Key Vault**: Production secrets and certificate storage

---

## 🔒 Security, Testing & Quality Requirements

### Security Baseline (Non-Negotiable)

**Authentication & Authorization**:
- All endpoints require auth unless explicitly public + reviewed
- External identity provider preferred (Azure AD/Entra ID)
- Authorization via policies (role/claim/tenant), no ad-hoc checks

**Data Protection**:
- Input validation on all endpoints
- Output encoding for HTML/email templates
- Maximum payload sizes to prevent DoS
- PII classification and minimal storage

**Transport Security**:
- HTTPS only with automatic HTTP→HTTPS redirect
- HSTS headers in production
- Rate limiting (global & per-client)

**Secrets Management**:
- No secrets in source code
- Environment variables + Azure Key Vault
- Regular credential rotation (automated)

### Testing Strategy

**Test Pyramid** (Target Ratios):
- **Unit Tests (60%)**: Value objects, entity behavior, business logic
- **Integration Tests (30%)**: Slice boundaries including DB (test containers)
- **E2E Tests (10%)**: Critical happy paths across system

**Required Test Types**:
- Value Object construction & validation tests
- Entity state transition tests
- Slice integration tests (endpoint → DB)
- Contract tests for external integrations
- Performance smoke tests for hot endpoints

**Quality Gates**:
- Minimum coverage target (e.g., 80% non-infrastructure code)
- All tests must pass (merge-blocking)
- Parallel execution with isolated schemas
- Deterministic test data (no random unless seeded)

### Performance Requirements

**Response Time Budgets**:
- Interactive APIs: < 300ms P50, < 500ms P95
- Background jobs must not starve primary request path

**Load Testing Practice**:
- Scenario-driven with realistic user ramps
- Standard bands: 10, 50, 100, 150, 300, peak users
- Historical tracking in `/perf/reports/`

---

## 💻 Implementation Patterns & Examples

### Request Flow Implementation

```csharp
// Endpoint Handler (Minimal Responsibilities)
app.MapPost("/products", async (CreateProductRequest request, 
    CreateProductCommand command, CancellationToken ct) =>
{
    // 1. Bind & validate input (automatic model binding)
    // 2. Invoke feature command
    var result = await command.ExecuteAsync(request, ct);
    
    // 3. Map Result<T> to HTTP
    return result.IsSuccess 
        ? Results.Created($"/products/{result.Value.Id}", result.Value)
        : result.Error!.ToHttpResult();
});

// Command Implementation
public sealed class CreateProductCommand
{
    public async Task<Result<ProductResponse>> ExecuteAsync(
        CreateProductRequest request, CancellationToken ct)
    {
        // Validation already performed by endpoint
        
        // Domain logic
        var product = Product.Create(request.Name, request.Price);
        
        // Persistence
        await _repository.SaveAsync(product, ct);
        
        // Response mapping
        return Result<ProductResponse>.Success(
            new ProductResponse(product.Id, product.Name));
    }
}
```

### Value Object with Dapper Integration

```csharp
// Value Object
public sealed record ProductId
{
    public Guid Value { get; }
    
    public ProductId(Guid value)
    {
        if (value == Guid.Empty)
            throw new ArgumentException("ProductId cannot be empty");
        Value = value;
    }
}

// Dapper Type Handler
public sealed class ProductIdTypeHandler : SqlMapper.TypeHandler<ProductId>
{
    public override ProductId Parse(object value) => new((Guid)value);
    public override void SetValue(IDbDataParameter parameter, ProductId value) 
        => parameter.Value = value.Value;
}

// Registration in Program.cs
SqlMapper.AddTypeHandler(new ProductIdTypeHandler());
```

### Error Handling & Problem Details

```csharp
// Standard Error Catalog
public static class StandardErrors
{
    public static Error NotFound(string entity, string id) => 
        new("not_found", $"{entity} with id '{id}' was not found");
    
    public static Error Validation(string field, string message) =>
        new("validation_failed", $"{field}: {message}");
}

// HTTP Mapping Extension
public static IResult ToHttpResult(this Error error) => error.Code switch
{
    "not_found" => Results.Problem(
        statusCode: 404,
        title: "Resource Not Found",
        detail: error.Description,
        type: "https://tools.ietf.org/html/rfc7231#section-6.5.4"),
    
    "validation_failed" => Results.ValidationProblem(
        errors: new Dictionary<string, string[]> { ["field"] = [error.Description] }),
    
    _ => Results.Problem(
        statusCode: 500,
        title: "Internal Server Error",
        detail: "An unexpected error occurred")
};
```

---

## 📊 Current Solution Compliance Assessment

### ✅ Currently Compliant
- .NET 8.0 with Minimal APIs
- Basic project structure (API + Core)
- HTTPS redirection enabled
- Swagger/OpenAPI configured

### ❌ Non-Compliant Areas
- Default template code (WeatherForecast)
- No Result pattern implementation
- No authentication/authorization
- No Dapper integration
- No validation framework
- No structured logging
- Missing Features/ folder structure
- Missing shared infrastructure

### ⚠️ Missing Critical Components
- Error handling infrastructure
- Value Object implementations
- Database connection factory
- Authentication middleware
- Validation pipeline
- Observability setup

---

## 🗺️ Implementation Roadmap

### Phase 1: Foundation (Priority: Critical)
1. **Remove template code** (`WeatherForecast`, `Class1.cs`)
2. **Implement Result pattern** in Shared infrastructure
3. **Add Dapper + PostgreSQL** dependencies
4. **Create Features/ folder structure**
5. **Add authentication middleware**
6. **Implement basic validation pipeline**

### Phase 2: Infrastructure (Priority: High)
1. **Database connection factory**
2. **Value Object base classes**
3. **Error catalog (StandardErrors)**
4. **Problem Details HTTP mapping**
5. **Structured logging setup**
6. **Configuration validation**

### Phase 3: First Feature (Priority: High)
1. **Create vertical slice example** (e.g., GetStudentById)
2. **Implement complete request flow**
3. **Add feature-level tests**
4. **Document feature README**
5. **Validate compliance checklist**

### Phase 4: Advanced Patterns (Priority: Medium)
1. **Outbox pattern implementation**
2. **Background job infrastructure**
3. **Domain event handling**
4. **State machine pattern**
5. **Performance monitoring**

### Phase 5: Production Readiness (Priority: Medium)
1. **Load testing framework**
2. **Security review process**
3. **CI/CD compliance gates**
4. **Observability dashboards**
5. **Documentation automation**

---

## ✅ Feature Development Compliance Checklist

### Pre-Development ✋
- [ ] **Discovery completed**: Problem understood, user story defined, ubiquitous language captured
- [ ] **No-code evaluation**: Answered 4 mandatory questions (§3)
- [ ] **Approach documented**: Mini-ADR created with problem/context/solution

### Implementation ⚙️
- [ ] **Vertical slice created**: Feature folder with all artifacts collocated
- [ ] **Value objects defined**: Domain primitives with validation in constructors
- [ ] **Request flow implemented**: Endpoint → Validation → Command/Query → DB → Result → HTTP
- [ ] **SQL parameterized**: All Dapper queries use anonymous object parameters
- [ ] **Type handlers registered**: Dapper integration for custom value objects
- [ ] **Result pattern applied**: All commands/queries return `Result<T>`

### Quality & Security 🔒
- [ ] **Authentication enforced**: Endpoint requires auth or explicitly marked public + reviewed
- [ ] **Input validated**: Syntactic validation before business logic
- [ ] **Error handling**: Proper Result→HTTP mapping with Problem Details
- [ ] **Logging implemented**: Structured logging with correlation IDs, no PII
- [ ] **Tests added**: Unit tests for value objects, integration tests for slices

### Documentation 📚
- [ ] **Feature README updated**: Purpose, design decisions, usage examples in same PR
- [ ] **OpenAPI documented**: Swagger summaries, response types, examples
- [ ] **HTTP file updated**: Manual testing scenarios in Api.http

### Observability 📊
- [ ] **Metrics defined**: At least one business KPI per slice
- [ ] **Tracing enabled**: OpenTelemetry instrumentation for boundaries
- [ ] **Health checks**: Dependencies monitored

### Background Processing (if applicable) ⏱️
- [ ] **Outbox pattern**: Reliable messaging implementation
- [ ] **Idempotency**: Safe retry mechanisms
- [ ] **Poison handling**: Dead letter strategy after N retries
- [ ] **Monitoring**: Queue backlog and failure metrics

---

## 📚 Quick Reference Guide

### Naming Conventions
- **Slices**: `[Entity][Action]` (e.g., `StudentCreate`, `OrderFulfill`)
- **Commands**: `*Command` (e.g., `CreateStudentCommand`)
- **Queries**: `*Query` (e.g., `GetStudentByIdQuery`)
- **Endpoints**: `*Endpoint` (e.g., `CreateStudentEndpoint`)
- **Value Objects**: `*Id`, `*Code`, `*Address` (domain-specific)
- **Database**: `snake_case` tables/columns, plural table names

### HTTP Status Code Mapping
| Result Type | HTTP Status | Body Type |
|-------------|-------------|-----------|
| Success with value | 200 OK / 201 Created | Value |
| Success no value | 204 No Content | — |
| NotFound | 404 Not Found | ProblemDetails |
| Validation | 400 Bad Request | ValidationProblemDetails |
| Conflict | 409 Conflict | ProblemDetails |
| Unauthorized | 401 Unauthorized | ProblemDetails |

### Common Patterns
- **Repository**: One per aggregate, async methods only
- **Validation**: FluentValidation per slice in same folder
- **Background Jobs**: Quartz.NET with durable storage
- **Messaging**: Outbox → Azure Service Bus pattern
- **Configuration**: Strongly-typed Options classes validated at startup

---

## 🎯 Key Success Factors

1. **Domain Understanding First**: Never code without understanding the business problem
2. **Fail Fast on Architecture**: Enforce vertical slice boundaries early
3. **Security by Default**: Assume hostile network, validate everything
4. **Documentation as Code**: Keep docs synchronized with implementation
5. **Measure Everything**: Performance, business KPIs, error rates
6. **Quality Gates**: Make compliance validation automatic

---

## 🔗 References

- **Source Document**: `/backend/rules.md` (948 lines)
- **RFC 2119**: Normative keywords (MUST, SHOULD, MAY)
- **RFC 9457**: Problem Details for HTTP APIs
- **Related Documents**: 
  - `/docs/backend-integration-roadmap.md`
  - `/docs/database-schema-design.md`
  - `/docs/api-endpoints-specification.md`

---

**This analysis reveals that `rules.md` is not just coding standards—it's a comprehensive engineering philosophy designed to create maintainable, secure, and performant systems through disciplined architectural practices.**