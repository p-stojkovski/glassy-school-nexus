import React from 'react';
import { Edit2, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

/**
 * Props for EditableSectionWrapper
 */
export interface EditableSectionWrapperProps {
  /** Section title displayed in the header */
  title: string;
  /** Optional icon to display next to the title */
  icon?: React.ReactNode;
  /** Whether this section is currently in edit mode */
  isEditing: boolean;
  /** Whether a save operation is in progress */
  isSaving?: boolean;
  /** Callback when the Edit button is clicked */
  onEdit: () => void;
  /** Callback when the Save button is clicked */
  onSave: () => void;
  /** Callback when the Cancel button is clicked */
  onCancel: () => void;
  /** Whether the section is expanded (for collapsible behavior) */
  isExpanded?: boolean;
  /** Callback when expand/collapse is toggled */
  onExpandedChange?: (expanded: boolean) => void;
  /** Optional subtitle for incomplete sections */
  subtitle?: string;
  /** Whether this section has complete data (affects styling) */
  isComplete?: boolean;
  /** The content to render inside the section */
  children: React.ReactNode;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * EditableSectionWrapper - Shared wrapper for editable sections
 *
 * Provides:
 * - Collapsible header with title, icon, and Edit/Save/Cancel buttons
 * - Glass morphism styling consistent with existing UI
 * - Loading state during save operations
 * - Visual distinction for edit mode
 *
 * @example
 * ```tsx
 * <EditableSectionWrapper
 *   title="Teacher Information"
 *   icon={<User className="h-5 w-5" />}
 *   isEditing={isEditing('personal')}
 *   isSaving={isSaving}
 *   onEdit={() => requestEditSection('personal')}
 *   onSave={handleSave}
 *   onCancel={handleCancel}
 * >
 *   {isEditing ? <PersonalInfoForm /> : <PersonalInfoDisplay />}
 * </EditableSectionWrapper>
 * ```
 */
export const EditableSectionWrapper: React.FC<EditableSectionWrapperProps> = ({
  title,
  icon,
  isEditing,
  isSaving = false,
  onEdit,
  onSave,
  onCancel,
  isExpanded = true,
  onExpandedChange,
  subtitle,
  isComplete = true,
  children,
  className,
}) => {
  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={onExpandedChange}
      className={cn(
        'rounded-xl border transition-colors bg-white/[0.03]',
        isEditing ? 'border-primary/50 ring-1 ring-primary/20' : 'border-white/10',
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <CollapsibleTrigger className="flex items-center gap-2 text-white hover:text-white/80 transition-colors flex-1">
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              !isExpanded && '-rotate-90'
            )}
          />
          {icon && <span className="text-white/60">{icon}</span>}
          <div className="flex flex-col text-left">
            <span className="font-medium">{title}</span>
            {subtitle && !isComplete && (
              <span className="text-xs text-white/60 mt-0.5">{subtitle}</span>
            )}
          </div>
        </CollapsibleTrigger>

        <div className="flex items-center gap-2 ml-4">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={isSaving}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onSave}
                disabled={isSaving}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold gap-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Prevent collapsible toggle
                onEdit();
              }}
              className="border-white/30 bg-white/10 hover:bg-white/20 text-white gap-1"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <CollapsibleContent>
        <div className="px-4 pb-4">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default EditableSectionWrapper;
