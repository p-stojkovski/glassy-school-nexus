# Standard Dialog System - Usage Examples

## Import Statement

```typescript
import { ConfirmDialog, ActionDialog, AlertDialog } from '@/components/common/dialogs';
import { Trash2, Plus, CheckCircle } from 'lucide-react';
```

## ConfirmDialog - Delete Example

```typescript
<ConfirmDialog
  open={showDelete}
  onOpenChange={setShowDelete}
  intent="danger"
  icon={Trash2}
  title="Delete Item"
  description="This action cannot be undone."
  confirmText="Delete"
  onConfirm={handleDelete}
  isLoading={isDeleting}
/>
```

## ActionDialog - Create Form Example

```typescript
<ActionDialog
  open={showCreate}
  onOpenChange={setShowCreate}
  intent="primary"
  icon={Plus}
  title="Create Item"
  confirmText="Create"
  onConfirm={form.handleSubmit(handleSubmit)}
  isLoading={isCreating}
>
  <Form {...form}>
    <FormField name="name" />
  </Form>
</ActionDialog>
```

## AlertDialog - Success Example

```typescript
<AlertDialog
  open={showSuccess}
  onOpenChange={setShowSuccess}
  intent="success"
  icon={CheckCircle}
  title="Success"
  description="Operation completed successfully."
/>
```

## Intent Guide

- primary: Create, Edit, Generate, Save (yellow)
- success: Approve, Enable, Complete (green)
- danger: Delete, Remove permanently (red)
- warning: Disable, Archive, Reopen (orange)
