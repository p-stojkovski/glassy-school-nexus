# .NET API: Coding & Architecture Rules

**Status:** *Revised Draft for Team Review*\
**Last Updated:** 2025-07-16\
**Owners:** Architecture Guild (Petar + Tech Leads)\
**Applies To:** All code in this repository (API, background jobs, supporting libraries) *and* any AI-assisted code generation targeting this solution.

> **Executive TL;DR** – Understand the domain. Build vertical slices. Prefer no code. Ship docs with code. Model the domain with strong types. Return `Result<T>`, not exceptions for expected outcomes. Use Dapper only. Seal everything unless there’s a darn good reason not to. Keep slices isolated. Secure everything. Measure and improve.

---

## Table of Contents

**0. Normative Keywords & Reading This Document**\
**1. Purpose & Scope**\
**2. Rule 0 – Understand the Domain First**\
**3. The No‑Code / Intentional Design Mandate**\
**4. Plan → Do → Reflect Continuous Improvement Loop**\
**5. Compounding Engineering: Make Future Work Cheaper**\
**6. Fundamental Design Principles (KISS, DRY, SOLID, etc.)**\
**7. Code as Narrative: Write to Be Understood**\
**8. Documentation & Knowledge Sharing**\
**9. Core Vertical Slice Principles**\
**10. System Design Philosophy (Scalability, Resilience, Performance)**\
**11. Strategic Domain‑Driven Design (DDD)**\
**12. Strongly‑Typed Domain Primitives (Value Objects)**\
**13. The Result Pattern**\
**14. Design Pattern Usage Guidance**\
**15. Cloud Integration & Azure Services**\
**16. Ubiquitous Language & Naming Conventions**\
**17. Project Structure**\
**18. Vertical Slice Architecture Rules (Detailed)**\
**19. Validation Rules**\
**20. Background Processing & Asynchronous Operations**\
**21. Error Handling, Problem Details & Logging Contracts**\
**22. API Evolution & Versioning Strategy**\
**23. API Documentation & Manual Testing Artifacts**\
**24. .NET Minimal API Implementation Rules**\
**25. Data Access: Dapper & PostgreSQL**\
**26. Database Migrations**\
**27. Security Baseline**\
**28. Observability (Logging, Metrics, Tracing)**\
**29. Testing Strategy & Quality Gates**\
**30. Performance Budgets & Load Testing**\
**31. Configuration, Secrets & Environment Management**\
**32. CI/CD Enforcement Hooks**\
**33. Definition of Done Checklist**\
**Appendices** – Feature README template, PR template, Error code catalog, Naming quick reference, Background job reliability checklist.

---

## 0. Normative Keywords & Reading This Document

We use RFC‑2119 style keywords to make intent unambiguous:

- **MUST** / **MUST NOT** – Non‑negotiable. Breaking these blocks merge unless a written exception is granted.
- **SHOULD** / **SHOULD NOT** – Strong recommendation. Deviations require justification in PR description.
- **MAY** – Optional; use judgement.

> **Enforcement:** All **MUST** rules are considered *merge‑blocking* when violated. Automated analyzers, template checklists, or human PR review will enforce compliance.

---

## 1. Purpose & Scope

This document defines the mandatory coding, architecture, documentation, security, and testing rules for this project. These are **requirements**, not suggestions. They exist to create a codebase that is:

- **Understandable** (communicates business intent)
- **Maintainable** (isolated change surfaces)
- **Testable** (deterministic, composable)
- **Secure** (least privilege; no data leaks)
- **Performant** (fast where it matters; predictable everywhere else)
- **Evolvable** (versioned; non‑breaking by default)

The architecture centers on a strict **Vertical Slice** approach, with **strategic DDD** applied where domain complexity warrants, and **Azure cloud services** leveraged for scale, integration, and cost efficiency.

---

## 2. Rule 0 – Understand the Domain First

> *Code is a solution to a human problem. Until you understand the human, you are not ready to code.*

### 2.1 Discovery Is Mandatory (for all non‑trivial work)

1. **Engage the Source** – Talk to domain experts, stakeholders, users. Shadow real workflows where possible.
2. **Ask “Why?” Relentlessly** – The request is usually a *proposed solution*, not the *underlying problem*. Use the **5 Whys** technique to drill down.
   - Request: “Add CSV export.”
   - Why? “We need a report.” → “We need to see top‑selling products.” → Real need: *Quick visibility into top movers.* Maybe the right answer is an in‑app dashboard, not CSV.
3. **Define the User Story** – “As a [role], I want [task], so that [goal].” If you cannot state this cleanly, pause coding.
4. **Capture Ubiquitous Language** – Record the domain nouns/verbs you hear. These become class names, DB tables, and API shapes.

### 2.2 Discovery Deliverable (Mini ADR)

Before implementation, capture discovery in a short note (in issue, PR, or feature README): problem, context, alternatives considered, chosen approach, open questions.

---

## 3. The No‑Code / Intentional Design Mandate

> Every line of code is future maintenance debt. Spend budget wisely.

Before adding code you **MUST** answer:

1. **Is this needed *****now*****?** (YAGNI.)
2. **Is there a simpler non‑code or low‑code solution?** Config, SQL view, report, Azure service, doc?
3. **Can we delete or refactor existing code instead?**
4. **What is the smallest viable slice that delivers user value?** Ship that.

Document your answer in the issue/PR for all medium+ tasks (> 4h est.)

---

## 4. Plan → Do → Reflect Continuous Improvement Loop

Intentional engineering beats hero hacking.

### 4.1 Plan (Before Code)

- **Approach:** Which files/slices? Data shape changes? Risk areas?
- **Learning Target:** What new thing will you learn / improve?
- **Definition of Done:** Tests? Docs updated? End‑to‑end manually verified in *dev*? Observability wired?

### 4.2 Do (Implement)

- Write code, tests, docs in same branch.
- Adapt the plan as new info emerges; record what changed.

### 4.3 Reflect (After Merge)

Personal + technical:

- What went well / poorly?
- Did the plan hold? Why/why not?
- What did you learn? Capture as comment or short retro note.
- Did you leave the codebase better? (Boy Scout Rule.)

> *Teams that reflect improve. Teams that don’t repeat mistakes.*

---

## 5. Compounding Engineering: Make Future Work Cheaper

Every task is a chance to increase velocity tomorrow.

### 5.1 Build Reusable Assets (Observed Patterns Only)

If the same shape repeats *in production code* ≥2 times, consider extracting:

- Validators
- Integration helpers
- Test fixtures
- Serialization helpers

**Do not pre‑abstract speculative patterns.** (Balance with YAGNI.)

### 5.2 Boy Scout Rule

Touch a file? Leave it slightly better: clearer name, smaller method, remove dead code, add missing null guard. Micro‑refactors compound.

### 5.3 Automate Toil

Performed a manual step twice? Automate (script, GitHub Action, template make target, etc.). Automation buys time and reduces human error.

### 5.4 Documentation as a Force Multiplier

Good docs are archived discovery. They shrink onboarding time and prevent re‑litigation of old decisions.

---

## 6. Fundamental Design Principles (KISS, DRY, SOLID, etc.)

- **KISS** – Prefer the simplest working solution.
- **DRY** – Centralize knowledge. If two places must be in sync, extract.
- **SOLID** –
  1. **S**ingle Responsibility – One reason to change (applies at slice level).
  2. **O**pen/Closed – Extend without modifying existing behavior where practical.
  3. **L**iskov Substitution – Subtypes must behave; we discourage deep inheritance but still honor substitutability.
  4. **I**nterface Segregation – Prefer small role‑based interfaces.
  5. **D**ependency Inversion – Depend on abstractions; inject concrete at edges.

---

## 7. Code as Narrative: Write to Be Understood

Humans read code more than machines execute it.

### 7.1 Naming Is Narrative

Names come from the **Ubiquitous Language**. Signal business intent: `applyLoyaltyDiscount` beats `DoStuff`.

### 7.2 Method == Paragraph

One coherent thought per method. Use whitespace to group steps. Break up long flows.

### 7.3 Reveal Intent, Hide Mechanism

High‑level methods read like prose; details tucked into helpers.

```csharp
var customer = await _customerRepository.FindByIdAsync(customerId);
var order = Order.Create(customer);
var discount = _pricingService.CalculateDiscountFor(customer, order);
order.ApplyDiscount(discount);
await _orderRepository.SaveAsync(order);
```

### 7.4 Comments Explain *Why*, Not *What*

Code shows *what*; comments justify *why* (business quirk, perf hack, vendor bug, regulatory rule).

---

## 8. Documentation & Knowledge Sharing

Documentation ships *with* the code that changes it.

### 8.1 Repo Root Must Contain

- `README.md` – Project purpose, quick start, environment setup.
- Link to this rules doc.
- High‑level architecture diagram (PNG/SVG + source).

### 8.2 Feature‑Level README (Per Slice Folder)

Every feature folder MUST include a `README.md` that follows the template below and is updated in the same PR as feature code changes.

#### Feature README Template

```markdown
# Feature: [Human‑Readable Name]

## 1. Purpose & Business Value
- Why does this feature exist?
- What outcome does it drive?
- Who uses/consumes it?

## 2. Design & Architectural Decisions
- Key patterns (Outbox, State Machine, etc.)
- Sync vs async boundaries
- External dependencies (DB, Service Bus, APIs)

## 3. Implementation Details & Rationale
- Non‑obvious logic
- Query rationale & perf notes
- Security considerations (claims usage, tenancy guards)

## 4. Usage
- Endpoint & verb
- Example request/response JSON
- Error shapes
```

### 8.3 Living Documentation Rule

Docs MUST be updated with the code that changes behavior. Out‑of‑date docs create bugs.

---

## 9. Core Vertical Slice Principles

- **SRP at Feature Level** – One reason to change: the feature’s requirements.
- **High Cohesion** – Endpoint + validation + command/query + models in one folder.
- **Low Coupling** – No direct references across feature folders.
- **Explicit Flows** – Endpoint → Validation → Command/Query → DB → `Result<T>` → HTTP.
- **No Shared DTOs** – Never reuse request/response models across slices (copy if needed).
- **Shared Project Is Cross‑Cutting Only** – infra helpers, logging, DI wiring; *no business logic*.

---

## 10. System Design Philosophy (Scalability, Resilience, Performance)

The following goals guide architectural decisions:

- **Scalability** – Stateless slices; background long‑running work; efficient data access.
- **Fault Tolerance** – Use `Result<T>` for expected failures; Outbox for reliable messaging; health checks.
- **Performance** – Dapper for lean DB access; avoid N+1; push heavy work async; apply rate limiting.

---

## 11. Strategic Domain‑Driven Design (DDD)

DDD is applied *where complexity earns it.* CRUD ≠ DDD.

### 11.1 When to Apply

Use DDD patterns when domain rules, invariants, and state transitions are central to business value (e.g., Pricing, Ordering, Scheduling constraints). Skip for trivial data capture (Tags, Lookup tables).

### 11.2 Core Concepts & Rules

1. **Ubiquitous Language** – See §16.
2. **Bounded Context** – Start as single context. Split when terms diverge meaningfully (e.g., SalesProduct vs WarehouseProduct).
3. **Aggregate** – Consistency boundary. External code interacts via the **Aggregate Root** only.
4. **Entity** – Has identity, lifecycle, behavior. Encapsulate state changes behind behavior methods (`ApplyDiscount`), never naked setters.
5. **Value Object** – Immutable, equality by value. See §12.
6. **Domain Events** – Raise events when meaningful state change occurs; dispatch post‑commit via Outbox (§14.2).

---

## 12. Strongly‑Typed Domain Primitives (Value Objects)

Fight **Primitive Obsession**. Validity guaranteed at construction.

### 12.1 Principles

- **MUST** represent domain concepts with types: `CustomerId`, `EmailAddress`, `Money`.
- **Immutable** – Implement as `public sealed record` or `public readonly record struct`.
- **Validate in Ctor** – Throw `ArgumentException` (or domain exception) on invalid input.
- **Expose Underlying Primitive** via `Value` property.
- **No Business Logic** – Represent & validate; domain behavior lives in Entities/Aggregates.

### 12.2 Dapper Integration

Each persisted Value Object requires a `SqlMapper.TypeHandler<T>`.

```csharp
public sealed class ProductIdTypeHandler : SqlMapper.TypeHandler<ProductId>
{
    public override ProductId Parse(object value) => new((Guid)value);
    public override void SetValue(IDbDataParameter parameter, ProductId value) => parameter.Value = value.Value;
}

// Program.cs startup
SqlMapper.AddTypeHandler(new ProductIdTypeHandler());
```

---

## 13. The Result Pattern

All feature logic (Commands & Queries) returns an explicit success/failure contract.

### 13.1 Types

```csharp
public sealed record Error(string Code, string Description);

public sealed record Result<T>
{
    public T? Value { get; }
    public Error? Error { get; }
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;

    private Result(T value) { IsSuccess = true; Value = value; }
    private Result(Error error) { IsSuccess = false; Error = error; }

    public static Result<T> Success(T value) => new(value);
    public static Result<T> Failure(Error error) => new(error);
}
```

### 13.2 Usage Rules

- **Return Type:** `Task<Result<T>>` for all async execute methods. For void semantics use `Result<Success>` marker.
- **Endpoint Mapping:** Only endpoint handlers inspect `Result<T>` and translate to HTTP via §21 mapping rules.
- **Standard Errors:** Provide a `StandardErrors` static catalog (`NotFound`, `Validation`, `Conflict`, `Unauthorized`, etc.).
- **No Exceptions for Expected Outcomes:** Use `Result` for business flows. Reserve exceptions for truly exceptional/unrecoverable faults (DB down, serialization failure).

---

## 14. Design Pattern Usage Guidance

> Patterns are tools. Use only when the problem demands the tool.

### 14.1 General‑Purpose (Use When Needed)

- **Factory Method** – Complex object creation; environment‑dependent provider selection.
- **Strategy** – Swap algorithms/behaviors (pricing modes, tax calculators).

### 14.2 *Mandatory* Patterns for Specific Scenarios

#### 14.2.1 Outbox Pattern (Reliably Publish Side‑Effects)

**Trigger:** A transaction must both change DB state *and* publish an external message/event atomically.

**Implementation Rules:**

1. **Outbox Table** – `outbox_messages(id, type, payload, created_on, processed_on, retries, last_error)`.
2. **Atomic Write** – Business data change + insert outbox row in same DB transaction.
3. **Background Dispatcher** – Durable job (Quartz.NET recommended) reads unprocessed rows, publishes to message broker (Azure Service Bus), marks processed.
4. **Idempotency** – Dispatcher MUST be idempotent; safe to re‑publish if crash occurs pre‑mark.
5. **Poison Handling** – After N retries, move to dead‑letter table/queue + alert.

#### 14.2.2 State Machine Pattern (Complex Lifecycles)

**Trigger:** Entity has ≥3 states with non‑trivial transition rules.

**Implementation Rules:**

- Persist state in dedicated column (e.g., `orders.status`).
- Create sealed `[Entity]StateMachine` encapsulating valid transitions.
- All state changes MUST flow through the state machine.
- Provide `CanTransition` + `Transition` APIs; raise domain events on meaningful transitions.

---

## 15. Cloud Integration & Azure Services

Use managed services where they reduce custom code, cost, or operational risk.

### 15.1 Azure Service Bus

**Use For:** Reliable, ordered, at‑least‑once command/event delivery between services. Preferred Outbox target. **Benefits:** Decoupling, resilience, load leveling, poison queue support.

### 15.2 Azure Event Hubs

**Use For:** High‑throughput telemetry/event ingestion from many producers (IoT, analytics). Not for command messaging.

### 15.3 Azure Functions

**Use For:** Event‑driven, short‑lived tasks (invoice generation, thumbnailing, email senders). Scale independently; pay per execution.

### 15.4 Quick Mapping

| Scenario                   | Service           | Notes                                     |
| -------------------------- | ----------------- | ----------------------------------------- |
| Business event fan‑out     | Service Bus topic | Use Outbox -> topic.                      |
| Firehose telemetry         | Event Hubs        | Partition aware; batch ingest.            |
| Lightweight transformation | Azure Function    | Bind to queue/blob; keep < 5 min runtime. |

---

## 16. Ubiquitous Language & Naming Conventions

Names are business first, technology second.

### 16.1 General Rules

- Use full words. No ambiguous abbreviations (`Customer`, not `Cust` or `UserRec`).
- Prefer domain verbs (`FulfillOrder`, not `UpdateOrderStatus`).
- Align class/property names with domain terms captured in discovery.

### 16.2 Casing Rules

- **C#** – `PascalCase` types, `camelCase` locals/params.
- **PostgreSQL** – `snake_case` table/column names; plural table names.

### 16.3 Mapping Examples

| Layer     | Naming        | Example                                                  |
| --------- | ------------- | -------------------------------------------------------- |
| C# Model  | PascalCase    | `public sealed record CustomerOrder(DateTime OrderDate)` |
| DB Table  | plural\_snake | `customer_orders`                                        |
| DB Column | snake\_case   | `order_date`                                             |

---

## 17. Project Structure

Feature folder names: `[Entity][Action]` (verb is business action).

```
/src
├── Api/
│   ├── Features/
│   │   ├── GetProductById/
│   │   │   ├── GetProductByIdEndpoint.cs
│   │   │   ├── GetProductByIdQuery.cs
│   │   │   └── ProductResponse.cs
│   │   ├── CreateCustomerOrder/
│   │   │   ├── CreateCustomerOrderEndpoint.cs
│   │   │   ├── CreateCustomerOrderCommand.cs
│   │   │   └── CreateCustomerOrderRequest.cs
│   │   └── ... more slices ...
│   ├── Shared/
│   │   ├── Data/
│   │   ├── Results/
│   │   ├── Validation/
│   │   └── ... (cross‑cutting infra ONLY)
│   ├── Api.http
│   ├── appsettings.json
│   └── Program.cs
└── ...
```

---

## 18. Vertical Slice Architecture Rules (Detailed)

1. **Isolated Slices** – All feature artifacts collocated (endpoint, request/response models, validators, command/query, mapping, tests).
2. **No Cross‑Slice References** – Communicate across slices via DB state, domain events, or shared *infra* abstractions (logging, time provider) – never via direct call to another feature class.
3. **No Shared Request/Response Models** – Even if identical today; they WILL diverge.
4. **Feature‑Specific Data Access** – Inline SQL per slice tuned for that slice’s needs; no generic repositories.
5. **Shared Project Restrictions** – Cross‑cutting utilities only: DB connection factory, exception middleware, logging, auth helpers, clock, Result pattern, error catalog. *Never* put domain or slice logic here.
6. **Request Flow Contract** – **Endpoint → Validation → Command/Query → DB → Result**** → HTTP**. Nothing else.

---

## 19. Validation Rules

Validation is explicit and happens *before* calling business logic.

### 19.1 Tooling

**Preferred:** FluentValidation (or custom minimal validator interface) registered per slice. Validators live *inside* the slice folder.

### 19.2 Types of Validation

| Type          | Where           | Purpose                                         |
| ------------- | --------------- | ----------------------------------------------- |
| Syntactic     | Validator       | Shape, required fields, formats (email, length) |
| Semantic      | Command/Query   | Cross‑field, domain rule (discount <= total)    |
| Authorization | Endpoint/Filter | Caller allowed? Claims/roles/tenant match?      |

### 19.3 Rule Enforcement

- Endpoint MUST NOT call business logic if validation fails.
- Validation failures return `Result<T>.Failure(StandardErrors.Validation)`; map to `400 Bad Request` with details.

---

## 20. Background Processing & Asynchronous Operations

Keep API responsive; move long or unreliable work off request thread.

### 20.1 When to Background

Move to background if ANY true:

- Operation not guaranteed < 500 ms.
- Client need not wait for result to consider request successful.
- External system reliability uncertain; requires retries/backoff.

### 20.2 Approved Approaches

| Approach                              | Durability                     | Use For                                            |
| ------------------------------------- | ------------------------------ | -------------------------------------------------- |
| In‑Memory Queue + `BackgroundService` | None (process loss on restart) | Low importance, dev/test, telemetry nits.          |
| Quartz.NET (DB backed)                | Durable                        | Critical retries, scheduled jobs, Outbox dispatch. |
| Azure Functions (Queue Trigger)       | Cloud durable                  | Cross‑service workflows, large fan‑out.            |

---

## 21. Error Handling, Problem Details & Logging Contracts

Consistent error shape improves DX & observability.

### 21.1 HTTP Mapping Matrix

| Result           | HTTP                               | Body                           |
| ---------------- | ---------------------------------- | ------------------------------ |
| Success w/ value | 200 OK (or 201 Created for create) | Value                          |
| Success no value | 204 No Content                     | —                              |
| NotFound         | 404 Not Found                      | ProblemDetails w/ error code   |
| Validation       | 400 Bad Request                    | ValidationProblemDetails       |
| Conflict         | 409 Conflict                       | ProblemDetails                 |
| Unauthorized     | 401 Unauthorized                   | ProblemDetails                 |
| Forbidden        | 403 Forbidden                      | ProblemDetails                 |
| Unexpected       | 500 Internal Server Error          | ProblemDetails; correlation id |

### 21.2 Problem Details Contract

Adopt RFC 9457 `application/problem+json` shape. Include:

- `type` (URI or internal code link)
- `title`
- `status`
- `detail`
- `instance` (trace id / correlation id)
- `errorCode` (ours; maps to `Error.Code`)
- optional `errors` dictionary for validation

### 21.3 Logging & Correlation

- Every request gets correlation/trace id (W3C TraceContext). Include in logs + error responses.
- Log at boundaries: request start, validation failure, business error, DB error, outbound integration call.
- **Never log secrets or PII** unless masked.

---

## 22. API Evolution & Versioning Strategy

Non‑breaking by default; version when required.

### 22.1 Non‑Breaking Allowed Within Same Version (e.g., v1)

- Add new **endpoints**.
- Add new **optional** response fields.
- Add new **optional** query params.
- Add new **optional** request fields defaulted by server.

### 22.2 Breaking (Requires New Version)

- Remove/rename property.
- Change property type.
- Add new **required** request field.
- Change meaning of existing field.
- Remove/rename endpoint.

### 22.3 Versioning Mechanics

- Path based: `/api/v{n}/...`.
- Deprecated versions remain supported ≥ *TBD (e.g., 6 months)* after announcing new version.
- Provide compatibility tests to ensure old clients still work.

---

## 23. API Documentation & Manual Testing Artifacts

### 23.1 Swagger / OpenAPI

- **MUST** generate OpenAPI v3 via Swashbuckle.
- Use `.WithSummary()`, `.WithDescription()`, `.WithTags()`.
- Use `[ProducesResponseType]` for all status codes.
- XML `<summary>` comments required on public models & properties.

### 23.2 Central HTTP Scratch File

Maintain `Api.http` at repo root for manual requests.

- Use `@hostname` var.
- Separate calls with `###`.
- Add descriptive comment names.
- Include sample auth token variable.

---

## 24. .NET Minimal API Implementation Rules

### 24.1 Endpoint Registration

Group related endpoints in extension methods (one per feature group) invoked from `Program.cs`.

### 24.2 Dependency Injection

- Use built‑in DI.
- Queries & Commands registered **Scoped**.
- Background services **HostedService/Singleton** as appropriate.

### 24.3 Endpoint Handler Responsibilities (Minimal!)

1. Bind & validate input.
2. Invoke feature `Query` / `Command`.
3. Map `Result<T>` to HTTP per §21.

#### Example

```csharp
app.MapGet("/products/{id}", async (Guid id, GetProductByIdQuery query, CancellationToken ct) =>
{
    var result = await query.ExecuteAsync(id, ct);
    return result.IsSuccess
        ? Results.Ok(result.Value)
        : result.Error!.ToHttpResult(); // extension that maps via §21
});
```

---

## 25. Data Access: Dapper & PostgreSQL

Dapper is **mandatory**; EF Core is **forbidden** in this solution.

### 25.1 SQL Location & Formatting

- No inline ad‑hoc SQL in method bodies.
- Define SQL as `const string` at top of class OR in `.sql` embedded resource loaded once.
- Format multi‑line SQL legibly; align keywords.

### 25.2 Parameterization

- **Always** parameterize via Dapper anonymous objects. No string concatenation building SQL.

### 25.3 Connection Management

- Central `IDbConnectionFactory` in Shared. Opens `NpgsqlConnection`.
- Use `await using` to ensure disposal.
- All operations async: `QueryAsync`, `ExecuteAsync`, etc.

### 25.4 Mapping Value Objects

- Register Dapper type handlers (§12.2).

---

## 26. Database Migrations

### 26.1 Pure SQL Scripts

Migrations are hand‑written SQL.

### 26.2 Version Tracking

`schema_versions` table stores applied migrations (id, applied\_on, checksum).

### 26.3 Naming

`YYYYMMDDHHMMSS_description.sql`

### 26.4 Forward‑Only

Never modify old migration. To undo, write new corrective migration.

---

## 27. Security Baseline

Security is not optional. Anything exposed over a network is hostile territory.

### 27.1 Authentication & Authorization

- All endpoints require auth unless explicitly marked public and reviewed.
- Prefer external identity provider / OpenID Connect (Azure AD, Entra ID, etc.).
- Authorization enforced via policies (role/claim/tenant). No ad‑hoc `if(user.Id==...)` scattered checks.

### 27.2 Input & Data Protection

- Validate all inputs (see §19).
- Apply output encoding when rendering to HTML/email templates.
- Enforce maximum payload sizes to mitigate DoS.

### 27.3 Secrets Management

- No secrets in source. Use environment vars + Azure Key Vault.
- Rotate credentials regularly; automate.

### 27.4 Transport Security

- HTTPS only (redirect HTTP → HTTPS).
- Use HSTS in production.

### 27.5 Data Security / Privacy

- Classify data (PII, financial, internal).
- Encrypt sensitive data at rest if required (column or disk level).
- Minimize PII storage; store identifiers, not raw data, where possible.

### 27.6 Logging Hygiene

- Never log passwords, tokens, or full PII. Mask or hash.
- Redact secrets before structured logging.

### 27.7 Rate Limiting & Abuse Protection

- Apply global & per‑client limits to protect from brute force & cost explosions.

### 27.8 Security Review Gate

Every PR touching auth, crypto, or external exposure requires security review sign‑off.

---

## 28. Observability (Logging, Metrics, Tracing)

If we can’t observe it, we can’t operate it.

### 28.1 Logging

- Structured logging (Serilog or similar).
- Use contextual enrichers: correlation id, user id, tenant id.
- Log levels: Trace (dev), Debug (diagnose), Information (business events), Warning (recoverable anomaly), Error (failed operation), Fatal (process terminating).

### 28.2 Metrics

- Expose Prometheus/OTel counters: request duration, DB latency, queue lag, error rates.
- Feature owners SHOULD define at least one business KPI metric per slice.

### 28.3 Distributed Tracing

- OpenTelemetry instrumentation required for inbound HTTP, outbound DB, queue publish/consume.
- Propagate trace context across boundaries.

---

## 29. Testing Strategy & Quality Gates

Testing proves intent; gates prevent regressions.

### 29.1 Test Pyramid (Target Ratios)

| Level               | Purpose                                     | Ratio Guide |
| ------------------- | ------------------------------------------- | ----------- |
| Unit                | Fast logic checks (entities, value objects) | 60%         |
| Slice / Integration | Feature boundary incl. DB                   | 30%         |
| End‑to‑End          | Minimal happy paths across system           | 10%         |

### 29.2 Required Test Types

- **Value Object Tests** – Construction & validation.
- **Entity Behavior Tests** – State transitions.
- **Slice Integration Tests** – Endpoint → DB using test container (ephemeral Postgres).
- **Contract Tests** – For external integrations / message schemas.
- **Performance Smoke** – Quick latency budget check in CI for hot endpoints.

### 29.3 Test Conventions

- One test project per layer: `Api.Tests.Unit`, `Api.Tests.Slice`, `Api.Tests.E2E`.
- Use deterministic test data builders; no random unless seeded.
- Tests run in parallel unless data conflict; isolate DB schemas.

### 29.4 Coverage & Gates

- Minimum line or branch coverage target (team decides; e.g., 80% of non‑infra code). Coverage report enforced in CI.
- Failing tests block merge.

---

## 30. Performance Budgets & Load Testing

Performance is a feature.

### 30.1 Budgets

- Interactive API calls SHOULD complete < 300 ms P50, < 500 ms P95 under nominal load.
- Background triggers MUST not starve primary request path.

### 30.2 Load Testing Practice

- Scenario‑driven (realistic user ramps).
- Capture AVG, P95, Max per user band (team‑standard bands: 10, 50, 100, 150, 300, peak) – see load test templates.
- Record environment and schema version tested.

### 30.3 Regression Tracking

Store historical load test summaries in `/perf/reports/` and chart trends.

---

## 31. Configuration, Secrets & Environment Management

- Configuration bound to strongly‑typed `Options` classes validated at startup.
- Environment layering: `appsettings.json` < `appsettings.{Environment}.json` < Environment variables < Key Vault.
- Use `IOptionsMonitor<>` only when runtime refresh is required; otherwise `IOptions<>`.

---

## 32. CI/CD Enforcement Hooks

Automation keeps the rules alive.

### 32.1 Pre‑Commit / Pre‑Push

- Dotnet format & analyzers.
- Secret scan.

### 32.2 Pull Request Gates

- Build succeeds.
- Tests pass.
- Lint clean.
- Security scan clean (or exceptions filed).
- Documentation updated (auto check that modified feature folder changed README timestamp?).
- Checklist completed (see §33).

### 32.3 Branch Protections

- Require at least 1 code owner + 1 peer review.
- Block force pushes to main.

---

## 33. Definition of Done Checklist

Attach the following checklist to medium+ PRs. Copy/paste and fill.

```markdown
### Definition of Done – Feature PR
- [ ] Discovery captured (problem, user story, acceptance criteria).
- [ ] Ubiquitous Language applied in names.
- [ ] Vertical Slice folder created/updated (no cross references).
- [ ] Validation implemented (syntactic + semantic).
- [ ] Returns `Result<T>`; mapped to HTTP per §21.
- [ ] Dapper SQL parameterized; no inline string concat.
- [ ] Value Objects / Type Handlers added (if needed).
- [ ] Tests: unit + slice added/updated.
- [ ] Docs: Feature README updated in same PR.
- [ ] Observability: logging + metrics added where meaningful.
- [ ] Security reviewed (authz, PII, secrets).
```

---

# Appendices

## A. Quick Feature README Copy Block

*(See §8.2 for details; this is a copy‑pasteable starter.)*

````markdown
# Feature: <Name>

> Short business friendly description.

## 1. Purpose & Business Value

## 2. Design & Architectural Decisions

## 3. Implementation Details & Rationale

## 4. Usage
- Endpoint: <VERB /path>
- Sample Request:
```json
{}
````

- Sample Response:

```json
{}
```

```

---

## B. Standard Error Codes (Starter)
| Code | Description | HTTP | Notes |
|---|---|---|---|
| `not_found` | Resource not found | 404 | Use when ID valid but entity missing. |
| `validation_failed` | One or more validation errors | 400 | Include validation details. |
| `conflict` | Version / state conflict | 409 | ETag / concurrency violation. |
| `unauthorized` | Missing/invalid auth | 401 | |
| `forbidden` | Authenticated but not allowed | 403 | |
| `unexpected_error` | Unhandled server error | 500 | Include correlation id. |

---

## C. Background Job Reliability Checklist
- Durable storage (DB or queue) configured.
- Idempotent consumer (safe retry).
- Poison message strategy.
- Metrics for backlog & failures.
- Alerting wired.

---

## D. Naming Quick Reference
- Slices: `[Entity][Action]` (e.g., `StudentEnroll`, `OrderPay`).
- Commands: `*Command`.
- Queries: `*Query`.
- Endpoint class: `*Endpoint`.
- Requests/Responses: `*Request`, `*Response`.
- Validator: `*Validator`.
- Value Object: `<Name>Id`, `<Name>Code`, etc.

---

## E. Changelog
- **2025-07-16** – Major restructure; added normative keywords; filled Security, Observability, Testing, Validation sections; clarified Result pattern; introduced DoD checklist; corrected cross‑references; added ProblemDetails mapping.
- **2025-07-15** – Original draft imported.

---

> Questions? Open a discussion in the Architecture channel or tag @Petar.

```
