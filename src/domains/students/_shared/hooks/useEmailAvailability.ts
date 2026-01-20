import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

/**
 * Function signature for email availability check API calls.
 * Works with both Students and Teachers domains.
 */
type EmailCheckFn = (email: string, excludeId?: string) => Promise<boolean>;

export interface UseEmailAvailabilityOptions {
  /** Current email value from form (watched) */
  emailValue: string | undefined;
  /** Original email for edit mode - skip check if unchanged */
  originalEmail?: string;
  /** Entity ID to exclude from uniqueness check (edit mode) */
  excludeId?: string;
  /** API function to check email availability */
  checkEmailFn: EmailCheckFn;
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
}

export interface UseEmailAvailabilityResult {
  /** Whether email check API call is in progress */
  isChecking: boolean;
  /** Result: true=available, false=taken, null=not yet checked */
  isAvailable: boolean | null;
  /** Error message if API call failed */
  error: string | null;
  /** The debounced email value */
  debouncedEmail: string;
  /** Whether email differs from original (should show availability UI) */
  shouldShowAvailability: boolean;
}

/**
 * Reusable hook for email availability checking with debouncing.
 *
 * Features:
 * - Debounced API calls (300ms default)
 * - Skips check if email unchanged from original (edit mode)
 * - Deduplication via lastCheckedKey (prevents duplicate requests)
 * - Cleanup on unmount (isMounted pattern)
 * - Generic checkEmailFn works for Students, Teachers, or any domain
 *
 * @example
 * ```typescript
 * const { isChecking, isAvailable, shouldShowAvailability } = useEmailAvailability({
 *   emailValue: form.watch('email'),
 *   originalEmail: student?.email,
 *   excludeId: student?.id,
 *   checkEmailFn: checkStudentEmailAvailable,
 * });
 * ```
 */
export const useEmailAvailability = ({
  emailValue,
  originalEmail = '',
  excludeId,
  checkEmailFn,
  debounceMs = 300,
}: UseEmailAvailabilityOptions): UseEmailAvailabilityResult => {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debouncedEmail = useDebounce(emailValue || '', debounceMs);
  const lastCheckedKeyRef = useRef<string | null>(null);

  // Normalize emails for comparison
  const trimmedEmail = (debouncedEmail || '').trim().toLowerCase();
  const trimmedOriginal = (originalEmail || '').trim().toLowerCase();

  // Should show availability UI when email differs from original
  const shouldShowAvailability = !!trimmedEmail && trimmedEmail !== trimmedOriginal;

  useEffect(() => {
    let isMounted = true;

    // Clear previous state on email change
    setIsAvailable(null);
    setError(null);

    // No email provided
    if (!trimmedEmail) {
      setIsChecking(false);
      return;
    }

    // Email unchanged from original (edit mode) - consider it available
    if (trimmedEmail === trimmedOriginal) {
      setIsChecking(false);
      setIsAvailable(true);
      return;
    }

    // Deduplicate: skip if already checked this exact combination
    const checkKey = `${trimmedEmail}-${excludeId || 'new'}`;
    if (lastCheckedKeyRef.current === checkKey) {
      return;
    }

    // Perform the availability check
    (async () => {
      try {
        setIsChecking(true);
        const available = await checkEmailFn(trimmedEmail, excludeId);

        if (!isMounted) return;

        setIsAvailable(available);
        lastCheckedKeyRef.current = checkKey;
      } catch (err: unknown) {
        if (!isMounted) return;

        const message = err instanceof Error ? err.message : 'Failed to check email availability';
        setError(message);
        setIsAvailable(null);
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [trimmedEmail, trimmedOriginal, excludeId, checkEmailFn]);

  return {
    isChecking,
    isAvailable,
    error,
    debouncedEmail,
    shouldShowAvailability,
  };
};
