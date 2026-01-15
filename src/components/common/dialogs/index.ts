/**
 * Standard Dialog System
 *
 * Unified dialog components with semantic intents for consistent UX.
 *
 * Three dialog types:
 * - ConfirmDialog: Yes/No confirmations (no children)
 * - ActionDialog: Form-based actions (children required)
 * - AlertDialog: Single-button notifications
 *
 * Intent system:
 * - primary: Create, Edit, Generate, Save (yellow)
 * - success: Approve, Enable, Complete (green)
 * - danger: Delete, Remove permanently (red)
 * - warning: Disable, Archive, Reopen (orange)
 */

export { ConfirmDialog } from './ConfirmDialog';
export type { ConfirmDialogProps } from './ConfirmDialog';

export { ActionDialog } from './ActionDialog';
export type { ActionDialogProps } from './ActionDialog';

export { AlertDialog } from './AlertDialog';
export type { AlertDialogProps } from './AlertDialog';

export { UnsavedChangesDialog } from './UnsavedChangesDialog';
export type { UnsavedChangesDialogProps } from './UnsavedChangesDialog';

export type { DialogIntent } from './_internal/dialogIntents';
export type { DialogSize } from './_internal/DialogShell';
