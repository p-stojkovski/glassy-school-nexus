# Teachers Domain - Salary Calculation Detail Page

> The `/teachers/:id/salary-calculations/:calcId` route for viewing individual salary calculation details.

**Parent:** [../CLAUDE.md](../CLAUDE.md)

## Directory Structure

```
salary-calculation-detail-page/
├── CLAUDE.md                               # This file
├── index.ts                                # Barrel exports
├── SalaryCalculationDetailPage.tsx         # Main page component
├── components/
│   ├── index.ts
│   ├── SalaryCalculationHeader.tsx         # Header with status, actions
│   ├── SalaryCalculationSummary.tsx        # Summary cards
│   ├── SalaryCalculationBreakdown.tsx      # Per-class breakdown table
│   └── SalaryCalculationAuditLog.tsx       # Change history timeline
└── hooks/
    ├── index.ts
    ├── useTeacherSalaryCalculationDetailPage.ts  # Page state management
    └── useSalaryCalculationAuditLog.ts     # Audit log data hook
```

## Page Layout

```
┌─────────────────────────────────────────────────────────┐
│ Breadcrumb: Teachers > John Doe > Salary > Jan 2024     │
├─────────────────────────────────────────────────────────┤
│ Header: Period, Status Badge, Actions (Approve/Reopen)  │
├─────────────────────────────────────────────────────────┤
│ Summary Cards: Calculated | Approved | Status | Date    │
├─────────────────────────────────────────────────────────┤
│ Breakdown Table: Class | Lessons | Students | Rate | $  │
├─────────────────────────────────────────────────────────┤
│ Audit Log: Timeline of all changes                      │
└─────────────────────────────────────────────────────────┘
```

## Key Components

### SalaryCalculationHeader
Displays period dates, status badge, and action buttons.

```typescript
<SalaryCalculationHeader
  calculation={calculation}
  onApprove={handleOpenApproveDialog}
  onReopen={handleOpenReopenDialog}
  isApproving={isApproving}
  isReopening={isReopening}
/>
```

**Actions by Status:**
| Status | Available Actions |
|--------|-------------------|
| `pending` | Approve |
| `approved` | Reopen |
| `reopened` | Approve |

### SalaryCalculationSummary
Four summary cards showing key metrics.

| Card | Value |
|------|-------|
| Calculated Amount | Original calculated total |
| Approved Amount | Final approved amount (or "Pending") |
| Status | Current status badge |
| Created Date | When calculation was generated |

### SalaryCalculationBreakdown
Table showing per-class breakdown.

| Column | Description |
|--------|-------------|
| Class | Class name |
| Lessons | Number of lessons taught |
| Students | Active student count |
| Rate | Rate per lesson applied |
| Amount | Subtotal for this class |

**Note:** When tiered rates apply, multiple rows per class may appear (one per student count tier).

### SalaryCalculationAuditLog
Timeline of all changes to the calculation.

```typescript
// Audit log entries
interface SalaryAuditLog {
  id: string;
  action: 'created' | 'approved' | 'adjusted' | 'reopened' | 'recalculated';
  previousAmount: number | null;
  newAmount: number | null;
  reason: string | null;
  createdAt: string;
}
```

## Key Hooks

### useTeacherSalaryCalculationDetailPage
Primary hook for page state management.

```typescript
const {
  calculation,           // SalaryCalculationDetail
  isLoading,            // Initial load
  error,                // Fetch error

  // Approve flow
  isApproving,          // Approve in progress
  approveCalculation,   // (amount, reason?) => Promise

  // Reopen flow
  isReopening,          // Reopen in progress
  reopenCalculation,    // (reason) => Promise

  // Navigation
  navigateBack,         // Return to teacher salary tab
} = useTeacherSalaryCalculationDetailPage();
```

### useSalaryCalculationAuditLog
Fetches and manages audit log data.

```typescript
const {
  auditLogs,            // SalaryAuditLog[]
  isLoading,
  error,
  refresh,              // Refetch audit log
} = useSalaryCalculationAuditLog(calculationId);
```

## Workflow States

```
               ┌─────────┐
     Generate  │ pending │
               └────┬────┘
                    │
              Approve (with optional adjustment)
                    │
                    v
               ┌──────────┐
               │ approved │
               └────┬─────┘
                    │
              Reopen (requires reason)
                    │
                    v
               ┌──────────┐
               │ reopened │ ──→ Can be approved again
               └──────────┘
```

## API Endpoints Used

| Action | Endpoint | Method |
|--------|----------|--------|
| Load Detail | `/api/teachers/:id/salary-calculations/:calcId` | GET |
| Approve | `/api/teachers/:id/salary-calculations/:calcId/approve` | POST |
| Reopen | `/api/teachers/:id/salary-calculations/:calcId/reopen` | POST |
| Audit Log | (included in detail response) | - |

## Approve Dialog Logic

```typescript
// ApproveSalaryDialog.tsx
const schema = z.object({
  approvedAmount: z.number().min(0),
  adjustmentReason: z.string().min(10).optional(),
});

// Reason required only when amount differs
if (approvedAmount !== calculatedAmount && !adjustmentReason) {
  return 'Reason required when adjusting amount';
}
```

## Reopen Dialog Logic

```typescript
// ReopenSalaryDialog.tsx
const schema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

// Reason always required for reopening
```

## Anti-Patterns

| Wrong | Correct |
|-------|---------|
| Allow approve without reason when adjusting | Require reason if amount changed |
| Skip audit log display | Always show audit trail |
| Hard-code status badge colors | Use status-based styling |
| Reload full page after action | Update Redux state, refresh component |

## Related Documentation

- **Domain Overview:** [../CLAUDE.md](../CLAUDE.md)
- **Detail Page Salary Tab:** [../detail-page/CLAUDE.md](../detail-page/CLAUDE.md)
- **Salary Types:** [../_shared/CLAUDE.md](../_shared/CLAUDE.md)
